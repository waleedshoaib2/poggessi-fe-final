'use client'
import React, { useState, useRef, useEffect, Suspense } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  InputAdornment,
  Drawer,
  Button
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import MainLayout from '../(root)/layout'
import ProductDetailsDialog from '../(root)/components/ProductDetailsDialog'
import renderSearchResults from '../(root)/components/results'
import RefinementQuestions from '../(root)/components/RefinementQuestions'
import Turn from '../(root)/components/turn'
import { useSearchParams } from 'next/navigation'
import { ROUTES } from '../config/api'
import {
  ProductResult,
  RefinementQuestion,
  TurnHistoryItem,
  AppliedFilter,
  TurnCache,
  ConversationChat,
  ConversationTurn
} from '../config/type'

interface SearchResponse {
  status: string
  total_matches?: number
  grouped_matches?: number
  chat_id?: string
  current_turn?: number
  matches: ProductResult[]
  refinement_questions?: RefinementQuestion[]
  turn_history?: TurnHistoryItem[]
  query?: {
    filters_applied?: AppliedFilter[]
  }
}

interface ConversationChatsResponse {
  status: string
  limit: number
  count: number
  chats: ConversationChat[]
}

interface ConversationTurnsResponse {
  status: string
  chat_id: string
  limit: number
  count: number
  rehydrate: boolean
  turns: ConversationTurn[]
}

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  image?: string
  timestamp: Date
  searchResults?: ProductResult[]
  totalMatches?: number
  groupedMatches?: number
  originalTotalMatches?: number
  originalGroupedMatches?: number
  refinementQuestions?: RefinementQuestion[]
  refinementVersion?: number
  chatId?: string
  currentTurn?: number
  turnHistory?: TurnHistoryItem[]
  turnCache?: Record<number, TurnCache>
  originalQuery?: {
    text: string
    image?: string
    source?: string
  }
  selectedFilters?: Record<string, string>
  turn_history?: TurnHistoryItem[]
}

