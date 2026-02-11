'use client'

import { RefinementQuestion } from '@/app/config/type'
import { Box, Button, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

export default function RefinementQuestions({
  questions,
  selectedAnswers,
  totalMatches,
  groupedMatches,
  loading,
  disabled,
  error,
  onApply,
  onReset
}: {
  questions: RefinementQuestion[]
  selectedAnswers: Record<string, string | undefined>
  totalMatches?: number
  groupedMatches?: number
  loading?: boolean
  disabled?: boolean
  error?: string | null
  onApply: (selectedAnswers: Record<string, string>) => void
  onReset: () => void
}) {
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>(() => {
    const normalized: Record<string, string> = {}
    Object.entries(selectedAnswers ?? {}).forEach(([k, v]) => {
      if (v) normalized[k] = v
    })
    return normalized
  })

  const hasAnySelection = Object.values(draftAnswers).some(Boolean)
  const isDirty = useMemo(() => {
    const current: Record<string, string> = {}
    Object.entries(selectedAnswers ?? {}).forEach(([k, v]) => {
      if (v) current[k] = v
    })
    return JSON.stringify(current) !== JSON.stringify(draftAnswers)
  }, [draftAnswers, selectedAnswers])

  if (!questions || questions.length === 0) return null
  const resultLabel =
    typeof groupedMatches === 'number' && typeof totalMatches === 'number'
      ? `Showing ${groupedMatches} results`
      : typeof totalMatches === 'number'
        ? `Showing ${totalMatches} results`
        : null

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '12px',
        border: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Refine your search
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            sx={{ borderRadius: '10px', color: 'white' }}
            variant="contained"
            onClick={() => onApply(draftAnswers)}
            disabled={Boolean(loading) || Boolean(disabled) || !hasAnySelection || !isDirty}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            sx={{ borderRadius: '10px' }}
            onClick={() => {
              setDraftAnswers({})
              // Only call onReset (which triggers API) if there are actually applied filters
              const hasAppliedFilters = Object.values(selectedAnswers ?? {}).some(Boolean)
              if (hasAppliedFilters) {
                onReset()
              }
            }}
            disabled={Boolean(loading) || Boolean(disabled) || !hasAnySelection}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {resultLabel && (
        <Typography variant="body1" fontSize={12} mb={1}>
          {resultLabel}
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: 'white',
          opacity: 1,
          padding: 2,
          borderRadius: '12px'
        }}
      >
        {questions.map((q) => {
          const selected = draftAnswers[q.id]
          return (
            <Box key={q.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {q.label}
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={selected ?? null}
                onChange={(_, value) => {
                  if (!value) return
                  setDraftAnswers((prev) => ({ ...prev, [q.id]: value }))
                }}
                size="small"
                disabled={Boolean(disabled) || Boolean(loading)}
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,

                  '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid #91A3B8 !important',
                    borderRadius: '999px !important',
                    px: 1.5
                  },

                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    opacity: 0.85,

                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(15,20,25,0.05)'
                    },

                    '&.Mui-selected': {
                      backgroundColor: '#0f1419',
                      color: '#fff',
                      borderColor: '#0f1419',

                      '&:hover': {
                        backgroundColor: '#0f1419'
                      }
                    }
                  }
                }}
              >
                {q.options.map((opt) => (
                  <ToggleButton
                    key={opt.value}
                    value={opt.value}
                    aria-label={`${q.label}: ${opt.label}`}
                    disabled={Boolean(disabled) || Boolean(loading)}
                  >
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )
        })}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          {error}
        </Typography>
      )}
    </Paper>
  )
}
