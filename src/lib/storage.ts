import { isSupabaseConfigured, getSupabase } from './supabase'

export async function uploadProfileImage(
  userId: string,
  file: File,
  kind: 'avatar' | 'banner',
): Promise<string | null> {
  if (!isSupabaseConfigured) return null

  const supabase = getSupabase()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${kind}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) {
    console.error('Erro ao fazer upload:', error)
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadImage(
  file: File,
  bucket: string,
  folder: string,
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    return URL.createObjectURL(file)
  }

  const supabase = getSupabase()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) {
    console.error('Erro ao fazer upload:', error)
    return URL.createObjectURL(file)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
