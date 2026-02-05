import { getDatabase, queries, dbHelpers } from "../db";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  default_description: string;
  project_name_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateWithDetails extends Template {
  tech_stack?: string[];
  features?: string[];
}

export class TemplateService {
  /**
   * Get all active templates
   */
  async getActiveTemplates(): Promise<Template[]> {
    try {
      const db = getDatabase();
      const result = await db.prepare(queries.getActiveTemplates().sql).all();
      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "getActiveTemplates");
      throw error; // TypeScript doesn't know handleError throws
    }
  }

  /**
   * Get template with full details including tech stack and features
   */
  async getTemplateWithDetails(
    id: string,
  ): Promise<TemplateWithDetails | null> {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(queries.getTemplateWithDetails(id).sql)
        .bind(...queries.getTemplateWithDetails(id).params)
        .first();

      if (!result) return null;

      return {
        ...result,
        tech_stack: result.tech_stack ? result.tech_stack.split(",") : [],
        features: result.features ? result.features.split(",") : [],
      };
    } catch (error) {
      dbHelpers.handleError(error, "getTemplateWithDetails");
      throw error;
    }
  }

  /**
   * Get template tech stack options
   */
  async getTemplateTechStack(templateId: string): Promise<
    Array<{
      id: string;
      name: string;
      category: string;
      is_default: boolean;
      sort_order: number;
    }>
  > {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        SELECT id, name, category, is_default, sort_order
        FROM template_tech_stack
        WHERE template_id = ?
        ORDER BY sort_order, name
      `,
        )
        .bind(templateId)
        .all();

      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "getTemplateTechStack");
      throw error;
    }
  }

  /**
   * Get template features
   */
  async getTemplateFeatures(templateId: string): Promise<
    Array<{
      id: string;
      feature: string;
      sort_order: number;
    }>
  > {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        SELECT id, feature, sort_order
        FROM template_features
        WHERE template_id = ?
        ORDER BY sort_order, feature
      `,
        )
        .bind(templateId)
        .all();

      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "getTemplateFeatures");
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        SELECT * FROM templates
        WHERE category = ? AND is_active = 1
        ORDER BY name
      `,
        )
        .bind(category)
        .all();

      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "getTemplatesByCategory");
      throw error;
    }
  }
}

export const templateService = new TemplateService();
