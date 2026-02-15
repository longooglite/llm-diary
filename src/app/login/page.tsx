'use client'

import { useAuth } from 'react-oidc-context'

const LoginPage = () => {
  const auth = useAuth()

  const signOutRedirect = () => {
    // https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZMLhSDGzn/.well-known/jwks.json
    const cognitoDomain = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZMLhSDGzn'
    const clientId = '6bnkmgmkk137uf99cs6md2cjj6'
    // Where Cognito redirects after logout — must be in the app client's "Sign out URL(s)"
    const logoutUri = typeof window !== 'undefined' ? `${cognitoDomain}/login` : 'http://localhost:3000/login'
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
  }

  if (auth.isLoading) {
    return <div>Loading...</div>
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>

        <button onClick={() => signOutRedirect()}>Sign out</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  )
}

export default LoginPage
