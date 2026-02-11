'use client'
import React, { Fragment, useCallback, useState } from 'react'

import {
  Box,
  DialogContent,
  Typography,
  CardMedia,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Checkbox,
  DialogActions,
  Button
} from '@mui/material'
import { ProductResult } from '@/app/config/type'
import ProductDetailsDialog from './ProductDetailsDialog'
import { RemoveRedEye } from '@mui/icons-material'
import { roundToInteger } from '@/app/config/helper'

interface Variant {
  result: ProductResult
  imageUrl: string
  selectedProductIds: string[]
  selectedProducts: ProductResult[]
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>
  setSelectedProducts: React.Dispatch<React.SetStateAction<ProductResult[]>>
  onClose: () => void
}
const Variants = ({
  result,
  imageUrl,
  selectedProductIds,
  selectedProducts,
  setSelectedProductIds,
  setSelectedProducts,
  onClose
}: Variant) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | undefined>(undefined)

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedProduct(undefined)
  }, [])

  const handleClickVariant = useCallback(
    (id: string) => {
      let filteredResult: ProductResult | undefined
      if (result.fullData) {
        filteredResult = result.fullData.find((v) => v.id === id)
      }
      setSelectedProduct(filteredResult)
      setIsDialogOpen(true)
    },
    [result]
  )

  const handleVariantToggle = (variantId: string) => {
    const variant = result.fullData?.find((v) => v.id === variantId)
    if (!variant) return

    const isSelected = selectedProductIds.includes(variantId)

    setSelectedProductIds((prev) => (isSelected ? prev.filter((id) => id !== variantId) : [...prev, variantId]))
    setSelectedProducts((prev) =>
      isSelected ? prev.filter((p) => p.id !== variantId) : [...prev, variant as ProductResult]
    )
  }

  const currentSelectedVariants = result.variations?.filter((v) => selectedProductIds.includes(v.id)) || []
  const selectedCount = currentSelectedVariants.length

  return (
    <Fragment>
      <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
        {/* Product Image */}
        <Box
          sx={{
            width: '100%',
            height: '290px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #e0e0e0',
            mb: 3,
            backgroundColor: '#f5f5f5' // Background for empty space
          }}
        >
          {imageUrl ? (
            <CardMedia
              component="img"
              height="290px"
              image={imageUrl}
              alt={result.metadata.item_num}
              sx={{
                objectFit: 'contain',
                width: '100%',
                height: '100%'
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography color="text.secondary">No Image Available</Typography>
            </Box>
          )}
        </Box>

        {/* Details Grid */}
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Below are variations of the image:
          </Typography>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: 50 }}>Select</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Dimensions</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Item No.</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Volume</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                '& tr': {
                  // Applies border to the top of every row
                  borderTop: '1px solid #e0e0e0'
                },
                '& tr:first-of-type': {
                  // Optional: Remove border from the first row if you want it
                  // to sit flush against the TableHead
                  borderTop: 'none'
                }
              }}
            >
              {result.hasVariation &&
                result.variations &&
                result.variations.length > 0 &&
                result.variations.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      // cursor: 'pointer',
                      '&:hover': { bgcolor: '#f9f9f9' } // Optional: adds a hover effect
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedProductIds.includes(row.id)}
                        onChange={() => handleVariantToggle(row.id)}
                        sx={{
                          color: '#5b8ec4',
                          '&.Mui-checked': {
                            color: '#5b8ec4'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.dims?.split('1.')[0] || 'N/A'}
                    </TableCell>
                    <TableCell>{row.exw_quotes_per_pc ? roundToInteger(row.exw_quotes_per_pc) + '$' : 'N/A'}</TableCell>
                    <TableCell>{row.item_num}</TableCell>
                    <TableCell>{row.u_vol}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details" color="primary" placement="top">
                        <IconButton onClick={() => handleClickVariant(row.id)}>
                          <RemoveRedEye color="primary" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>

        {selectedProduct && (
          <ProductDetailsDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            product={selectedProduct}
            back={true}
            selectedProductIds={selectedProductIds}
            selectedProducts={selectedProducts}
            setSelectedProductIds={setSelectedProductIds}
            setSelectedProducts={setSelectedProducts}
          />
        )}
      </DialogContent>
      {selectedCount > 0 && (
        <DialogActions sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }}>
          <Button onClick={onClose} variant="contained" color="primary" sx={{ borderRadius: '20px', px: 4 }}>
            Add to excel file ({selectedCount})
          </Button>
        </DialogActions>
      )}
    </Fragment>
  )
}

export default Variants
