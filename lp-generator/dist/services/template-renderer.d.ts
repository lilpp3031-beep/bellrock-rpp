import { ProductMetadata } from '../types';
export declare class TemplateRenderer {
    private templates;
    constructor();
    /**
     * Register Handlebars partials
     */
    private registerPartials;
    /**
     * Compile Handlebars templates
     */
    private compileTemplates;
    /**
     * Render LP HTML
     */
    renderHTML(metadata: ProductMetadata, styleConfig?: any): string;
    /**
     * Generate CSS
     */
    private generateCSS;
}
//# sourceMappingURL=template-renderer.d.ts.map