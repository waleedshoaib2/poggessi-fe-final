import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ProductMetadata, ProductResult } from './type'

/** Normalise metadata fields for display and CSV export (handles strings, numbers, null). */
export const toNonEmptyString = (value: unknown): string => {
    if (value == null) return ''
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
    return String(value).trim()
}

const getProgramOrProject = (metadata: ProductMetadata): string => {
    const program = toNonEmptyString((metadata as unknown as Record<string, unknown>).program_name)
    if (program) return program

    const direct = toNonEmptyString((metadata as unknown as Record<string, unknown>).project_name_collection_name)
    if (direct) return direct

    return toNonEmptyString((metadata as unknown as Record<string, unknown>)['Project Name / Collection Name'])
}

const getHTS = (metadata: ProductMetadata): string => {
    const htsCode = toNonEmptyString((metadata as unknown as Record<string, unknown>).hts_code)
    if (htsCode) return htsCode
    return toNonEmptyString((metadata as unknown as Record<string, unknown>).hts)
}

/**
 * Export selected products to CSV (template-aligned columns)
 */
export const exportSelectedToExcel = (data: ProductResult[]) => {
    if (!data || data.length === 0) return

    const exportItems = data.flatMap((product) => {
        if (!product.hasVariation) return [product]
        if (product.hasVariation && Array.isArray(product.fullData)) {
            return product.fullData.map((variation) => ({
                ...product,
                score: variation.score ?? product.score,
                metadata: variation.metadata
            }))
        }
        return []
    })

    if (exportItems.length === 0) return

    const headerRow = [
        'ITEM IMAGE',
        'MOQ',
        'FACTORY',
        'DESCRIPTION',
        'DIMENSIONS',
        'Program / Customer Quote',
        'HTS',
        'CBM / U. VOL',
        'UNIT COST EXW'
    ]

    const dataRows = exportItems.map((item) => {
        const md = item.metadata
        const meta = md as unknown as Record<string, unknown>
        const moq =
            meta.moq_loading_qty ??
            meta.MOQ_Loading_Qty ??
            meta.moq ??
            meta.MOQ
        const factory =
            meta.factory_name ??
            meta.Factory_Name ??
            meta.factory ??
            meta.Factory
        return [
            toNonEmptyString(md?.signed_urls?.[0] ?? ''),
            toNonEmptyString(moq),
            toNonEmptyString(factory),
            toNonEmptyString(md.description) || toNonEmptyString(md.specs),
            toNonEmptyString(md.dims),
            getProgramOrProject(md),
            getHTS(md),
            toNonEmptyString(md.u_vol),
            toNonEmptyString(md.exw_quotes_per_pc)
        ]
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Products')

    const buffer = XLSX.write(workbook, { bookType: 'csv', type: 'array' })
    saveAs(new Blob([buffer], { type: 'text/csv;charset=utf-8' }), 'selected-products.csv')
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
