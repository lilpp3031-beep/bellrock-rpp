// Job Management Types
export interface GenerationJob {
  id: string;
  url: string;
  status: JobStatus;
  progress: number; // 0-100
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

// Scraping Types
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

// Extraction Types
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

// Template Types
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

// Export Types
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

// API Request/Response Types
export interface GenerateLPRequest {
  url?: string;
  asins?: string[];
  referenceUrl?: string; // Amazon URL for LP text reference
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

// Design Analysis Types (Phase 1: Amazon Design Learning)
export interface DesignAnalysis {
  url: string;
  category: string; // 'beauty' | 'tools' | 'furniture' | 'other'
  textAnalysis: {
    title: string;
    features: string[];
    description: string;
  };
  designAnalysis: {
    sections: LayoutSection[];
    colors: {
      primary: string[];
      secondary: string[];
      background: string[];
      text: string[];
    };
    layout: {
      type: 'grid' | 'flex' | 'stacked' | 'carousel';
      alignment: 'left' | 'center' | 'right';
      spacing: 'compact' | 'normal' | 'spacious';
    };
    typography: {
      heading: {
        size: string;
        weight: 'normal' | 'bold' | 'extra-bold';
        fontFamily: string;
      };
      body: {
        size: string;
        weight: 'normal' | 'regular';
        fontFamily: string;
        lineHeight: string;
      };
      cta: {
        size: string;
        weight: 'bold' | 'semi-bold';
        style: 'button' | 'link' | 'underline';
      };
    };
    imagery: {
      style: 'hero-dominant' | 'gallery-grid' | 'carousel' | 'product-showcase';
      imageCount: number;
      aspectRatio: 'square' | 'horizontal' | 'vertical' | 'mixed';
    };
  };
  timestamp: Date;
}

export interface LayoutSection {
  name: string;
  order: number;
  backgroundColor?: string;
  height: 'short' | 'medium' | 'tall';
  contentType: 'image' | 'text' | 'mixed' | 'cta';
}

// Logger Types
export interface LogContext {
  jobId?: string;
  url?: string;
  step?: string;
}
