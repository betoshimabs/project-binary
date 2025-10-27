import { supabase } from '../lib/supabase'

export const databaseService = {
  /**
   * Buscar todos os registros de uma tabela
   */
  async getAll<T>(table: string) {
    const { data, error } = await supabase.from(table).select('*')

    if (error) throw error
    return data as T[]
  },

  /**
   * Buscar registro por ID
   */
  async getById<T>(table: string, id: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as T
  },

  /**
   * Criar novo registro
   */
  async create<T>(table: string, record: Partial<T>) {
    const { data, error } = await supabase
      .from(table)
      // @ts-ignore - Generic type workaround for Supabase
      .insert(record)
      .select()
      .single()

    if (error) throw error
    return data as T
  },

  /**
   * Atualizar registro
   */
  async update<T>(table: string, id: string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(table)
      // @ts-ignore - Generic type workaround for Supabase
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as T
  },

  /**
   * Deletar registro
   */
  async delete(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) throw error
  },

  /**
   * Query customizada
   */
  async query<T>(
    table: string,
    options?: {
      select?: string
      filter?: { column: string; value: unknown }[]
      order?: { column: string; ascending?: boolean }
      limit?: number
    }
  ) {
    let query = supabase.from(table).select(options?.select || '*')

    // Aplicar filtros
    if (options?.filter) {
      options.filter.forEach(({ column, value }) => {
        query = query.eq(column, value as any)
      })
    }

    // Aplicar ordenação
    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true,
      })
    }

    // Aplicar limite
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data as T[]
  },
}
