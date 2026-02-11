import { CssBaseline } from '@mui/material'
import { ThemeContextProvider } from './libs/mui/theme/context'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: {
    template: '%s | Pogessi',
    default: 'Pogessi'
  },
  description: "Pogessi - USA's exclusive e-commerce platform.",
  icons: {
    icon: '/img/favicon.ico',
    shortcut: '/img/favicon.ico',
    apple: '/img/favicon.ico'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeContextProvider>
          <CssBaseline />
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  )
}
