import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Hook para fazer queries no Supabase com loading e error states
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data, error } = await queryFn()

        if (error) {
          setError(error)
        } else {
          setData(data)
        }
      } catch (err) {
        console.error('Query error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error, refetch: () => {} }
}

/**
 * Hook para fazer realtime subscription
 */
export function useSupabaseSubscription<T>(
  table: string,
  callback: (payload: T) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback(payload as T)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback])
}
