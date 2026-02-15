'use client'

import { useCallback, useEffect, useState } from 'react'
import DiaryEntriesContext from './DiaryEntriesContext'

export const DiaryEntriesContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [diaryEntries, setDiaryEntries] = useState<
    Array<{ date: string; text: string; meta: string }>
  >([])
  const fetchDiaryEntries = useCallback(async () => {
    // get from api
    // replace with fetched data
    return []
  }, [])
  const forceUpdateEntries = useCallback(async () => {
    const newDiaryEntries = await fetchDiaryEntries()
    setDiaryEntries(newDiaryEntries)
  }, [fetchDiaryEntries])
  useEffect(() => {
    const updateEntries = async () => {
      const newDiaryEntries = await fetchDiaryEntries()
      setDiaryEntries(newDiaryEntries)
    }
    updateEntries()
  }, [fetchDiaryEntries])
  return (
    <DiaryEntriesContext.Provider value={{ diaryEntries, forceUpdateEntries }}>
      {children}
    </DiaryEntriesContext.Provider>
  )
}
