"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractorService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
class ExtractorService {
    constructor() {
        this.client = new sdk_1.default({
            apiKey: process.env.CLAUDE_API_KEY,
        });
    }
    /**
     * Analyze scraped content and extract product metadata
     */
    async analyzeContent(scrapedContent, context) {
        logger.info({ url: scrapedContent.url, imageCount: scrapedContent.images.length, tone: context?.tone, hasAmazonReference: !!context?.amazonReferenceText }, 'Analyzing content with Claude API');
        const prompt = this.buildExtractionPrompt(scrapedContent, context);
        try {
            const response = await this.client.messages.create({
                model: 'claude-opus-4-6',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            // Parse response
            const content = response.content[0];
            if (content.type !== 'text') {
                throw new Error('Unexpected response type from Claude API');
            }
            return this.parseExtractionResponse(content.text);
        }
        catch (error) {
            logger.error({ error, url: scrapedContent.url }, 'Failed to analyze content with Claude API');
            // Fallback to basic extraction
            return this.fallbackExtraction(scrapedContent);
        }
    }
    /**
     * Analyze images with Claude Vision API
     * Note: Currently disabled - requires base64-encoded images
     */
    async analyzeImages(imageUrls) {
        logger.info({ count: imageUrls.length }, 'Image analysis requested (currently disabled)');
        // TODO: Implement when needed with base64-encoded images
        // For now, return placeholder descriptions
        return imageUrls.slice(0, 5).map((url) => ({
            url,
            description: 'Product image from source URL',
        }));
    }
    /**
     * Generate Japanese product description from raw text with tone
     */
    async generateDescription(rawText, productName, maxLength = 200, tone = 'casual') {
        const toneInstructions = this.getToneInstructions(tone);
        const prompt = `以下の商品情報を基に、自然な日本語の商品説明を${maxLength}文字以内で生成してください。

商品名: ${productName}

元のテキスト:
${rawText.substring(0, 1000)}

【トーン&マナー】
${toneInstructions}

要件:
- 自然な日本語で、分かりやすく
- 元のテキストを意味的に再構成（直接コピーではなく）
- 著作権を尊重した独立した説明
- 消費者の関心を引く内容
- 上記のトーンに合わせた説明`;
        try {
            const response = await this.client.messages.create({
                model: 'claude-opus-4-6',
                max_tokens: 500,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return content.text.trim().substring(0, maxLength);
            }
            return '';
        }
        catch (error) {
            logger.warn({ productName, error }, 'Failed to generate description');
            return rawText.substring(0, maxLength);
        }
    }
    /**
     * Build extraction prompt with tone awareness
     */
    buildExtractionPrompt(scrapedContent, context) {
        const toneInstructions = this.getToneInstructions(context?.tone || 'casual');
        let amazonSection = '';
        if (context?.amazonReferenceText) {
            amazonSection = `

【Amazonライバル商品の参考テキスト】（これを参考に、より説得力のある説明を生成してください）
${context.amazonReferenceText.substring(0, 1500)}

注意: 上記のAmazonテキストは参考としてのみ使用し、直接コピーしないでください。`;
        }
        return `与えられたウェブページの内容から、以下の情報を抽出してJSON形式で返してください:

ページタイトル: ${scrapedContent.pageTitle}
ページ説明: ${scrapedContent.pageDescription}

テキストコンテンツ:
${scrapedContent.textContent.substring(0, 2000)}

${context?.brand ? `ブランド: ${context.brand}` : ''}
${context?.category ? `カテゴリ: ${context.category}` : ''}

【トーン&マナー】
${toneInstructions}${amazonSection}

以下をJSON形式で抽出してください:
{
  "productName": "商品名（日本語）",
  "description": "商品説明（100-200字、自然な日本語、${context?.amazonReferenceText ? '参考Amazonテキストのように説得力のある、' : ''}元のテキストを意味的に再構成したもの）",
  "features": ["特徴1", "特徴2", "特徴3"],
  "specifications": [
    {"key": "寸法", "value": "値"},
    {"key": "重量", "value": "値"},
    {"key": "材質", "value": "値"}
  ],
  "targetAudience": "ターゲット層の説明"
}

重要な注意:
- 元のテキストを直接コピーしないでください。意味的に再構成してください。
- ${context?.amazonReferenceText ? 'Amazonテキストも参考にしながら、より説得力のある説明を生成してください。' : ''}
- 著作権を尊重したオリジナルな説明を生成してください。
- 不確実な情報は推測しないでください。
- 上記のトーン&マナーに従って説明を生成してください。`;
    }
    /**
     * Get tone-specific instructions
     */
    getToneInstructions(tone) {
        const instructions = {
            serious: '- 信頼性とプロフェッショナリズムを重視\n- フォーマルで丁寧な言葉遣い\n- 客観的事実に基づいた説明\n- 専門性と品質感を伝える',
            casual: '- 親しみやすく、わかりやすい説明\n- 会話的で親しみのある文体\n- ユーザーに話しかけるような口調\n- 親密感と親近感を重視',
            luxury: '- 高級感と洗練さを表現\n- エレガントで上品な言葉選び\n- プレミアム感と特別感を演出\n- 品質、希少性、排他性を強調',
            playful: '- 楽しく、軽快なトーン\n- ユーモアと笑顔を含める\n- ポップで親しみやすい表現\n- 親友と話すような親密さ',
            technical: '- 詳細で正確な情報重視\n- 技術用語と仕様の詳述\n- 機能と性能を具体的に説明\n- エンジニアや専門家向けのアプローチ',
        };
        return instructions[tone] || instructions['casual'];
    }
    /**
     * Parse Claude API extraction response
     */
    parseExtractionResponse(responseText) {
        try {
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                productName: parsed.productName || 'Unknown Product',
                description: parsed.description || '',
                features: Array.isArray(parsed.features) ? parsed.features : [],
                specifications: Array.isArray(parsed.specifications)
                    ? parsed.specifications
                    : [],
                pricing: parsed.pricing,
                targetAudience: parsed.targetAudience,
            };
        }
        catch (error) {
            logger.warn({ error, responseText: responseText.substring(0, 200) }, 'Failed to parse extraction response');
            return {
                productName: 'Unknown Product',
                description: '',
                features: [],
                specifications: [],
            };
        }
    }
    /**
     * Fallback extraction without Claude API
     */
    fallbackExtraction(scrapedContent) {
        logger.info('Using fallback extraction');
        return {
            productName: scrapedContent.pageTitle || 'Product',
            description: scrapedContent.pageDescription || scrapedContent.textContent.substring(0, 200),
            features: [],
            specifications: [],
        };
    }
}
exports.ExtractorService = ExtractorService;
//# sourceMappingURL=extractor.service.js.map