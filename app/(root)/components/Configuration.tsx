'use client'

import {
  Paper,
  Box,
  Typography,
  Slider,
  Stack,
  FormControl,
  Select,
  InputLabel,
  MenuItem
} from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CATALOG_FACTORY_NAMES, CATALOG_PROGRAM_NAMES } from '../../config/catalogFacets'

export type NumResults = number | 'all'

interface ConfigurationProps {
  numResults: NumResults
  setNumResults: (numResults: NumResults) => void
  confidence: number
  setConfidence: (confidence: number) => void
  onClose?: () => void
}

const Configuration = ({ numResults, setNumResults, confidence, setConfidence }: ConfigurationProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sourceParam = searchParams.get('source') || ''
  const [localSource, setLocalSource] = useState(sourceParam)

  const programParam = searchParams.get('program_name') ?? ''
  const factoryParam = searchParams.get('factory_name') ?? ''
  const [localProgram, setLocalProgram] = useState(programParam)
  const [localFactory, setLocalFactory] = useState(factoryParam)

  useEffect(() => {
    setLocalSource(sourceParam)
  }, [sourceParam])

  useEffect(() => {
    setLocalProgram(programParam)
  }, [programParam])

  useEffect(() => {
    setLocalFactory(factoryParam)
  }, [factoryParam])

  const sliderNumResults = numResults === 'all' ? 10 : numResults

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSourceChange = (newSource: string) => {
    setLocalSource(newSource)
    pushParams((params) => {
      if (newSource === 'All Sources' || newSource === '') {
        params.delete('source')
      } else {
        params.set('source', newSource)
      }
    })
  }

  const handleProgramChange = (value: string) => {
    setLocalProgram(value)
    pushParams((params) => {
      if (!value) params.delete('program_name')
      else params.set('program_name', value)
    })
  }

  const handleFactoryChange = (value: string) => {
    setLocalFactory(value)
    pushParams((params) => {
      if (!value) params.delete('factory_name')
      else params.set('factory_name', value)
    })
  }

  const handleNumResultsChange = (_: Event, newValue: number | number[]) => {
    const value = newValue as number
    setNumResults(value === 10 ? 'all' : value)
  }

  const handleConfidenceChange = (_: Event, newValue: number | number[]) => {
    setConfidence(newValue as number)
  }

  const selectSx = {
    color: 'white',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
    '& .MuiSvgIcon-root': { color: 'white' }
  }

  const labelSx = {
    color: 'white',
    '&.Mui-focused': { color: 'white' }
  }

  const menuProps = {
    PaperProps: {
      style: { maxHeight: 280 }
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        minHeight: '0vh',
        maxHeight: '75vh',
        overflowY: 'auto',
        display: 'flex',
        minWidth: 'min(92vw, 380px)',
        flexDirection: 'column',
        p: 3,
        borderRadius: 4,
        backgroundColor: 'rgba(82, 78, 78, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="light">
          Configuration
        </Typography>
      </Stack>

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

      <Box mt={1} mb={1}>
        <FormControl fullWidth size="small">
          <InputLabel id="source-filter-label-config" sx={labelSx}>
            Source
          </InputLabel>
          <Select
            labelId="source-filter-label-config"
            value={localSource}
            label="Source"
            onChange={(e) => handleSourceChange(e.target.value)}
            sx={selectSx}
            MenuProps={menuProps}
          >
            <MenuItem value="All Sources">All Sources</MenuItem>
            <MenuItem value="Catalog Items">Catalog Items</MenuItem>
            <MenuItem value="Customized Quoted">Customized Quoted</MenuItem>
            <MenuItem value="Custom Built">Custom Built</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box mb={1}>
        <FormControl fullWidth size="small" variant="outlined">
          <InputLabel id="program-name-label" shrink sx={labelSx}>
            Program
          </InputLabel>
          <Select
            labelId="program-name-label"
            value={localProgram}
            label="Program"
            displayEmpty
            onChange={(e) => handleProgramChange(e.target.value as string)}
            sx={selectSx}
            MenuProps={menuProps}
            renderValue={(selected) => {
              if (!selected) return <span style={{ opacity: 0.75 }}>Any program</span>
              return selected
            }}
          >
            <MenuItem value="">
              <em>Any program</em>
            </MenuItem>
            {CATALOG_PROGRAM_NAMES.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <FormControl fullWidth size="small" variant="outlined">
          <InputLabel id="factory-name-label" shrink sx={labelSx}>
            Factory
          </InputLabel>
          <Select
            labelId="factory-name-label"
            value={localFactory}
            label="Factory"
            displayEmpty
            onChange={(e) => handleFactoryChange(e.target.value as string)}
            sx={selectSx}
            MenuProps={menuProps}
            renderValue={(selected) => {
              if (!selected) return <span style={{ opacity: 0.75 }}>Any factory</span>
              return selected
            }}
          >
            <MenuItem value="">
              <em>Any factory</em>
            </MenuItem>
            {CATALOG_FACTORY_NAMES.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  )
}

export default Configuration
