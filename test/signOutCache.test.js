import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { createServer } from 'vite'

describe('Issue #37 Regression: Clear user cache on logout', () => {
  let clearUserCache

  beforeEach(() => {
    const store = new Map()
    globalThis.localStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
      get length() {
        return store.size
      },
      key: (i) => Array.from(store.keys())[i] ?? null,
    }
  })

  test('clears user-specific lifeTrackerCache on logout', async () => {
    if (!clearUserCache) {
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
      const server = await createServer({ configFile: false })
      const mod = await server.ssrLoadModule('./src/context/AuthContext.jsx')
      clearUserCache = mod.clearUserCache
      await server.close()
    }

    const userId = 'user-abc-123'
    const cacheKey = `lifeTrackerCache:${userId}`
    const personalJournalData = JSON.stringify({
      user_name: 'Adnan',
      birth_date: '2000-01-01',
      life_data: { 'week-1': { score: 5, notes: 'Private journal' } },
    })

    localStorage.setItem(cacheKey, personalJournalData)
    assert.equal(localStorage.getItem(cacheKey), personalJournalData)

    clearUserCache(userId)

    assert.equal(localStorage.getItem(cacheKey), null)
  })

  test('preserves unrelated localStorage keys and other users cache entries', async () => {
    if (!clearUserCache) {
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
      const server = await createServer({ configFile: false })
      const mod = await server.ssrLoadModule('./src/context/AuthContext.jsx')
      clearUserCache = mod.clearUserCache
      await server.close()
    }

    const currentUserId = 'user-current'
    const otherUserId = 'user-other'

    localStorage.setItem(`lifeTrackerCache:${currentUserId}`, '{"life_data": "current"}')
    localStorage.setItem(`lifeTrackerCache:${otherUserId}`, '{"life_data": "other"}')
    localStorage.setItem('theme_preference', 'dark')
    localStorage.setItem('cookie_consent', 'true')

    clearUserCache(currentUserId)

    assert.equal(localStorage.getItem(`lifeTrackerCache:${currentUserId}`), null)
    assert.equal(localStorage.getItem(`lifeTrackerCache:${otherUserId}`), '{"life_data": "other"}')
    assert.equal(localStorage.getItem('theme_preference'), 'dark')
    assert.equal(localStorage.getItem('cookie_consent'), 'true')
  })

  test('handles logout gracefully when no cache entry exists', async () => {
    if (!clearUserCache) {
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
      const server = await createServer({ configFile: false })
      const mod = await server.ssrLoadModule('./src/context/AuthContext.jsx')
      clearUserCache = mod.clearUserCache
      await server.close()
    }

    assert.doesNotThrow(() => {
      clearUserCache('user-without-cache')
    })
  })

  test('handles missing or undefined userId gracefully without throwing', async () => {
    if (!clearUserCache) {
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
      const server = await createServer({ configFile: false })
      const mod = await server.ssrLoadModule('./src/context/AuthContext.jsx')
      clearUserCache = mod.clearUserCache
      await server.close()
    }

    localStorage.setItem('existing_key', 'val')
    assert.doesNotThrow(() => {
      clearUserCache(undefined)
      clearUserCache(null)
      clearUserCache('')
    })
    assert.equal(localStorage.getItem('existing_key'), 'val')
  })

  test('handles localStorage exceptions without failing logout', async () => {
    if (!clearUserCache) {
      process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
      const server = await createServer({ configFile: false })
      const mod = await server.ssrLoadModule('./src/context/AuthContext.jsx')
      clearUserCache = mod.clearUserCache
      await server.close()
    }

    globalThis.localStorage.removeItem = () => {
      throw new Error('SecurityError: Access to localStorage is denied')
    }

    assert.doesNotThrow(() => {
      clearUserCache('user-restricted')
    })
  })
})
