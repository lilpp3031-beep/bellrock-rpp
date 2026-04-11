import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export interface TemplateData {
  title: string;
  subtitle?: string;
  heroImage?: string;
  features: string[];
  description?: string;
  ctaText?: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export class TemplateRendererService {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    
    this.templateCache.set(templateName, template);
    return template;
  }

  async renderTemplate(templateName: string, data: TemplateData): Promise<string> {
    try {
      const template = await this.loadTemplate(templateName);
      const html = template(data);
      console.log(`✅ Template rendered: ${templateName} (${data.title})`);
      return html;
    } catch (error) {
      console.error(`❌ Failed to render ${templateName}: ${error}`);
      throw error;
    }
  }

  async generateLPFromAnalysis(analysisData: any): Promise<string> {
    // Design analysis data を TemplateData に変換
    const templateData: TemplateData = {
      title: analysisData.title || 'Product',
      subtitle: analysisData.category,
      heroImage: analysisData.heroImage,
      features: analysisData.features?.slice(0, 4) || [],
      description: analysisData.description,
      ctaText: '詳細を見る',
      category: analysisData.category,
      colors: {
        primary: analysisData.colors?.primary?.[0] || '#FF9900',
        secondary: analysisData.colors?.secondary?.[0] || '#146EB4',
      },
    };

    // テンプレート名をカテゴリから決定
    let templateName = 'amazon-base';
    if (analysisData.category === 'beauty') {
      templateName = 'amazon-base';
    } else if (analysisData.category === 'tools') {
      templateName = 'amazon-base';
    } else if (analysisData.category === 'furniture') {
      templateName = 'amazon-base';
    }

    return this.renderTemplate(templateName, templateData);
  }

  registerPartial(name: string, content: string): void {
    Handlebars.registerPartial(name, content);
  }

  registerHelper(name: string, fn: any): void {
    Handlebars.registerHelper(name, fn);
  }
}
