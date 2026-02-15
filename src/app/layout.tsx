import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/DesignSystem.scss'
import './globals.css'
import { DiaryEntriesContextProvider } from './contexts/DiaryEntriesContext/DiaryEntriesContextProvider'
import CognitoContextProvider from './contexts/CognitoContext/CognitoContextProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LLM Diary | Personal Ledger',
  description: 'An event-sourced personal diary and insight system.',
}

export const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <DiaryEntriesContextProvider>
      <CognitoContextProvider>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <div className="ledger-container">
              <header className="ledger-header">
                <span>Personal Ledger</span>
                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
              </header>
              <main>
                {children}
              </main>
              <footer className="system-stats-footer">
                <span>EVENTS: 0</span>
                <span>INSIGHTS: 0</span>
                <span>STATUS: IDLE</span>
              </footer>
            </div>
          </body>
        </html>
      </CognitoContextProvider>
    </DiaryEntriesContextProvider>
  )
}

export default RootLayout

