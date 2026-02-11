'use client'
import { exportSelectedToExcel, roundToInteger } from '@/app/config/helper'
import { ProductResult } from '@/app/config/type'
import { Download } from '@mui/icons-material'
import { Box, Card, CardContent, CardMedia, Checkbox, Grid, IconButton, Tooltip, Typography } from '@mui/material'

const renderSearchResults = (
  results: ProductResult[],
  setSelectedProduct: (product: ProductResult) => void,
  setIsDialogOpen: (open: boolean) => void,
  selectedProductIds: string[],
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedProducts: React.Dispatch<React.SetStateAction<ProductResult[]>>,
  selectedProducts: ProductResult[]
) => {
  const handleProductClick = (product: ProductResult) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleCheckboxToggle = (product: ProductResult) => {
    // If product has variations but no fullData, fallback to the product itself to ensure toggle works
    const variants =
      product.hasVariation && product.fullData && product.fullData.length > 0 ? product.fullData : [product]

    const selectedInResult = variants.filter((v) => selectedProductIds.includes(v.id))
    const isAllSelected = selectedInResult.length === variants.length && variants.length > 0

    // Standard behavior for indeterminate: if not all selected, select all. Otherwise, unselect all.
    const shouldSelectAll = !isAllSelected

    setSelectedProducts((prevProducts) => {
      const productMap = new Map(prevProducts.map((p) => [p.id, p]))
      variants.forEach((v) => {
        if (shouldSelectAll) {
          productMap.set(v.id, v)
        } else {
          productMap.delete(v.id)
        }
      })
      return Array.from(productMap.values())
    })

    setSelectedProductIds((prevIds) => {
      const idSet = new Set(prevIds)
      variants.forEach((v) => {
        if (shouldSelectAll) {
          idSet.add(v.id)
        } else {
          idSet.delete(v.id)
        }
      })
      return Array.from(idSet)
    })
  }

  const handleExport = () => {
    exportSelectedToExcel(selectedProducts)
    setSelectedProducts([])
    setSelectedProductIds([])
  }

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {selectedProducts.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: '#f0f6ff',
            border: '1px solid #d0e3ff',
            mb: 2
          }}
        >
          <Typography sx={{ fontWeight: 600, color: '#1e3a8a' }}>
            {selectedProducts.length} item{selectedProducts.length > 1 ? 's' : ''} selected
          </Typography>

          <IconButton
            onClick={handleExport}
            sx={{
              bgcolor: '#5b8ec4',
              color: '#fff',
              px: 2,
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#4a7ab0'
              }
            }}
          >
            <Download />
          </IconButton>
        </Box>
      )}

      <Grid container spacing={2}>
        {results.map((result) => {
          const variants = result.hasVariation ? (result.fullData ?? []) : [result]
          const selectedInResult = variants.filter((v) => selectedProductIds.includes(v.id))
          const selectedCount = selectedInResult.length
          const isSelected = selectedCount > 0
          const isAllSelected = selectedCount === variants.length && variants.length > 0

          return (
            <Grid
              size={{
                xs: 12,
                sm: results.length === 1 ? 6 : 6,
                md: results.length === 1 ? 12 : results.length === 2 ? 6 : results.length === 3 ? 4 : 4
              }}
              key={result.id}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  width: { xs: '100%', sm: '250px', md: '250px' },
                  bgcolor: '#fff',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: isSelected ? '2px solid #5b8ec4' : 'none',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6
                  }
                }}
                onClick={() => handleProductClick(result)}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    zIndex: 2,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36
                    // '&:hover': {
                    //   bgcolor: 'white'
                    // }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip
                    title={
                      selectedCount > 0
                        ? `Selected ${selectedCount} ${result.hasVariation ? `of ${variants.length}` : ''} ${
                            selectedCount === 1 && !result.hasVariation ? 'Item' : 'Items'
                          }`
                        : 'Select'
                    }
                  >
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSelected && !isAllSelected}
                      onChange={() => handleCheckboxToggle(result)}
                      sx={{
                        color: '#5b8ec4',
                        '&.Mui-checked': {
                          color: '#5b8ec4'
                        },
                        width: '100%',
                        height: '100%',
                        '& .MuiSvgIcon-root': { fontSize: '30px' }
                      }}
                    />
                  </Tooltip>
                </Box>

                {result.metadata.signed_urls.length > 0 && (
                  <CardMedia
                    component="img"
                    height="170"
                    image={result.metadata.signed_urls[0]}
                    alt={result.metadata.item_num}
                    sx={{
                      objectFit: 'contain',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                  <Typography gutterBottom variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 'bold', mb: 0.5 }}>
                    {`Item No: ${result.metadata.item_num}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {`Price: ${
                      result.metadata?.exw_quotes_per_pc
                        ? roundToInteger(result.metadata.exw_quotes_per_pc) + '$'
                        : 'N/A'
                    }`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default renderSearchResults
