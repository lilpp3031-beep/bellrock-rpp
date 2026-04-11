export interface GenerationJob {
    id: string;
    url: string;
    status: JobStatus;
    progress: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    result?: GenerationResult;
    tone?: ToneManner;
}
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type ToneManner = 'serious' | 'casual' | 'luxury' | 'playful' | 'technical';
export interface GenerationResult {
    htmlContent: string;
    cssContent: string;
    metadata: ProductMetadata;
    images: ImageAsset[];
    previewUrl?: string;
    downloadUrl?: string;
}
export interface ScrapedContent {
    url: string;
    pageTitle: string;
    pageDescription: string;
    images: ImageUrl[];
    textContent: string;
    structuredData?: Record<string, any>;
    metadata: {
        scrapedAt: Date;
        userAgent: string;
        sourceAsins?: string[];
    };
}
export interface ImageUrl {
    url: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
}
export interface ExtractedMetadata {
    productName: string;
    description: string;
    features: string[];
    specifications: Specification[];
    pricing?: {
        currency: string;
        amount: number;
        originalAmount?: number;
    };
    targetAudience?: string;
}
export interface ProductMetadata {
    name: string;
    description: string;
    features: string[];
    specs: Specification[];
    images: ImageAsset[];
    sourceUrl: string;
    generatedAt: Date;
}
export interface Specification {
    key: string;
    value: string;
}
export interface ImageAsset {
    id: string;
    url: string;
    alt: string;
    base64?: string;
    width?: number;
    height?: number;
}
export interface LPData {
    title: string;
    product: ProductMetadata;
    sections: Section[];
    style?: StyleConfig;
}
export interface Section {
    type: 'hero' | 'product' | 'features' | 'specs' | 'cta' | 'gallery';
    title?: string;
    content: Record<string, any>;
}
export interface StyleConfig {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'default' | 'minimal' | 'pathbright';
}
export interface ExportOptions {
    format: 'html' | 'php' | 'zip';
    includeImages: boolean;
    imageFormat: 'base64' | 'url' | 'file';
    templateVariant?: 'wordpress' | 'standalone';
}
export interface ExportResult {
    format: string;
    content: Buffer | string;
    filename: string;
    mimeType: string;
}
export interface GenerateLPRequest {
    url?: string;
    asins?: string[];
    referenceUrl?: string;
    tone?: ToneManner;
    options?: {
        style?: 'default' | 'minimal' | 'pathbright';
        includeImages?: boolean;
        targetFormat?: 'html' | 'php' | 'zip';
    };
}
export interface GenerateLPResponse {
    jobId: string;
    status: JobStatus;
    message: string;
}
export interface JobStatusResponse {
    id: string;
    status: JobStatus;
    progress: number;
    result?: GenerationResult;
    error?: string;
}
export interface LogContext {
    jobId?: string;
    url?: string;
    step?: string;
}
//# sourceMappingURL=index.d.ts.map