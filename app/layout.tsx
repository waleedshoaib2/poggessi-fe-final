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
            styles={`
    /* Firefox */
    * {
      scrollbar-width: thin;
      scrollbar-color: #6b7280 #f5f6f7;
    }

    /* Chrome / Edge / Safari */
    *::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }

    /* Track (very light gray) */
    *::-webkit-scrollbar-track {
      background: #f5f6f7;
    }

    /* Thumb */
    *::-webkit-scrollbar-thumb {
      background: #6b7280;
      border-radius: 10px;
      border: 2px solid #f5f6f7; /* creates floating effect */
    }

    /* Hover thumb */
    *::-webkit-scrollbar-thumb:hover {
      background: #4b5563;
    }

    /* Remove arrows */
    *::-webkit-scrollbar-button {
      display: none;
      width: 0;
      height: 0;
    }

    /* Remove corner */
    *::-webkit-scrollbar-corner {
      background: transparent;
    }
  `}
          />

          {children}
        </ThemeContextProvider>
      </body>
    </html>
  )
}
