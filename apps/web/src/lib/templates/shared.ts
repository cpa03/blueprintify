import type { TechStackItemType } from "@blueprint/shared/types";
import { TEMPLATE_README_DEFAULTS } from "@blueprint/shared/config";

export interface ExportFiles {
  blueprint: string;
  tasks: string;
  projectName: string;
  techStack: TechStackItemType[];
  description: string;
  features: string[];
}

export interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  description?: string;
  main?: string;
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function generateProjectReadme(
  projectName: string,
  description: string,
  features: string[],
  techStack: string
): string {
  return `# ${projectName}

${description}

## Features

${features.map((feature) => `- ${feature}`).join("\n")}

## Tech Stack

- ${techStack}

## Getting Started

### Prerequisites

- ${TEMPLATE_README_DEFAULTS.NODE_VERSION} (for JavaScript/TypeScript projects)
- ${TEMPLATE_README_DEFAULTS.PYTHON_VERSION} (for Python projects)

### Installation

\`\`\`bash
${TEMPLATE_README_DEFAULTS.INSTALL_COMMANDS}
\`\`\`

### Development

\`\`\`bash
${TEMPLATE_README_DEFAULTS.DEV_COMMANDS}
\`\`\`

### Build

\`\`\`bash
${TEMPLATE_README_DEFAULTS.BUILD_COMMANDS}
\`\`\`

## Project Structure

\`\`\`
${TEMPLATE_README_DEFAULTS.PROJECT_STRUCTURE}
\`\`\`

## Contributing

${TEMPLATE_README_DEFAULTS.CONTRIBUTING_GUIDELINES}

## License

${TEMPLATE_README_DEFAULTS.LICENSE}
`;
}
