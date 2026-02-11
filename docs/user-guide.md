# User Guide: Blueprint Generation Workflow

This guide walks you through the complete blueprint generation process, from initial project setup to exporting your generated documentation.

## Quick Start

1. **Open the Application** - Navigate to the Blueprintify web application
2. **Start the Wizard** - Click "Get Started" to begin the 5-step setup process
3. **Follow the Steps** - Complete each wizard section with your project details
4. **Generate** - Click "Generate Blueprint" to create your documentation
5. **Review & Export** - Review the generated content and export as needed

## Detailed Workflow

### Step 1: Project Details

Enter the basic information about your project.

#### Required Fields

- **Project Name** (1-100 characters)
  - Use a descriptive name for your project
  - Example: "Task Management System", "E-commerce Platform"

- **Project Description** (1-1000 characters)
  - Provide a clear overview of what your project does
  - Include main purpose and key features
  - Example: "A web-based task management application that helps teams organize and track their work"

#### Optional Fields

- **Target Audience** (1-500 characters)
  - Describe who will use this project
  - Examples: "Individual users", "Small businesses", "Enterprise teams"

- **Project Constraints** (1-1000 characters)
  - List any technical or business constraints
  - Examples: "Must work offline", "Budget under $10,000", "GDPR compliance required"

#### Tips

- Be specific but concise in your description
- Consider your target audience when writing the description
- Include constraints that might affect technology choices

---

### Step 2: Tech Stack Selection

Choose the technologies you want to use in your project.

#### Categories

- **Frontend** - UI frameworks, libraries, and styling tools
- **Backend** - Server-side frameworks and languages
- **Database** - Data storage solutions
- **DevOps** - Deployment and infrastructure tools
- **Testing** - Testing frameworks and tools
- **AI/ML** - Artificial Intelligence and Machine Learning tools
- **Other** - Additional tools and utilities

#### Selection Process

1. **Browse Categories** - Click on category tabs to see available options
2. **Select Technologies** - Click on any technology to add it to your stack
3. **Minimum Selection** - You must select at least one technology
4. **Visual Feedback** - Selected items are highlighted and added to your summary

#### Popular Combinations

- **MERN Stack**: MongoDB, Express, React, Node.js
- **LAMP Stack**: Linux, Apache, MySQL, PHP
- **JAMstack**: JavaScript, APIs, Markup
- **Modern Frontend**: React, TypeScript, Tailwind CSS, Vite

#### Tips

- Choose technologies you're familiar with or want to learn
- Consider how technologies work together
- Think about your deployment environment
- Don't select too many technologies - keep it focused

---

### Step 3: Features Selection

Define the specific features and functionality you want in your project.

#### Adding Features

1. **Manual Input** - Type a feature name and press Enter
2. **Suggested Features** - Click on suggested features to add them quickly
3. **Feature List** - View and manage all added features

#### Feature Categories

Common feature categories include:

- **User Management** - Authentication, authorization, profiles
- **Data Management** - CRUD operations, search, filtering
- **Communication** - Notifications, messaging, chat
- **Analytics** - Reporting, dashboards, metrics
- **Integration** - Third-party APIs, webhooks
- **Performance** - Caching, optimization, scaling

#### Examples

```
User authentication and registration
Real-time notifications
Data export (CSV, PDF)
Search and filtering
Mobile responsive design
Integration with Google Calendar
Admin dashboard
```

#### Tips

- Be specific about features (e.g., "User authentication with OAuth" instead of just "Auth")
- Prioritize features - most important first
- Consider your project scope - don't over-feature
- Think about user experience and business value

---

### Step 4: Review & Generate

Review your complete project configuration before generating the blueprint.

#### Review Sections

- **Project Details** - Your project name, description, and optional fields
- **Tech Stack** - All selected technologies with categories
- **Features** - Complete list of requested features
- **Summary** - Total count of technologies and features

#### Editing Options

- **Edit Buttons** - Click "Edit" next to any section to go back and modify
- **Quick Navigation** - Use keyboard shortcuts (Alt+1-4) to jump to any step
- **Back Navigation** - Use the back button to go to previous steps

#### Generation Process

1. **Click "Generate Blueprint"** - Start the AI generation process
2. **Wait for Processing** - The AI analyzes your inputs and creates documentation
3. **Real-time Updates** - See progress statistics during generation
4. **Automatic Transition** - Move to the results page when complete

#### Tips

- Double-check all information before generating
- Make sure your description clearly communicates your project goals
- Verify that your tech stack and features align
- Consider the complexity - more complex projects take longer to generate

---

### Step 5: Generation Progress

Monitor the blueprint generation in real-time.

#### Progress Indicators

- **Loading Animation** - Visual indicator that generation is in progress
- **Statistics** - Live counts of lines and sections generated
- **Status Messages** - Updates on generation progress

#### What's Being Generated

