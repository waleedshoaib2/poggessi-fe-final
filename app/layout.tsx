import { CssBaseline } from '@mui/material'
import { ThemeContextProvider } from './libs/mui/theme/context'
import { Metadata } from 'next'
import { GlobalStyles } from '@mui/material'

export const metadata: Metadata = {
  title: {
    template: '%s | Pogessi',
    default: 'Pogessi'
  },
  description: "Pogessi - USA's exclusive e-commerce platform.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeContextProvider>
          <CssBaseline />
          <GlobalStyles
            styles={{
              html: { scrollbarWidth: 'none' },
              body: { scrollbarWidth: 'none' },
              'html::-webkit-scrollbar, body::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          />
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  )
}
