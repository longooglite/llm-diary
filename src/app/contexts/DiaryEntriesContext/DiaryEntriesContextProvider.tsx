'use client'

import { useCallback, useEffect, useState } from 'react'
import DiaryEntriesContext from './DiaryEntriesContext'
import { getEvents } from '@/lib/getEvents'
import { useAuth } from 'react-oidc-context'
import { DiaryEvent } from '@/types'

export const DiaryEntriesContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const auth = useAuth()
  const [diaryEntries, setDiaryEntries] = useState<DiaryEvent[]>([])

  const fetchDiaryEntries = useCallback(async () => {
    if (!auth.user?.access_token) return []
    const events = await getEvents(auth.user.access_token)
    return events
  }, [auth.user?.access_token])

  const forceUpdateEntries = useCallback(async () => {
    const newDiaryEntries = await fetchDiaryEntries()
    setDiaryEntries(newDiaryEntries)
  }, [fetchDiaryEntries])

  useEffect(() => {
    if (auth.isAuthenticated) {
      const updateEntries = async () => {
        const newDiaryEntries = await fetchDiaryEntries()
        setDiaryEntries(newDiaryEntries)
      }
      updateEntries()
    }
  }, [auth.isAuthenticated, fetchDiaryEntries])

  return (
    <DiaryEntriesContext.Provider value={{ diaryEntries, forceUpdateEntries }}>
      {children}
    </DiaryEntriesContext.Provider>
  )
}

export default DiaryEntriesContextProvider
