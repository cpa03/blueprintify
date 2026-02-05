import { getDatabase, queries, dbHelpers } from "../db";
import { TechStackItem } from "@blueprint/shared";
import type { z } from "zod";

// Infer the TypeScript type from the Zod schema
type TechStackItemType = z.infer<typeof TechStackItem>;

export interface Project {
  id: string;
  name: string;
  description: string;
  target_audience?: string;
  constraints?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  tech_stack?: TechStackItemType[];
  features?: string[];
}

export interface CreateProjectData {
  name: string;
  description: string;
  target_audience?: string;
  constraints?: string;
  tech_stack?: TechStackItemType[];
  features?: string[];
}

export class ProjectService {
  /**
   * Create a new project with tech stack and features
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    const id = dbHelpers.generateId();

    try {
      const db = getDatabase();

      // Insert project
      await db
        .prepare(
          queries.createProject(
            id,
            data.name,
            data.description,
            data.target_audience,
            data.constraints,
          ).sql,
        )
        .bind(
          ...queries.createProject(
            id,
            data.name,
            data.description,
            data.target_audience,
            data.constraints,
          ).params,
        )
        .run();

      // Insert tech stack items
      if (data.tech_stack && data.tech_stack.length > 0) {
        for (const item of data.tech_stack) {
          const techId = dbHelpers.generateId();
          await db
            .prepare(
              `
            INSERT INTO project_tech_stack (id, project_id, name, category, version)
            VALUES (?, ?, ?, ?, ?)
          `,
            )
            .bind(techId, id, item.name, item.category, item.version)
            .run();
        }
      }

      // Insert features
      if (data.features && data.features.length > 0) {
        for (const feature of data.features) {
          const featureId = dbHelpers.generateId();
          await db
            .prepare(
              `
            INSERT INTO project_features (id, project_id, feature)
            VALUES (?, ?, ?)
          `,
            )
            .bind(featureId, id, feature)
            .run();
        }
      }

      return (await this.getProject(id)) as Project;
    } catch (error) {
      dbHelpers.handleError(error, "createProject");
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(queries.getProject(id).sql)
        .bind(...queries.getProject(id).params)
        .first();

      return result || null;
    } catch (error) {
      dbHelpers.handleError(error, "getProject");
      throw error;
    }
  }

  /**
   * Get project with full details including tech stack and features
   */
  async getProjectWithDetails(id: string): Promise<ProjectWithDetails | null> {
    try {
      const project = await this.getProject(id);
      if (!project) return null;

      const [techStack, features] = await Promise.all([
        this.getProjectTechStack(id),
        this.getProjectFeatures(id),
      ]);

      return {
        ...project,
        tech_stack: techStack,
        features: features.map((f) => f.feature),
      };
    } catch (error) {
      dbHelpers.handleError(error, "getProjectWithDetails");
      throw error;
    }
  }

  /**
   * Get project tech stack
   */
  async getProjectTechStack(projectId: string): Promise<TechStackItemType[]> {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        SELECT name, category, version
        FROM project_tech_stack
        WHERE project_id = ?
        ORDER BY created_at
      `,
        )
        .bind(projectId)
        .all();

      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "getProjectTechStack");
      throw error;
    }
  }

  /**
   * Get project features
   */
  async getProjectFeatures(projectId: string): Promise<
    Array<{
      id: string;
      feature: string;
      created_at: string;
    }>
  > {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        SELECT id, feature, created_at
        FROM project_features
        WHERE project_id = ?
        ORDER BY created_at
      `,
        )
        .bind(projectId)
        .all();

      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "getProjectFeatures");
      throw error;
    }
  }

  /**
   * List projects with pagination
   */
  async listProjects(limit = 20, offset = 0): Promise<Project[]> {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        SELECT * FROM projects
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?
      `,
        )
        .bind(limit, offset)
        .all();

      return result.results || [];
    } catch (error) {
      dbHelpers.handleError(error, "listProjects");
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    data: Partial<CreateProjectData>,
  ): Promise<Project | null> {
    try {
      const db = getDatabase();

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      if (data.name !== undefined) {
        updateFields.push("name = ?");
        updateParams.push(data.name);
      }
      if (data.description !== undefined) {
        updateFields.push("description = ?");
        updateParams.push(data.description);
      }
      if (data.target_audience !== undefined) {
        updateFields.push("target_audience = ?");
        updateParams.push(data.target_audience);
      }
      if (data.constraints !== undefined) {
        updateFields.push("constraints = ?");
        updateParams.push(data.constraints);
      }

      if (updateFields.length > 0) {
        updateFields.push("updated_at = ?");
        updateParams.push(dbHelpers.now());
        updateParams.push(id);

        await db
          .prepare(
            `
          UPDATE projects
          SET ${updateFields.join(", ")}
          WHERE id = ?
        `,
          )
          .bind(...updateParams)
          .run();
      }

      return await this.getProject(id);
    } catch (error) {
      dbHelpers.handleError(error, "updateProject");
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      const db = getDatabase();
      const result = await db
        .prepare(
          `
        DELETE FROM projects WHERE id = ?
      `,
        )
        .bind(id)
        .run();

      return (result.changes || 0) > 0;
    } catch (error) {
      dbHelpers.handleError(error, "deleteProject");
      throw error;
    }
  }
}

export const projectService = new ProjectService();
