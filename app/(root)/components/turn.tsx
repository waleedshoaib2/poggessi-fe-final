'use client'
import { Box, Typography, Paper } from '@mui/material'
import { TurnHistoryItem, AppliedFilter } from '@/app/config/type'

interface TurnProps {
  turn_history: TurnHistoryItem[]
  currentTurn?: number
  onTurnClick: (turnIndex: number) => void
  disabled?: boolean
  formatAppliedFilters?: (filters: AppliedFilter[]) => string
}

export default function Turn({
  turn_history,
  currentTurn,
  onTurnClick,
  disabled = false,
  formatAppliedFilters
}: TurnProps) {
  if (!turn_history || turn_history.length === 0) return null

  // Local implementation of format Applied Filters if not provided
  const defaultFormatAppliedFilters = (filters: AppliedFilter[]) => {
    if (!filters || filters.length === 0) return 'none'
    return filters.map((filter) => `${filter.question_id}=${filter.selected_value}`).join(', ')
  }

  const formatter = formatAppliedFilters || defaultFormatAppliedFilters

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
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Timeline
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {turn_history.map((turn) => {
          const isActive = turn.turn_index === currentTurn
          const isDisabled = disabled

          return (
            <Box
              key={turn.turn_index}
              onClick={() => {
                if (isDisabled) return
                onTurnClick(turn.turn_index)
              }}
              sx={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.6 : 1,
                borderRadius: '10px',
                border: isActive ? '2px solid #5b8ec4' : '1px solid rgba(0,0,0,0.12)',
                backgroundColor: isActive ? 'rgba(229, 234, 238, 0.12)' : '#fff',
                px: 1.5,
                py: 1,
                minWidth: 140
              }}
            >
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                Turn {turn.turn_index}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {turn.match_count} items
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Selected:{' '}
                {turn.selected_filters && turn.selected_filters.length > 0 ? formatter(turn.selected_filters) : 'none'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Filters:{' '}
                {turn.filters_applied && turn.filters_applied.length > 0 ? formatter(turn.filters_applied) : 'none'}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
