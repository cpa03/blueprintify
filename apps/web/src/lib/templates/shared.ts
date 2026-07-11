import type { TechStackItemType } from "@blueprint/shared/types";

export interface ExportFiles {
  blueprint: string;
  tasks: string;
  projectName: string;
  techStack: TechStackItemType[];
  description: string;
  features: string[];
}

export interface ImportFile {
  file: File;
  onImport: (content: string) => void;
  onError: (error: string) => void;
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

- Node.js 18+ (for JavaScript/TypeScript projects)
- Python 3.8+ (for Python projects)

### Installation

\`\`\`bash
npm install  # or: yarn install
pip install -r requirements.txt
\`\`\`

### Development

\`\`\`bash
npm run dev  # or: yarn dev
python src/main.py  # or: python manage.py runserver (Django)
\`\`\`

### Build

\`\`\`bash
npm run build  # or: yarn build
\`\`\`

## Project Structure

\`\`\`
.
├── src/                 # Source code
├── public/              # Static assets (if applicable)
├── tests/               # Test files
├── docs/                # Documentation
└── README.md            # This file
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
`;
}