- **blueprint.md** - Comprehensive project architecture document
- **task.md** - Detailed implementation tasks and priorities
- **Structure** - Recommended folder and file organization

#### Processing Time

- **Simple Projects** - 30-60 seconds
- **Medium Projects** - 1-2 minutes
- **Complex Projects** - 2-5 minutes

#### Tips

- Be patient during generation - complex analysis takes time
- Don't close the browser window during generation
- If generation fails, you can try again with adjusted inputs

---

## Post-Generation Workflow

### Session Persistence with LocalStorage ✅ AVAILABLE

Blueprintify automatically saves your work to browser localStorage, ensuring you never lose your progress:

#### Auto-Save Features

- **Wizard State**: Your project configuration is saved after each step
- **Generated Content**: Blueprints and tasks are automatically saved
- **Editor State**: Your edits are preserved in real-time
- **Session Management**: Access previous sessions from the session library

#### Storage Capabilities

- **Persistent Storage**: Work persists across browser sessions
- **Multiple Sessions**: Store multiple blueprints with metadata
- **Smart Cleanup**: Automatic storage quota management
- **Import/Export**: Backup and restore your blueprints

#### Session Organization

- **Title & Description**: Organize sessions with custom titles
- **Tagging System**: Tag sessions for easy categorization
- **Archive Management**: Archive old sessions while keeping them accessible
- **Sorting & Filtering**: Find sessions quickly with advanced search

For detailed technical specifications, see the [LocalStorage Schema Documentation](./localstorage-schema.md).

### Split-Pane Editor ✅ AVAILABLE

After generation, you'll have access to a split-pane editor where you can:

- **View Generated Content** - See your blueprint.md and task.md files side-by-side
- **Edit Content** - Modify generated content using the CodeMirror code editor
- **Live Preview** - See markdown rendering in real-time as you type
- **AI Refinement** - Use AI assistance to improve specific sections (M2 feature)

### AI Refinement Workflow ✅ AVAILABLE (M2)

Enhance your blueprints with AI-powered refinement capabilities:

#### Refinement Types

- **Regenerate**: Complete regeneration of selected sections
- **Enhance**: Improve and expand existing content
- **Expand**: Add more detail and examples
- **Simplify**: Simplify complex content
- **Fix**: Address specific issues or bugs
- **Custom**: Custom refinement with your own prompts

#### Key Features

- **Section-Based Selection**: Select specific sections to refine
- **Edit Preservation**: Protect your manual edits during regeneration
- **Real-Time Streaming**: Watch refinements happen live
- **Undo/Redo System**: Full change history with rollback capability
- **Context Awareness**: Maintains project context throughout refinements

#### Workflow Process

1. **Select Sections** - Choose which sections to refine
2. **Choose Refinement Type** - Pick the appropriate refinement strategy
3. **Add Custom Instructions** (Optional) - Provide specific guidance
4. **Execute Refinement** - AI processes while preserving manual edits
5. **Review & Apply** - Review changes and apply or modify

For detailed technical specifications, see the [Refinement Workflow Documentation](./refinement-workflow.md).

### Export Options ✅ COMPREHENSIVE

#### Download ZIP

1. **Click "Download ZIP"** - Export all generated files
2. **File Structure** - Receive a organized .docs/ folder
3. **Contents Include**:
   - blueprint.md (main architecture document)
   - task.md (implementation tasks)
   - README.md (project overview)
   - Contributing guidelines (if applicable)

#### Copy to Clipboard

1. **Select Content** - Choose specific sections or entire documents
2. **Copy** - Use the copy button to copy markdown to clipboard
3. **Paste** - Paste into your preferred editor or documentation system

#### Advanced Export & Import ✅ AVAILABLE

Blueprintify supports comprehensive data portability with multiple export formats:

##### Export Formats

- **JSON Format** (.blueprint) - Complete data export with metadata
- **ZIP Archive** (.zip) - Structured archive with all files and assets
- **Markdown Files** (.md) - Human-readable markdown format
- **Custom Templates** - Export with custom formatting

##### Import Capabilities

- **Format Detection** - Automatic format detection and validation
- **Conflict Resolution** - Smart handling of duplicate sessions
- **Schema Migration** - Automatic migration between schema versions
- **Import Preview** - Preview changes before importing
- **Backup Creation** - Automatic backup before imports

##### Key Features

- **Session Management** - Export/import multiple sessions
- **Asset Handling** - Include images, documents, and custom assets
- **Version Compatibility** - Backward and forward compatibility
- **Security Validation** - Comprehensive data validation and sanitization

For detailed technical specifications, see the [Export/Import Documentation](./export-import-specs.md).

#### Save to Cloud (Future Feature)

- Cloud storage integration planned
- Version control and history tracking
- Collaboration features

## Best Practices

### Before Generation

1. **Clear Description** - Write a clear, comprehensive project description
2. **Realistic Scope** - Define achievable features based on your timeline and resources
3. **Appropriate Tech Stack** - Choose technologies that match your skills and project needs
4. **Consider Constraints** - Include budget, timeline, and technical constraints

