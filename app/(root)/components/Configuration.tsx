'use client'

import { Paper, Box, Typography, Slider, Stack, FormControl, Select, InputLabel, MenuItem } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export type NumResults = number | 'all'

interface ConfigurationProps {
  numResults: NumResults
  setNumResults: (numResults: NumResults) => void
  confidence: number
  setConfidence: (confidence: number) => void
  onClose?: () => void
}

const Configuration = ({ numResults, setNumResults, confidence, setConfidence }: ConfigurationProps) => {
  // Convert "all" → 10 for slider
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Internal state for the source dropdown
  const [localSource, setLocalSource] = useState(searchParams.get('source') || '')
  const sliderNumResults = numResults === 'all' ? 10 : numResults

  const handleSourceChange = (newSource: string) => {
    setLocalSource(newSource)

    const params = new URLSearchParams(searchParams.toString())

    if (newSource === 'All Sources' || newSource === '') {
      params.delete('source') // Remove param if "All Sources" is selected
    } else {
      params.set('source', newSource) // Set param for specific source
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  const handleNumResultsChange = (_: Event, newValue: number | number[]) => {
    const value = newValue as number
    setNumResults(value === 10 ? 'all' : value)
  }

  const handleConfidenceChange = (_: Event, newValue: number | number[]) => {
    setConfidence(newValue as number)
  }

  return (
    <Paper
      elevation={3}
      sx={{
        minHeight: '0vh',
        maxHeight: '65vh',
        display: 'flex',
        minWidth: '18vw',
        flexDirection: 'column',
        p: 3,
        borderRadius: 4,
        backgroundColor: 'rgba(82, 78, 78, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="light">
          Configuration
        </Typography>
      </Stack>

      {/* No. of Results */}
      <Box>
        <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
          No. of Results
        </Typography>

        <Slider
          value={sliderNumResults}
          onChange={handleNumResultsChange}
          min={1}
          max={10}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 10, label: 'All' }
          ]}
          valueLabelDisplay="on"
          valueLabelFormat={(value) => (value === 10 ? 'All' : value)}
          sx={{
            color: 'primary.main',
            '& .MuiSlider-markLabel': {
              color: 'white'
            },
            height: 8,
            '& .MuiSlider-track': {
              border: 'none'
              // backgroundColor: 'primary.main'
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'white',
              opacity: 1
            },
            '& .MuiSlider-thumb': {
              height: 19,
              width: 19,
              backgroundColor: 'secondary.main',
              border: '2px solid currentColor',
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'inherit'
              },
              '&:before': {
                display: 'none'
              }
            },
            '& .MuiSlider-valueLabel': {
              lineHeight: 1.2,
              fontSize: 12,
              background: 'unset',
              padding: '4px 8px',
              width: 'auto',
              height: 'auto',
              borderRadius: 1,
              backgroundColor: '#fff',
              color: '#000',
              top: '100%',
              marginTop: '6px',
              transformOrigin: 'top center',
              transform: 'scale(0)',
              '&:before': { display: 'none' },
              '&.MuiSlider-valueLabelOpen': {
                transform: 'scale(1)'
              }
            }
          }}
        />
      </Box>

      {/* Confidence Threshold */}
      <Box mb={2}>
        <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
          Confidence Threshold
        </Typography>

        <Slider
          value={confidence}
          onChange={handleConfidenceChange}
          min={0}
          max={1}
          step={0.1}
          valueLabelDisplay="on"
          sx={{
            color: 'primary.main',
            '& .MuiSlider-markLabel': {
              color: 'white'
            },
            height: 8,
            '& .MuiSlider-track': {
              border: 'none'
              // backgroundColor: 'primary.main'
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'white',
              opacity: 1
            },
            '& .MuiSlider-thumb': {
              height: 19,
              width: 19,
              backgroundColor: 'secondary.main',
              border: '2px solid currentColor',
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'inherit'
              },
              '&:before': {
                display: 'none'
              }
            },
            '& .MuiSlider-valueLabel': {
              lineHeight: 1.2,
              fontSize: 12,
              background: 'unset',
              padding: '4px 8px',
              width: 'auto',
              height: 'auto',
              borderRadius: 1,
              backgroundColor: '#fff',
              color: '#000',
              top: '100%',
              marginTop: '6px',
              transformOrigin: 'top center',
              transform: 'scale(0)',
              '&:before': { display: 'none' },
              '&.MuiSlider-valueLabelOpen': {
                transform: 'scale(1)'
              }
            }
          }}
        />
      </Box>
      <Box mt={1}>
        <FormControl fullWidth size="small">
          <InputLabel
            id="source-filter-label-config"
            sx={{
              color: 'white',
              '&.Mui-focused': {
                color: 'white'
              }
            }}
          >
            Source
          </InputLabel>
          <Select
            labelId="source-filter-label-config"
            value={localSource}
            label="Source"
            onChange={(e) => handleSourceChange(e.target.value)}
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="All Sources">All Sources</MenuItem>
            <MenuItem value="Catalog Items">Catalog Items</MenuItem>
            <MenuItem value="Customized Quoted">Customized Quoted</MenuItem>
            <MenuItem value="Original">Original</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  )
}

export default Configuration
