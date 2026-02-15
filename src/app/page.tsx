'use client'

import DiaryForm from '@/components/DiaryForm/DiaryForm'
import { useAuth } from 'react-oidc-context'
import LoginPage from './login/page'

const Home = () => {
  const auth = useAuth()
  if (!auth.isAuthenticated) {
    return <LoginPage />
  }
  return (
    <DiaryForm />
  )
}

export default Home
