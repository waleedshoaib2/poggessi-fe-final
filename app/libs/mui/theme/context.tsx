'use client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { themeLight } from './themes'
export enum THEMES {
  SYSTEM = 'system',
  LIGHT = 'light',
  DARK = 'dark'
}
export const isDarkMode = (theme: THEMES) => {
  const darkThemeMq =
    typeof window === 'undefined' ? { matches: false } : window.matchMedia('(prefers-color-scheme: dark)')
  return (theme === 'system' && darkThemeMq.matches) || theme === 'dark'
}

// Theme context
const ThemeContext = createContext<{
  darkMode: boolean
  theme: THEMES
  setTheme: (theme: THEMES) => void
} | null>(null)
// Setting custom name for the context which is visible on react dev tools
ThemeContext.displayName = 'ThemeContext'
// Context provider
export const ThemeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [theme, _setTheme] = useState(THEMES.SYSTEM)
  const [darkMode, setDarkMode] = useState(false)

  const setTheme = useCallback((theme: THEMES) => {
    _setTheme(theme)
    setDarkMode(isDarkMode(theme))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  }, [])

  useEffect(() => {
    const theme = window.localStorage.getItem('theme')
    switch (theme) {
      case THEMES.DARK:
        setTheme(THEMES.DARK)
        break
      case THEMES.LIGHT:
        setTheme(THEMES.LIGHT)
        break
      default:
        setTheme(THEMES.SYSTEM)
        break
    }
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setTheme }}>
      <ThemeProvider theme={themeLight}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

// Context custom hook for using context
export const useThemeContext = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext should be used inside the ThemeContextProvider.')
  }

  return context
}
