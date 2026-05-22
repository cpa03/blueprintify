export type { ExportFiles, ImportFile, PackageJson } from "./shared";
export { generateProjectReadme } from "./shared";

export {
  generateReactProject,
  generateNextLayout,
  generateNextPage,
  generateGlobalCSS,
  generateHeaderComponent,
  generateMainTSX,
  generateAppTSX,
  generateIndexCSS,
  generateAppCSS,
  generateViteEnvDTS,
  generateViteSVG,
} from "./react";

export {
  generateNodeProject,
  generateHonoIndex,
  generateExpressIndex,
  generateBasicNodeIndex,
  generateAPITests,
} from "./node";

export {
  generatePythonProject,
  generateDjangoManagePy,
  generateDjangoSettings,
  generateDjangoURLs,
  generateDjangoWSGI,
  generateDjangoModels,
  generateDjangoViews,
  generateDjangoAppURLs,
  generateFlaskApp,
  generateFlaskModels,
  generateFastAPIIndex,
  generateFastAPIModels,
} from "./python";

export {
  generateStaticProject,
  generateStaticHTML,
  generateStaticCSS,
  generateStaticJS,
} from "./static";
