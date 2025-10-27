import { supabase } from '../lib/supabase'

export const storageService = {
  /**
   * Upload de arquivo
   */
  async upload(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
      })

    if (error) throw error
    return data
  },

  /**
   * Upload com sobrescrever
   */
  async uploadOrUpdate(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      })

    if (error) throw error
    return data
  },

  /**
   * Download de arquivo
   */
  async download(bucket: string, path: string) {
    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) throw error
    return data
  },

  /**
   * Obter URL pública
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  /**
   * Criar URL assinada (temporária)
   */
  async createSignedUrl(bucket: string, path: string, expiresIn: number = 60) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) throw error
    return data.signedUrl
  },

  /**
   * Listar arquivos
   */
  async list(bucket: string, path?: string) {
    const { data, error } = await supabase.storage.from(bucket).list(path, {
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) throw error
    return data
  },

  /**
   * Deletar arquivo
   */
  async delete(bucket: string, paths: string[]) {
    const { error } = await supabase.storage.from(bucket).remove(paths)

    if (error) throw error
  },

  /**
   * Mover arquivo
   */
  async move(bucket: string, fromPath: string, toPath: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath)

    if (error) throw error
  },
}
