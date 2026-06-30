import { useRef, useEffect, useState } from 'react'
import { Renderer, Program, Triangle, Mesh } from 'ogl'

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1]
}

const originToFlip = (origin: string): [number, number] => {
  switch (origin) {
    case 'top-left':     return [1, 0]
    case 'bottom-right': return [0, 1]
    case 'bottom-left':  return [1, 1]
    default:             return [0, 0]
  }
}

interface SideRaysProps {
  speed?: number
  rayColor1?: string
  rayColor2?: string
  intensity?: number
  spread?: number
  origin?: string
  tilt?: number
  saturation?: number
  blend?: number
  falloff?: number
  opacity?: number
  className?: string
}

export default function SideRays({
  speed = 2.5,
  rayColor1 = '#EAB308',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = '',
}: SideRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniformsRef = useRef<Record<string, { value: number | number[] }> | null>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const meshRef = useRef<Mesh | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    observerRef.current = new IntersectionObserver(
      (entries) => setIsVisible(entries[0].isIntersecting),
      { threshold: 0.1 }
    )
    observerRef.current.observe(containerRef.current)
    return () => observerRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current) return
    cleanupRef.current?.()
    cleanupRef.current = null

    const init = async () => {
      if (!containerRef.current) return
      await new Promise((r) => setTimeout(r, 10))
      if (!containerRef.current) return

      const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true })
      rendererRef.current = renderer
      const gl = renderer.gl
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      while (containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild)
      containerRef.current.appendChild(gl.canvas)

      const vert = `attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`
      const frag = `precision highp float;
uniform float iTime;uniform vec2 iResolution;uniform float iSpeed;
uniform vec3 iRayColor1;uniform vec3 iRayColor2;
uniform float iIntensity,iSpread,iFlipX,iFlipY,iTilt,iSaturation,iBlend,iFalloff,iOpacity;
float rayStrength(vec2 src,vec2 dir,vec2 coord,float a,float b,float sp){
  vec2 d=coord-src;float c=dot(normalize(d),dir);
  return clamp((.45+.15*sin(c*a+iTime*sp))+(.3+.2*cos(-c*b+iTime*sp)),0.,1.)*
         clamp((iResolution.x-length(d))/iResolution.x,.5,1.);}
void main(){
  vec2 f=gl_FragCoord.xy;
  if(iFlipX>.5)f.x=iResolution.x-f.x;
  if(iFlipY>.5)f.y=iResolution.y-f.y;
  vec2 coord=vec2(f.x,iResolution.y-f.y);
  vec2 rayPos=vec2(iResolution.x*1.1,-.5*iResolution.y);
  float rad=iTilt*3.14159265/180.;float cs=cos(rad),sn=sin(rad);
  vec2 rel=coord-rayPos;
  vec2 tc=vec2(rel.x*cs-rel.y*sn,rel.x*sn+rel.y*cs)+rayPos;
  float hs=iSpread*.275;
  vec2 d1=normalize(vec2(cos(.785398+hs),sin(.785398+hs)));
  vec2 d2=normalize(vec2(cos(.785398-hs),sin(.785398-hs)));
  vec4 r1=vec4(iRayColor1,1.)*rayStrength(rayPos,d1,tc,36.2214,21.11349,iSpeed);
  vec4 r2=vec4(iRayColor2,1.)*rayStrength(rayPos,d2,tc,22.3991,18.0234,iSpeed*.2);
  vec4 color=r1*(1.-iBlend)*.9+r2*iBlend*.9;
  float dist=length(f-vec2(rayPos.x,iResolution.y-rayPos.y))/iResolution.y;
  float brightness=iIntensity*.4/pow(max(dist,.001),iFalloff);
  color.rgb*=brightness;
  float gray=dot(color.rgb,vec3(.299,.587,.114));
  color.rgb=mix(vec3(gray),color.rgb,iSaturation);
  color.a=max(color.r,max(color.g,color.b))*iOpacity;
  gl_FragColor=color;}`

      const [flipX, flipY] = originToFlip(origin)
      const uniforms: Record<string, { value: number | number[] }> = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) },
        iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity },
        iSpread: { value: spread },
        iFlipX: { value: flipX },
        iFlipY: { value: flipY },
        iTilt: { value: tilt },
        iSaturation: { value: saturation },
        iBlend: { value: blend },
        iFalloff: { value: falloff },
        iOpacity: { value: opacity },
      }
      uniformsRef.current = uniforms

      const geometry = new Triangle(gl)
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms })
      const mesh = new Mesh(gl, { geometry, program })
      meshRef.current = mesh

      const resize = () => {
        if (!containerRef.current || !renderer) return
        renderer.dpr = Math.min(window.devicePixelRatio, 2)
        const { clientWidth: w, clientHeight: h } = containerRef.current
        renderer.setSize(w, h)
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr]
      }

      const loop = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return
        uniforms.iTime.value = t * 0.001
        try {
          renderer.render({ scene: mesh })
          animationIdRef.current = requestAnimationFrame(loop)
        } catch {}
      }

      window.addEventListener('resize', resize)
      resize()
      animationIdRef.current = requestAnimationFrame(loop)

      cleanupRef.current = () => {
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
        window.removeEventListener('resize', resize)
        try {
          const loseCtx = renderer.gl.getExtension('WEBGL_lose_context')
          loseCtx?.loseContext()
          const canvas = renderer.gl.canvas as HTMLCanvasElement
          canvas?.parentNode?.removeChild(canvas)
        } catch {}
        rendererRef.current = null
        uniformsRef.current = null
        meshRef.current = null
      }
    }

    init()
    return () => { cleanupRef.current?.(); cleanupRef.current = null }
  }, [isVisible, speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity])

  useEffect(() => {
    const u = uniformsRef.current
    if (!u) return
    u.iSpeed.value = speed
    u.iRayColor1.value = hexToRgb(rayColor1)
    u.iRayColor2.value = hexToRgb(rayColor2)
    u.iIntensity.value = intensity
    u.iSpread.value = spread
    const [flipX, flipY] = originToFlip(origin)
    u.iFlipX.value = flipX
    u.iFlipY.value = flipY
    u.iTilt.value = tilt
    u.iSaturation.value = saturation
    u.iBlend.value = blend
    u.iFalloff.value = falloff
    u.iOpacity.value = opacity
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none', overflow: 'hidden' }}
    />
  )
}