const TypingDots: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#5b8ec4',
            animation: `typing-dot 1.5s infinite`,
            animationDelay: `${i * 0.3}s`
          }}
        />
      ))}

      <style>{`
          @keyframes typing-dot {
            0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
    </Box>
  )
}

const SearchContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [activeBotMessageId, setActiveBotMessageId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<ProductResult[]>([])
  const [chats, setChats] = useState<ConversationChat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isChatsLoading, setIsChatsLoading] = useState(false)
  const [isTurnsLoading, setIsTurnsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const skipNextAutoScrollRef = useRef(false)
  const searchParams = useSearchParams()

  // Get individual params
  const topK = searchParams.get('top_k') // Returns string or null
  const confT = searchParams.get('conf_t')
  const source = searchParams.get('source') || undefined
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatAppliedFilters = (filters: AppliedFilter[]) => {
    if (!filters || filters.length === 0) return 'No filters'
    return filters.map((filter) => `${filter.question_id}=${filter.selected_value}`).join(', ')
  }

  const normalizeValue = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const formatRelativeTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    const diffMs = date.getTime() - Date.now()
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute')
    const diffHours = Math.round(diffMinutes / 60)
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
    const diffDays = Math.round(diffHours / 24)
    return rtf.format(diffDays, 'day')
  }

  const toTurnHistory = (turns: ConversationTurn[] | undefined): TurnHistoryItem[] => {
    if (!turns || turns.length === 0) return []
    return turns.map((turn) => ({
      turn_index: turn.turn_index,
      role: turn.role,
      match_count: turn.match_ids?.length ?? turn.items?.length ?? 0,
      filters_applied: turn.filters_applied ?? [],
      selected_filters: turn.selected_filters ?? [],
      refinement_questions: turn.refinement_questions ?? [],
      created_at: turn.created_at,
      parent_turn: turn.parent_turn,
      is_original: turn.is_original
    }))
  }

  const toProducts = (items: ProductResult[] | undefined): ProductResult[] => {
    if (!items || items.length === 0) return []
    return items.map((item) => ({
      id: item.id,
      score: item.score,
      metadata: item.metadata
    }))
  }

  const getSelectedFiltersForTurn = (turnHistory: TurnHistoryItem[] | undefined, turnIndex: number | undefined) => {
    if (!turnHistory || typeof turnIndex !== 'number') return {}
    const turn = turnHistory.find((entry) => entry.turn_index === turnIndex)
    if (!turn) return {}
    const selected = turn.selected_filters ?? []
    return selected.reduce<Record<string, string>>((acc, filter) => {
      const question = turn.refinement_questions?.find((q) => q.id === filter.question_id)
      if (question) {
        const normalizedSelected = normalizeValue(filter.selected_value)
        const match = question.options.find((opt) => {
          const optValue = normalizeValue(opt.value)
          const optLabel = normalizeValue(opt.label)
          if (optValue === normalizedSelected || optLabel === normalizedSelected) return true
          return (
            optValue.includes(normalizedSelected) ||
            normalizedSelected.includes(optValue) ||
            optLabel.includes(normalizedSelected) ||
            normalizedSelected.includes(optLabel)
          )
        })
        if (match) {
          acc[filter.question_id] = match.value
          return acc
        }
      }
      acc[filter.question_id] = filter.selected_value
      return acc
    }, {})
  }

  const getSelectedFiltersFromQuestions = (
    filters: AppliedFilter[] | undefined,
    questions: RefinementQuestion[] | undefined
  ) => {
    if (!filters || filters.length === 0) return {}
    return filters.reduce<Record<string, string>>((acc, filter) => {
      const question = questions?.find((q) => q.id === filter.question_id)
      if (question) {
        const normalizedSelected = normalizeValue(filter.selected_value)
        const match = question.options.find((opt) => {
          const optValue = normalizeValue(opt.value)
          const optLabel = normalizeValue(opt.label)
          if (optValue === normalizedSelected || optLabel === normalizedSelected) return true
          return (
            optValue.includes(normalizedSelected) ||
            normalizedSelected.includes(optValue) ||
            optLabel.includes(normalizedSelected) ||
            normalizedSelected.includes(optLabel)
          )
        })
        if (match) {
          acc[filter.question_id] = match.value
          return acc
        }
      }
      acc[filter.question_id] = filter.selected_value
      return acc
    }, {})
  }

  const preferNonEmpty = (primary: Record<string, string>, fallback: Record<string, string>) =>
    Object.keys(primary).length > 0 ? primary : fallback

  const resolveFiltersApplied = (data: SearchResponse) => {
    if (data.query?.filters_applied && data.query.filters_applied.length > 0) return data.query.filters_applied
    if (data.turn_history && typeof data.current_turn === 'number') {
      const turn = data.turn_history.find((entry) => entry.turn_index === data.current_turn)
      if (turn?.filters_applied) return turn.filters_applied
    }
    return []
  }

  const resolveSelectedFilters = (data: SearchResponse) => {
    if (data.turn_history && typeof data.current_turn === 'number') {
      const turn = data.turn_history.find((entry) => entry.turn_index === data.current_turn)
      if (turn?.selected_filters) return turn.selected_filters
    }
    return []
  }

  const updateTurnCache = (
    existing: Record<number, TurnCache> | undefined,
    data: SearchResponse
  ): Record<number, TurnCache> => {
    const turnIndex = data.current_turn ?? 0
    const nextCache: Record<number, TurnCache> = { ...(existing ?? {}) }
    nextCache[turnIndex] = {
      matches: data.matches || [],
      refinementQuestions: data.refinement_questions ?? [],
      filtersApplied: resolveFiltersApplied(data),
      selectedFilters: resolveSelectedFilters(data),
      totalMatches: data.total_matches,
      groupedMatches: data.grouped_matches,
      isHydrated: true
    }

    if (data.turn_history && data.turn_history.length > 0) {
      const maxTurn = Math.max(...data.turn_history.map((entry) => entry.turn_index))
      Object.keys(nextCache).forEach((key) => {
        const idx = Number(key)
        if (Number.isFinite(idx) && idx > maxTurn) delete nextCache[idx]
      })

      data.turn_history.forEach((turn) => {
        const cached = nextCache[turn.turn_index]
        if (!cached) return
        cached.filtersApplied = turn.filters_applied ?? []
        cached.selectedFilters = turn.selected_filters ?? []
        cached.refinementQuestions = turn.refinement_questions ?? cached.refinementQuestions
      })
    }
    return nextCache
  }

  const switchToTurn = async (messageId: string, turnIndex: number) => {
    const message = messages.find((m) => m.id === messageId)
    if (!message) return
    if (turnIndex === message.currentTurn) return

    let cached = message.turnCache?.[turnIndex]
    if (!cached) {
      setFilterError(`Turn ${turnIndex} is not cached.`)
      return
    }
    if (!cached.isHydrated && message.chatId) {
      try {
        const data = await fetchTurns(message.chatId, true)
        const rehydratedTurn = data.turns.find((turn) => turn.turn_index === turnIndex)
        if (rehydratedTurn) {
          const hydratedMatches = toProducts(rehydratedTurn.items)
          const hydratedCache: TurnCache = {
            matches: hydratedMatches,
            refinementQuestions: rehydratedTurn.refinement_questions ?? cached.refinementQuestions ?? [],
            filtersApplied: rehydratedTurn.filters_applied ?? cached.filtersApplied ?? [],
            selectedFilters: rehydratedTurn.selected_filters ?? cached.selectedFilters ?? [],
            isHydrated: true
          }
          cached = hydratedCache
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== messageId) return m
              return {
                ...m,
                turnCache: {
                  ...(m.turnCache ?? {}),
                  [turnIndex]: hydratedCache
                }
              }
            })
          )
        }
      } catch (error) {
        console.error('Turn rehydrate failed:', error)
        setFilterError(`Failed to load cards for turn ${turnIndex}.`)
      }
    }

    const nextSelectedFilters = getSelectedFiltersFromQuestions(cached.selectedFilters, cached.refinementQuestions)

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        return {
          ...m,
          content: cached.matches.length
            ? `Showing ${cached.matches.length} matches from turn ${turnIndex}.`
            : "Sorry, I couldn't find any matches.",
          searchResults: cached.matches,
          totalMatches: cached.totalMatches,
          groupedMatches: cached.groupedMatches,
          refinementQuestions: cached.refinementQuestions,
          refinementVersion: (m.refinementVersion ?? 0) + 1,
          selectedFilters: nextSelectedFilters,
          currentTurn: turnIndex
        }
      })
    )
    setActiveBotMessageId(messageId)
  }

  useEffect(() => {
    if (skipNextAutoScrollRef.current) {
      skipNextAutoScrollRef.current = false
      return
    }
    scrollToBottom()
  }, [messages])

  const fetchChats = async () => {
    setIsChatsLoading(true)
    try {
      const response = await fetch(`${ROUTES.CHATS}?limit=50`, {
        method: 'GET',
        headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY as string, accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data: ConversationChatsResponse = await response.json()
      setChats(data.chats ?? [])
    } catch (error) {
      console.error('Chats fetch failed:', error)
      setChats([])
    } finally {
      setIsChatsLoading(false)
    }
  }

  const fetchTurns = async (chatId: string, rehydrate?: boolean): Promise<ConversationTurnsResponse> => {
    const params = new URLSearchParams()
    params.set('chat_id', chatId)
    params.set('limit', '50')
    if (typeof rehydrate === 'boolean') {
      params.set('rehydrate', rehydrate ? 'true' : 'false')
    }
    const response = await fetch(`${ROUTES.TURNS}?${params.toString()}`, {
      method: 'GET',
      headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY as string, accept: 'application/json' }
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return response.json()
  }

  const loadConversation = async (chatId: string) => {
    setIsTurnsLoading(true)
    setActiveChatId(chatId)
    setFilterError(null)
    try {
      const data = await fetchTurns(chatId)
      const turnHistory = toTurnHistory(data.turns)
      const newestTurn = turnHistory.length > 0 ? turnHistory[0] : undefined
      const nextTurnCache: Record<number, TurnCache> = {}
      data.turns.forEach((turn) => {
        nextTurnCache[turn.turn_index] = {
          matches: toProducts(turn.items),
          refinementQuestions: turn.refinement_questions ?? [],
          filtersApplied: turn.filters_applied ?? [],
          selectedFilters: turn.selected_filters ?? [],
          isHydrated: true
        }
      })
      const newestMatches = newestTurn ? (nextTurnCache[newestTurn.turn_index]?.matches ?? []) : []
      const newestQuestions = newestTurn ? (nextTurnCache[newestTurn.turn_index]?.refinementQuestions ?? []) : []

      const botMessage: Message = {
        id: `${Date.now()}-conversation`,
        type: 'bot',
        content: turnHistory.length > 0 ? '' : 'No turns in this chat yet.',
        timestamp: new Date(),
        chatId: chatId,
        currentTurn: newestTurn?.turn_index,
        turnHistory: turnHistory,
        turnCache: nextTurnCache,
        searchResults: newestMatches,
        refinementQuestions: newestQuestions,
        selectedFilters: getSelectedFiltersForTurn(turnHistory, newestTurn?.turn_index)
      }
      skipNextAutoScrollRef.current = true
      setMessages([botMessage])
      setActiveBotMessageId(botMessage.id)
    } catch (error) {
      console.error('Turns fetch failed:', error)
      setFilterError('Sorry, failed to load this conversation.')
      setMessages([])
    } finally {
      setIsTurnsLoading(false)
    }
  }

  useEffect(() => {
    void fetchChats()
  }, [])

  const handleHeaderSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const renderConversationItems = (onSelect?: () => void) => {
    if (isChatsLoading) {
      return (
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      )
    }
    if (chats.length === 0) {
      return (
        <Typography variant="body2" sx={{ color: 'rgba(236,244,255,0.85)' }}>
          No chats yet.
        </Typography>
      )
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {chats.map((chat) => (
          <Paper
            key={`${chat.chat_id}-${chat.turn_index}`}
            onClick={() => {
              void loadConversation(chat.chat_id)
              onSelect?.()
            }}
            sx={{
              p: 1.2,
              cursor: 'pointer',
              border:
                activeChatId === chat.chat_id ? '1px solid rgba(198,226,255,0.9)' : '1px solid rgba(198,226,255,0.35)',
              backgroundColor: activeChatId === chat.chat_id ? 'rgba(197,224,255,0.22)' : 'rgba(186,214,248,0.12)'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#f3f8ff' }} noWrap>
              {chat.query || '(no query text)'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(231,242,255,0.92)' }}>
              Turn {chat.turn_index} • {chat.match_count} items
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(220,235,255,0.9)' }}>
              <span suppressHydrationWarning>{formatRelativeTime(chat.created_at)}</span>
            </Typography>
          </Paper>
        ))}
      </Box>
    )
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const base64ToBlob = (base64: string): Blob => {
    const byteString = atob(base64.split(',')[1])
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
  }

  const createChatId = () => {
    try {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    } catch {
      // ignore
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const setStoredChatId = (chatId: string) => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem('chat_id', chatId)
    } catch {
      // ignore
    }
  }

  const searchHybrid = async (
    text: string,
    chatId: string,
    image?: string | null,
    source?: string
  ): Promise<SearchResponse> => {
    try {
      const formData = new FormData()
      if (image) {
        const blob = base64ToBlob(image)
        formData.append('file', blob, 'image.jpg')
      }

      const headers: HeadersInit = {
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY as string,
        accept: 'application/json'
      }
      const params = new URLSearchParams()

      if (text) params.set('text', text)
      params.set('top_k', (topK || 3).toString())
      params.set('conf_t', (confT || 0.3).toString())
      params.set('chat_id', chatId)
      if (source) params.set('source', source)

      const response = await fetch(`${ROUTES.SEARCH}?${params.toString()}`, {
        method: 'POST',
        headers: headers,
        body: image ? formData : undefined
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: SearchResponse = await response.json()
      return data
    } catch (error) {
      console.error('Search failed:', error)
      throw new Error(`API error: ${error}`)
    }
  }

  const applyFilters = async (messageId: string, nextSelectedFilters: Record<string, string>) => {
    const message = messages.find((m) => m.id === messageId)
    const chatId = message?.chatId
    if (!chatId) return

    setFilterError(null)
    setIsFiltering(true)

    try {
      const params = new URLSearchParams()
      params.set('chat_id', chatId)
      params.set('from_turn', (message.currentTurn ?? 0).toString())
      const filters = Object.entries(nextSelectedFilters).map(([questionId, selectedValue]) => ({
        question_id: questionId,
        selected_value: selectedValue
      }))
      params.set('filters', JSON.stringify(filters))

      const response = await fetch(`${ROUTES.FILTER}?${params.toString()}`, {
        method: 'POST',
        headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY as string, accept: 'application/json' }
      })
      if (!response.ok) {
        if (response.status === 404) {
          setFilterError('No cached results found. Please run a new search.')
          return
        }
        throw new Error(`API error: ${response.status}`)
      }

      const data: SearchResponse = await response.json()
      const nextChatId = data.chat_id ?? chatId
      setStoredChatId(nextChatId)
      const nextTurnHistory = data.turn_history ?? message.turnHistory
      const nextTurnIndex = data.current_turn ?? message.currentTurn
      const nextTurnCache = updateTurnCache(message.turnCache, data)
      const turnSelectedFilters = preferNonEmpty(
        getSelectedFiltersFromQuestions(resolveSelectedFilters(data), data.refinement_questions),
        getSelectedFiltersForTurn(nextTurnHistory, nextTurnIndex)
      )
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m
          const nextQuestions = data.refinement_questions ?? []
          return {
            ...m,
            chatId: nextChatId,
            content: data.matches?.length
              ? `Filtered to ${data.matches.length} matches.`
              : "Sorry, I couldn't find any matches.",
            searchResults: data.matches || [],
            totalMatches: data.total_matches,
            groupedMatches: data.grouped_matches,
            refinementQuestions: nextQuestions,
            refinementVersion: (m.refinementVersion ?? 0) + 1,
            selectedFilters: turnSelectedFilters,
            currentTurn: nextTurnIndex,
            turnHistory: nextTurnHistory,
            turnCache: nextTurnCache
          }
        })
      )
      void fetchChats()
    } catch (error) {
      console.error('Filter failed:', error)
      setFilterError('Sorry, something went wrong while applying that filter.')
    } finally {
      setIsFiltering(false)
    }
  }

  const resetRefinements = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message?.turnHistory?.length) {
      if (message.turnCache?.[0]) {
        await switchToTurn(messageId, 0)
      } else {
        setFilterError('Turn 0 is not cached. Please run a new search.')
      }
      return
    }
    if (!message?.originalQuery) return

    const nextChatId = createChatId()
    setStoredChatId(nextChatId)
    setFilterError(null)
    setIsFiltering(true)

    try {
      const data = await searchHybrid(
        message.originalQuery.text,
        nextChatId,
        message.originalQuery.image,
        message.originalQuery.source
      )
      const nextTurnHistory = data.turn_history ?? []
      const nextTurnIndex = data.current_turn ?? 0
      const nextTurnCache = updateTurnCache(message.turnCache, data)
      const nextSelectedFilters = preferNonEmpty(
        getSelectedFiltersFromQuestions(resolveSelectedFilters(data), data.refinement_questions),
        getSelectedFiltersForTurn(nextTurnHistory, nextTurnIndex)
      )
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                chatId: nextChatId,
                content: data.matches?.length ? `` : "Sorry, I couldn't find any matches.",
                searchResults: data.matches || [],
                totalMatches: data.total_matches,
                groupedMatches: data.grouped_matches,
                originalTotalMatches: data.total_matches,
                originalGroupedMatches: data.grouped_matches,
                refinementQuestions: data.refinement_questions ?? [],
                selectedFilters: nextSelectedFilters,
                currentTurn: nextTurnIndex,
                turnHistory: nextTurnHistory,
                turnCache: nextTurnCache
              }
            : m
        )
      )
      void fetchChats()
    } catch (error) {
      console.error('Reset failed:', error)
      setFilterError('Sorry, something went wrong while resetting refinements.')
    } finally {
      setIsFiltering(false)
    }
  }

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return
    setSelectedProductIds([])
    setSelectedProducts([])
    setFilterError(null)

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      image: selectedImage || undefined,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue('')
    setSelectedImage(null)
    setIsLoading(true)

    try {
      const chatId = createChatId()
      setStoredChatId(chatId)

      const data = await searchHybrid(newUserMessage.content, chatId, newUserMessage.image, source)
      const results = data.matches || []
      const nextChatId = data.chat_id ?? chatId
      setStoredChatId(nextChatId)
      const nextTurnHistory = data.turn_history ?? []
      const nextTurnIndex = data.current_turn ?? 0
      const nextTurnCache = updateTurnCache(undefined, data)
      const nextSelectedFilters = preferNonEmpty(
        getSelectedFiltersFromQuestions(resolveSelectedFilters(data), data.refinement_questions),
        getSelectedFiltersForTurn(nextTurnHistory, nextTurnIndex)
      )

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: results.length > 0 ? `` : "Sorry, I couldn't find any matches.",
        timestamp: new Date(),
        searchResults: results,
        totalMatches: data.total_matches,
        groupedMatches: data.grouped_matches,
        originalTotalMatches: data.total_matches,
        originalGroupedMatches: data.grouped_matches,
        refinementQuestions: data.refinement_questions ?? [],
        refinementVersion: 0,
        chatId: nextChatId,
        currentTurn: nextTurnIndex,
        turnHistory: nextTurnHistory,
        turnCache: nextTurnCache,
        originalQuery: {
          text: newUserMessage.content,
          image: newUserMessage.image,
          source: source
        },
        selectedFilters: nextSelectedFilters,
        turn_history: data.turn_history
      }
      setMessages((prev) => [...prev, botResponse])
      setActiveBotMessageId(botResponse.id)
      setActiveChatId(nextChatId)
      void fetchChats()
    } catch {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, something went wrong while searching.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorResponse])
      setActiveBotMessageId(errorResponse.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }

  return (
    <MainLayout onSidebarToggle={handleHeaderSidebarToggle}>
      {(isLoading || isFiltering || isTurnsLoading) && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(145deg, #e0f0ff, #ffffff)',
              border: '2px solid #5b8ec4',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
                '50%': { transform: 'scale(1.1)', boxShadow: '0 12px 25px rgba(0,0,0,0.15)' },
                '100%': { transform: 'scale(1)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }
              }
            }}
          >
            <TypingDots />
          </Box>
        </Box>
      )}
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        transitionDuration={400}
        PaperProps={{
          sx: {
            width: { xs: '88vw', md: 360 },
            p: 2,
            pt: 2.5,
            background: 'linear-gradient(180deg, #5b8ec4 0%, #4a7db3 100%)',
            color: '#ffffff',
            borderRight: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.4s ease',
            opacity: 0.98
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Conversations
          </Typography>

          <IconButton
            size="small"
            onClick={() => setIsSidebarOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Button
          fullWidth
          variant="contained"
          sx={{
            mb: 2,
            borderRadius: '12px',
            backgroundColor: 'primary.main',
            color: '#fff',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: 'primary.main'
            }
          }}
          onClick={() => {
            setMessages([])
            setActiveChatId(null)
            setIsSidebarOpen(false)
          }}
        >
          + New Chat
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflowY: 'auto'
          }}
        >
          {renderConversationItems(() => setIsSidebarOpen(false))}
        </Box>
      </Drawer>

      <Box
        sx={{
          width: '100%',
          maxWidth: '1120px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'flex-start'
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Messages Area */}
          {messages.length > 0 && (
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                width: '100%',
                padding: '32px 24px',
                borderRadius: '16px',
                maxWidth: '900px',
                flexDirection: 'column',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                gap: 3,
                mb: 3,
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px'
                }
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: message.type === 'user' ? '85%' : '100%',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                    width: message.searchResults ? '100%' : 'auto'
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                      flexShrink: 0
                    }}
                  >
                    {message.type === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Avatar>

                  <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                    {(message.content || message.image) && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          backgroundColor: message.type === 'user' ? 'primary.light' : 'background.paper',
                          color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                          maxWidth: '100%'
                        }}
                      >
                        {message.image && (
                          <Box
                            component="img"
                            src={message.image}
                            alt="User upload"
                            sx={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              mb: message.content ? 1 : 0,
                              display: 'block'
                            }}
                          />
                        )}
                        {message.content && (
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                        )}
                      </Paper>
                    )}

                    {(message.turnHistory?.length || (message.searchResults && message.searchResults.length > 0)) && (
                      <Box sx={{ mt: 1, width: '100%' }}>
                        {message.turnHistory && message.turnHistory.length > 0 && (
                          <Turn
                            turn_history={message.turnHistory}
                            currentTurn={message.currentTurn}
                            onTurnClick={(turnIndex) => void switchToTurn(message.id, turnIndex)}
                            disabled={message.id !== activeBotMessageId || isFiltering}
                            formatAppliedFilters={formatAppliedFilters}
                          />
                        )}
                        {message.type === 'bot' &&
                          message.refinementQuestions &&
                          message.refinementQuestions.length > 0 && (
                            <RefinementQuestions
                              key={`${message.id}-${message.refinementVersion ?? 0}`}
                              questions={message.refinementQuestions}
                              selectedAnswers={message.selectedFilters ?? {}}
                              totalMatches={message.originalTotalMatches ?? message.totalMatches}
                              groupedMatches={message.groupedMatches}
                              loading={isFiltering}
                              disabled={message.id !== activeBotMessageId}
                              error={message.id === activeBotMessageId ? filterError : null}
                              onApply={(nextSelected) => applyFilters(message.id, nextSelected)}
                              onReset={() => resetRefinements(message.id)}
                            />
                          )}
                        {message.searchResults &&
                          message.searchResults.length > 0 &&
                          renderSearchResults(
                            message.searchResults,
                            setSelectedProduct,
                            setIsDialogOpen,
                            selectedProductIds,
                            setSelectedProductIds,
                            setSelectedProducts,
                            selectedProducts
                          )}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
          {messages.length > 0 ? (
            <Box sx={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
              {selectedImage && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -70,
                    left: 10,
                    zIndex: 10,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    p: 0.5,
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  <Box
                    component="img"
                    src={selectedImage}
                    alt="Preview"
                    sx={{
                      height: 60,
                      width: 'auto',
                      borderRadius: 1
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={clearSelectedImage}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -12,
                      bgcolor: 'background.paper',
                      border: '1px solid #ddd',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      width: 20,
                      height: 20
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}

              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                onClick={(e) => ((e.target as HTMLInputElement).value = '')}
              />

              <TextField
                fullWidth
                placeholder="Search here.."
                multiline
                maxRows={4}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: '30px',
                    paddingRight: '4px',
                    '& fieldset': {
                      border: 'none'
                    },
                    '&:hover fieldset': {
                      border: 'none'
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '8px px',
                    fontSize: '15px',
                    color: '#333',
                    '&::placeholder': {
                      color: '#999',
                      opacity: 1
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={triggerFileSelect}
                          disabled={isLoading || isFiltering}
                          sx={{
                            backgroundColor: '#5b8ec4',
                            color: '#ffffff',
                            width: '40px',
                            height: '40px',
                            mr: 1,
                            '&:hover': {
                              backgroundColor: '#4a7ab0'
                            }
                          }}
                        >
                          <CameraAltIcon sx={{ fontSize: '20px' }} />
                        </IconButton>
                        {(inputValue.trim() || selectedImage) && (
                          <IconButton
                            onClick={handleSendMessage}
                            disabled={isLoading || isFiltering}
                            sx={{
                              backgroundColor: '#5b8ec4',
                              color: '#ffffff',
                              width: '40px',
                              mr: 1,
                              height: '40px',
                              '&:hover': {
                                backgroundColor: '#4a7ab0'
                              }
                            }}
                          >
                            <SendIcon sx={{ fontSize: '20px' }} />
                          </IconButton>
                        )}
                      </Box>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent'
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  width: '100%',
                  maxWidth: '900px', // Removed to let Grid control width
                  // mt: 5, // Managed by Grid spacing
                  minHeight: '0vh',
                  maxHeight: '70vh',
                  my: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Input Area */}
                <Box sx={{ position: 'relative' }}>
                  {selectedImage && (
                    <Box
                      sx={{
                        position: 'relative',
                        width: 110,
                        height: 110,
                        borderRadius: 3,
                        overflow: 'hidden',
                        mb: 1
                      }}
                    >
                      <Box
                        component="img"
                        src={selectedImage}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      z{/* Close Button */}
                      <IconButton
                        size="small"
                        onClick={clearSelectedImage}
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          bgcolor: '#fff',
                          width: 28,
                          height: 28,
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  )}

                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    onClick={(e) => ((e.target as HTMLInputElement).value = '')}
                  />

                  <TextField
                    fullWidth
                    placeholder="Search here.."
                    multiline
                    maxRows={4}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        borderRadius: '30px',
                        paddingRight: '4px',
                        '& fieldset': {
                          border: 'none'
                        },
                        '&:hover fieldset': {
                          border: 'none'
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none'
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '8px px',
                        fontSize: '15px',
                        color: '#333',
                        '&::placeholder': {
                          color: '#999',
                          opacity: 1
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#666' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              onClick={triggerFileSelect}
                              disabled={isLoading || isFiltering}
                              sx={{
                                backgroundColor: '#5b8ec4',
                                color: '#ffffff',
                                width: '40px',
                                mr: 1,
                                height: '40px',
                                '&:hover': {
                                  backgroundColor: '#4a7ab0'
                                }
                              }}
                            >
                              <CameraAltIcon sx={{ fontSize: '20px' }} />
                            </IconButton>
                            {(inputValue.trim() || selectedImage) && (
                              <IconButton
                                onClick={handleSendMessage}
                                disabled={isLoading || isFiltering}
                                sx={{
                                  backgroundColor: '#5b8ec4',
                                  color: '#ffffff',
                                  width: '40px',
                                  mr: 1,
                                  height: '40px',
                                  '&:hover': {
                                    backgroundColor: '#4a7ab0'
                                  }
                                }}
                              >
                                <SendIcon sx={{ fontSize: '20px' }} />
                              </IconButton>
                            )}
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          )}
          {selectedProduct && (
            <ProductDetailsDialog
              open={isDialogOpen}
              onClose={handleCloseDialog}
              product={selectedProduct}
              selectedProductIds={selectedProductIds}
              selectedProducts={selectedProducts}
              setSelectedProductIds={setSelectedProductIds}
              setSelectedProducts={setSelectedProducts}
            />
          )}
        </Box>
      </Box>
    </MainLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
