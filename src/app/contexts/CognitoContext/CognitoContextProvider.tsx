'use client'
import React from 'react'
import { AuthProvider } from 'react-oidc-context'
import CognitoContext from './CognitoContext'

const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZMLhSDGzn',
  client_id: '6bnkmgmkk137uf99cs6md2cjj6',
  redirect_uri: 'https://diary.klonguski.com',
  response_type: 'code',
  scope: 'phone openid email',
}

export const CognitoContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <CognitoContext.Provider value={{}}>
      <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>
    </CognitoContext.Provider>
  )
}
export default CognitoContextProvider
