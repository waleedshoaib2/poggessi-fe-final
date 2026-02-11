'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  CardMedia,
  Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ProductResult } from '@/app/config/type'
import Variants from './variants'
import { ArrowBack } from '@mui/icons-material'
import { roundToInteger } from '@/app/config/helper'

interface ProductDetailsDialogProps {
  open: boolean
  onClose: () => void
  product: ProductResult // Using any to match the flexible metadata structure
  back?: boolean
  selectedProductIds: string[]
  selectedProducts: ProductResult[]
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>
  setSelectedProducts: React.Dispatch<React.SetStateAction<ProductResult[]>>
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onClose,
  product,
  back,
  selectedProductIds,
  selectedProducts,
  setSelectedProductIds,
  setSelectedProducts
}) => {
  if (!product) return null

  // const { metadata, score } = product
  const { metadata } = product
  const imageUrl = metadata.signed_urls && metadata.signed_urls.length > 0 ? metadata.signed_urls[0] : ''

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '16px',
          bgcolor: 'white',
          maxWidth: '800px'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2 }}>
        <Box
          display="flex"
          justifyContent={back ? 'space-between' : product.hasVariation === false ? 'space-between' : 'flex-end'}
          alignItems="flex-start"
        >
          {back && (
            <Tooltip title="Back" color="primary" placement="top">
              <IconButton onClick={onClose} size="small">
                <ArrowBack />
              </IconButton>
            </Tooltip>
          )}
          {(product.hasVariation === false || back === true) && (
            <Box>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {metadata.item_num ? `Item No: ${metadata.item_num}` : 'N/A'}
              </Typography>
            </Box>
          )}

          <Tooltip title="Close" color="primary" placement="top">
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {product.hasVariation ? (
        <Variants
          result={product}
          imageUrl={imageUrl}
          selectedProductIds={selectedProductIds}
          selectedProducts={selectedProducts}
          setSelectedProductIds={setSelectedProductIds}
          setSelectedProducts={setSelectedProducts}
          onClose={onClose}
        />
      ) : (
        <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
          {/* Product Image */}
          <Typography variant="body1" sx={{ mt: 0.5 }}>
            Price: {metadata?.exw_quotes_per_pc ? roundToInteger(metadata?.exw_quotes_per_pc) + '$' : 'N/A'}
          </Typography>

          {/* <Typography variant="body1" color="text.secondary">
            Similarity: {(score * 100).toFixed(0)}%
          </Typography> */}
          <Box
            sx={{
              width: '100%',
              height: '290px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #e0e0e0',
              my: 2,
              backgroundColor: '#f5f5f5' // Background for empty space
            }}
          >
            {imageUrl ? (
              <CardMedia
                component="img"
                height="290px"
                image={imageUrl}
                alt={metadata.item_num}
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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Item No.
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.item_num || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Specifications:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.specs || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Dimensions:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.dims?.split('1.')[0] || 'N/A'}
                </Typography>
              </Grid>

              {/* Row 2 */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Request Date:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.request_date || '2024-11-24'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Quote Date:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.quote_date || '2024-11-26'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Factory Name:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.factory_name || 'MX'}
                </Typography>
              </Grid>

              {/* Row 3 */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Sample Status:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.sample_status || 'No Sample Request'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  MOQ Loading Qty:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.moq_loading_qty || '65'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Volume:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.u_vol || '0.3'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Source:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.source || '0.3'}
                </Typography>
              </Grid>

              {/* Material - Full Width */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Material:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {metadata.material_finishing || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default ProductDetailsDialog