### During Generation

1. **Be Patient** - Allow sufficient time for comprehensive analysis
2. **Don't Interrupt** - Let the generation complete without interruption
3. **Monitor Progress** - Watch for any error messages or issues

### After Generation

1. **Review Carefully** - Read through all generated content
2. **Customize as Needed** - Modify the content to match your specific needs
3. **Validate Technical Choices** - Ensure the recommended technologies work for your context
4. **Plan Implementation** - Use the task.md to create your development roadmap

## Troubleshooting

### Common Issues

#### Generation Takes Too Long

- **Complex Projects** - More features and tech stack complexity increases generation time
- **Server Load** - High demand may slow down processing
- **Solution** - Try during off-peak hours or simplify your inputs

#### Generation Fails

- **Invalid Inputs** - Check for special characters or extremely long inputs
- **Network Issues** - Ensure stable internet connection
- **API Limits** - OpenAI API may have rate limits
- **Solution** - Refresh the page and try again, or simplify your request

#### Poor Quality Output

- **Vague Description** - Inadequate project descriptions lead to generic outputs
- **Inconsistent Tech Stack** - Conflicting technology choices
- **Too Many Features** - Overly complex feature lists can dilute focus
- **Solution** - Refine your inputs for clarity and consistency

#### Content Not Relevant

- **Mismatched Expectations** - The AI may interpret your inputs differently
- **Missing Context** - Insufficient information about your specific needs
- **Solution** - Provide more detailed descriptions and constraints

### Getting Help

1. **Review Examples** - Look at sample blueprints for reference
2. **Adjust Inputs** - Modify your project details for better results
3. **Use Support** - Contact support through the application
4. **Community** - Join our community forums for tips and examples

## Keyboard Shortcuts

- **Alt + 1** - Jump to Step 1 (Project Details)
- **Alt + 2** - Jump to Step 2 (Tech Stack)
- **Alt + 3** - Jump to Step 3 (Features)
- **Alt + 4** - Jump to Step 4 (Review)
- **Alt + 5** - Jump to Step 5 (Generation)
- **Ctrl/Cmd + E** - Toggle Editor (when available)
- **Escape** - Cancel generation (when in progress)

## Advanced Features

### Custom Templates

Coming soon: Ability to use custom templates for specific project types:

- **SaaS Application** - Pre-configured for subscription-based services
- **E-commerce** - Optimized for online stores
- **Mobile App** - Tailored for mobile application development
- **API Service** - Focused on backend API development

### Integration Options

Future integrations planned:

- **Git Integration** - Direct export to GitHub/GitLab repositories
- **Project Management** - Export to Jira, Trello, or Asana
- **Documentation Platforms** - Export to Notion, Confluence, or ReadMe
- **IDE Integration** - VS Code and other IDE extensions

---

## Examples

### Example 1: Simple Blog Platform

```
Project Name: "Personal Blog Platform"
Description: "A simple blogging platform for writers to publish and manage their articles"
Tech Stack: ["React", "Node.js", "MongoDB", "Tailwind CSS"]
Features: [
  "User authentication",
  "Article creation and editing",
  "Comment system",
  "Search functionality",
  "Responsive design"
]
```

### Example 2: E-commerce Application

```
Project Name: "Online Fashion Store"
Description: "An e-commerce platform for selling clothing and accessories with payment processing"
Tech Stack: ["Next.js", "Stripe", "PostgreSQL", "Redis", "Docker"]
Features: [
  "Product catalog with categories",
  "Shopping cart and checkout",
  "Payment processing with Stripe",
  "User accounts and profiles",
  "Order tracking",
  "Admin dashboard",
  "Inventory management",
  "Email notifications"
]
```

### Example 3: Task Management System

```
Project Name: "Team Task Manager"
Description: "Collaborative task management system for teams to organize and track work"
Tech Stack: ["Vue.js", "Express.js", "PostgreSQL", "Socket.io", "Docker"]
Features: [
  "User authentication and teams",
  "Project and task creation",
  "Kanban board view",
  "Real-time collaboration",
  "Time tracking",
  "Reporting and analytics",
  "File attachments",
  "Mobile app support"
]
```

---

## FAQ

### Q: How accurate are the generated blueprints?

A: The AI provides well-researched recommendations based on your inputs, but always review and customize for your specific context.

### Q: Can I modify the generated content?

A: Yes! The generated content is a starting point. Use the editor to customize and refine as needed.

### Q: What programming languages are supported?

A: The system supports any modern programming language and framework through natural language description.

### Q: Is my data private?

A: Yes, your project data is used only for generation and is not stored or shared.

### Q: Can I generate blueprints for existing projects?

A: Yes! Use the current state of your project as input to get recommendations for improvements and next steps.

---

For additional help or questions, please visit our [support page](./support.md) or create an issue in the GitHub repository.
