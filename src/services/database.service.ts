import { supabase } from '../lib/supabase'
import { Database } from '../types/database.types'

type TableName = keyof Database['public']['Tables']

export const databaseService = {
  /**
   * Buscar todos os registros de uma tabela
   */
  async getAll<T>(table: TableName) {
    const { data, error } = await supabase.from(table).select('*')

    if (error) throw error
    return data as T[]
  },

  /**
   * Buscar registro por ID
   */
  async getById<T>(table: TableName, id: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      // @ts-ignore - Supabase type inference issue with dynamic table names
      .eq('id', id)
      .single()

    if (error) throw error
    return data as T
  },

  /**
   * Criar novo registro
   */
  async create<T>(table: TableName, record: Partial<T>) {
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
  async update<T>(table: TableName, id: string, updates: Partial<T>) {
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
  async delete(table: TableName, id: string) {
    // @ts-ignore - Supabase type inference issue with dynamic table names
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) throw error
  },

  /**
   * Query customizada
   */
  async query<T>(
    table: TableName,
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
        // @ts-ignore - Dynamic column name
        query = query.eq(column, value)
      })
    }

    // Aplicar ordenação
    if (options?.order) {
      // @ts-ignore - Dynamic column name
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
