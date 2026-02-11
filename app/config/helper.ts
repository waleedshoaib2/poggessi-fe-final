import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ProductMetadata, ProductResult } from './type'

/**
 * Convert metadata to a flat Excel row
 */
const mapMetadataToRow = (item: ProductResult, metadata: ProductMetadata) => ({
    Item_No: metadata.item_num ?? '',
    Price: metadata.exw_quotes_per_pc ? roundToInteger(metadata.exw_quotes_per_pc) + '$' : 'N/A',
    Specifications: metadata.specs ?? '',
    Dimensions: metadata.dims ?? '',
    'Request Date': item.metadata.request_date ?? '',
    'Quote Date': metadata.quote_date ?? '',
    'Factory Name': metadata.factory_name ?? '',
    'Sample Status': item.metadata.sample_status ?? '',
    'MOQ Loading Qty': metadata.moq_loading_qty ?? '',
    Program: metadata.program_name ?? '',
    Score: item.score ? (item.score * 100)?.toFixed(2) : 'N/A',
    Volume: item.metadata.u_vol ?? '',
    Source: item.metadata.source ?? '',
})

/**
 * Normalize ProductResult → Excel rows
 */
const normalizeProductForExport = (product: ProductResult) => {
    // CASE 1: No variation → single row
    if (!product.hasVariation) {
        return [mapMetadataToRow(product, product.metadata)]
    }

    // CASE 2: Has variation → map fullData
    if (product.hasVariation && Array.isArray(product.fullData)) {
        return product.fullData.map((variation) =>
            mapMetadataToRow(
                {
                    ...product,
                    score: variation.score ?? product.score
                },
                variation.metadata
            )
        )
    }

    return []
}

/**
 * Export selected products to Excel
 */
export const exportSelectedToExcel = (data: ProductResult[]) => {
    if (!data || data.length === 0) return

    const exportRows = data.flatMap(normalizeProductForExport)

    if (exportRows.length === 0) return

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Products')

    const buffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
    })

    saveAs(new Blob([buffer]), 'selected-products.xlsx')
}

export const roundToInteger = (value: string | number): string => {
    // Handle null, undefined, empty string
    if (value == null || value === '') {
        return '0'
    }

    // Convert to number
    const numValue = Number(value)

    // Check if it's a valid number
    if (isNaN(numValue)) {
        return '0'
    }

    // Round and return as string
    return numValue.toFixed(0)
}

// Usage:
