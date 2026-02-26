/**
 * @fileoverview Export Context - Provides project metadata for export operations
 *
 * This context aggregates project metadata (name, description, tech stack, features)
 * from various sources and provides a clean API for export operations. It decouples
 * the Editor component from directly accessing the Wizard store, improving testability
 * and maintainability.
 *
 * @module context/ExportContext
 * @see useWizardStore for the source of project metadata
 * @see exportAsZip for the export function that consumes this data
 */
import { createContext, useContext, useCallback, type ReactNode } from "react";
import type { TechStackItemType } from "@blueprint/shared";
import { useWizardStore } from "../store";
import { DEFAULT_PROJECT_NAME } from "../config/constants";

/**
 * Interface representing project metadata needed for export operations.
 * This is the shape of data provided by the ExportContext.
 */
export interface ExportMetadata {
  projectName: string;
  description: string;
  techStack: TechStackItemType[];
  features: string[];
}

/**
 * Interface for the ExportContext value.
 * Provides access to export metadata and methods to retrieve it.
 */
interface ExportContextType {
  /**
   * Get all export metadata from the current application state.
   * @returns ExportMetadata object containing project details
   */
  getExportMetadata: () => ExportMetadata;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

interface ExportProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages export metadata state.
 * Aggregates data from Wizard store and provides it through context.
 *
 * @param props - Provider props with children
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <ExportProvider>
 *   <Editor />
 * </ExportProvider>
 * ```
 */
export function ExportProvider({ children }: ExportProviderProps): JSX.Element {
  /**
   * Retrieves current export metadata from wizard store.
   * Provides a stable interface for consumers without direct store access.
   *
   * @returns ExportMetadata object with project details
   */
  const getExportMetadata = useCallback((): ExportMetadata => {
    const wizardState = useWizardStore.getState();

    return {
      projectName: wizardState.projectName || DEFAULT_PROJECT_NAME,
      description: wizardState.description,
      techStack: wizardState.techStack,
      features: wizardState.features,
    };
  }, []);

  const value: ExportContextType = {
    getExportMetadata,
  };

  return <ExportContext.Provider value={value}>{children}</ExportContext.Provider>;
}

/**
 * Hook to access export metadata from context.
 * Must be used within an ExportProvider.
 *
 * @returns ExportContextType containing getExportMetadata function
 * @throws Error if used outside of ExportProvider
 *
 * @example
 * ```tsx
 * function ExportButton() {
 *   const { getExportMetadata } = useExportContext();
 *
 *   const handleExport = async () => {
 *     const metadata = getExportMetadata();
 *     await exportAsZip({ ...metadata, blueprint, tasks });
 *   };
 * }
 * ```
 */
export function useExportContext(): ExportContextType {
  const context = useContext(ExportContext);

  if (context === undefined) {
    throw new Error("useExportContext must be used within an ExportProvider");
  }

  return context;
}

export { ExportContext };
export type { ExportContextType, ExportProviderProps };
