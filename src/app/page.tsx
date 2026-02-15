'use client'

import DiaryForm from '@/components/DiaryForm/DiaryForm'
import { useAuth } from 'react-oidc-context'
import LoginPage from './login/page'

export const Home = () => {
  const auth = useAuth()
  console.log(auth)
  if (!auth.isAuthenticated) {
    return <LoginPage />
  }
  return (
    <DiaryForm />
  )
}

export default Home
