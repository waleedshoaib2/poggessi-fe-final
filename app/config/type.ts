export interface ProductMetadata {
    description: string
    dims: string
    exw_quotes_per_pc: string
    factory_name: string
    img_ref: string
    item_num: string
    material_finishing: string
    modality: 'text' | 'image'
    moq_loading_qty: number
    program_name: string
    quote_date: string // ISO date string
    request_date: string // ISO date string
    sample_status: string
    specs: string
    tags: string[]
    u_vol: number
    source: string
    signed_urls: string[]
}

export interface ProductVariation {
    id: string
    dims: string
    exw_quotes_per_pc: string
    item_num: string
    tags: string[]
    u_vol: number
}
export interface FullProductData {
    id: string
    score: number
    metadata: ProductMetadata
}

export interface ProductResult {
    id: string
    score: number
    metadata: ProductMetadata
    hasVariation?: boolean
    variations?: ProductVariation[]
    fullData?: FullProductData[]
    variationCount?: number
}

export interface RefinementQuestionOption {
    value: string
    label: string
}

export interface RefinementQuestion {
    id: string
    label: string
    options: RefinementQuestionOption[]
}

export interface SelectedFilter {
    question_id: string;
    selected_value: string;
}
export interface TurnHistoryItem {
    turn_index: number;
    role: 'search' | 'filter' | string; // Use string union if roles are limited
    match_count: number;
    filters_applied: AppliedFilter[];
    selected_filters: AppliedFilter[];
    refinement_questions: RefinementQuestion[];
    created_at: string; // ISO Date string
    is_original: boolean;
}
export interface AppliedFilter {
    question_id: string
    selected_value: string
}

export interface TurnCache {
    matches: ProductResult[]
    refinementQuestions: RefinementQuestion[]
    filtersApplied: AppliedFilter[]
    selectedFilters: AppliedFilter[]
    totalMatches?: number
    groupedMatches?: number
}