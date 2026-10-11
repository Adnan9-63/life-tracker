import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const DEBOUNCE_MS = 1200

const emptyRecord = () => ({
  life_data: {},
  year_data: {},
  habit_labels: Array(10).fill(''),
  birth_date: null,
  user_name: '',
})

// Per-user local cache key so different accounts on the same device/browser
// never see each other's cached data.
const cacheKey = (userId) => `lifeTrackerCache:${userId}`

export function useLifeData(userId) {
  const [record, setRecord] = useState(emptyRecord())
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | saving | synced | offline | error

  const debounceRef = useRef(null)
  const latestRecordRef = useRef(record)
  latestRecordRef.current = record

  // Initial load: try Supabase first, fall back to local cache if offline/error.
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const cached = localStorage.getItem(cacheKey(userId))
      const cachedRecord = cached ? JSON.parse(cached) : null

      try {
        const { data, error } = await supabase
          .from('life_tracker_data')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (error) throw error

        if (!cancelled) {
          if (data) {
            const remote = {
              life_data: data.life_data ?? {},
              year_data: data.year_data ?? {},
              habit_labels: data.habit_labels ?? Array(10).fill(''),
              birth_date: data.birth_date ?? null,
              user_name: data.user_name ?? '',
            }
            setRecord(remote)
            localStorage.setItem(cacheKey(userId), JSON.stringify(remote))
          } else if (cachedRecord) {
            // No row yet remotely (new device/account edge case) but we have
            // local data — push it up so nothing is lost.
            setRecord(cachedRecord)
            await supabase.from('life_tracker_data').upsert({ user_id: userId, ...cachedRecord })
          }
          setSyncStatus('synced')
        }
      } catch {
        // Offline or request failed — fall back to local cache so the app
        // still works without a connection.
        if (!cancelled) {
          if (cachedRecord) setRecord(cachedRecord)
          setSyncStatus('offline')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const persist = useCallback(async (nextRecord) => {
    if (!userId) return
    localStorage.setItem(cacheKey(userId), JSON.stringify(nextRecord))
    setSyncStatus('saving')
    try {
      const { error } = await supabase
        .from('life_tracker_data')
        .upsert({ user_id: userId, ...nextRecord, updated_at: new Date().toISOString() })
      if (error) throw error
      setSyncStatus('synced')
      return true
    } catch {
      setSyncStatus('offline')
      return false
    }
  }, [userId])

  const scheduleSave = useCallback((nextRecord) => {
    setRecord(nextRecord)
    localStorage.setItem(cacheKey(userId), JSON.stringify(nextRecord))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => persist(nextRecord), DEBOUNCE_MS)
  }, [userId, persist])

  // Retry a pending save as soon as the browser regains connectivity.
  useEffect(() => {
    const handleOnline = () => {
      if (syncStatus === 'offline') persist(latestRecordRef.current)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncStatus, persist])

  const setLifeData = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(latestRecordRef.current.life_data) : updater
    scheduleSave({ ...latestRecordRef.current, life_data: next })
  }, [scheduleSave])

  const setYearData = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(latestRecordRef.current.year_data) : updater
    scheduleSave({ ...latestRecordRef.current, year_data: next })
  }, [scheduleSave])

  const setHabitLabels = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(latestRecordRef.current.habit_labels) : updater
    scheduleSave({ ...latestRecordRef.current, habit_labels: next })
  }, [scheduleSave])

  const setBirthDate = useCallback((value) => {
    scheduleSave({ ...latestRecordRef.current, birth_date: value })
  }, [scheduleSave])

  const setUserName = useCallback((value) => {
    scheduleSave({ ...latestRecordRef.current, user_name: value })
  }, [scheduleSave])

  // Bulk replace, used by JSON import.
  const replaceAll = useCallback((next) => {
    scheduleSave({
      life_data: next.life_data ?? {},
      year_data: next.year_data ?? {},
      habit_labels: next.habit_labels ?? Array(10).fill(''),
      birth_date: next.birth_date ?? null,
      user_name: next.user_name ?? '',
    })
  }, [scheduleSave])

  // Flush any pending edit to the cloud, drop the local cache, then reload
  // so the app re-fetches a fresh copy from Supabase.
  const clearLocalCache = useCallback(async () => {
    clearTimeout(debounceRef.current)
    if (!(await persist(latestRecordRef.current))) return false
    localStorage.removeItem(cacheKey(userId))
    window.location.reload()
  }, [userId, persist])

  return {
    lifeData: record.life_data,
    yearData: record.year_data,
    habitLabels: record.habit_labels,
    birthDate: record.birth_date || '',
    userName: record.user_name || '',
    setLifeData,
    setYearData,
    setHabitLabels,
    setBirthDate,
    setUserName,
    replaceAll,
    clearLocalCache,
    loading,
    syncStatus,
  }
}
