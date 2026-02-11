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

### Split-Pane Editor

After generation, you'll have access to a split-pane editor where you can:

- **View Generated Content** - See your blueprint.md and task.md files
- **Edit Content** - Modify generated content using the code editor
- **Live Preview** - See markdown rendering in real-time
- **Refine Content** - Use AI assistance to improve specific sections
- **Syntax Highlighting** - Enjoy markdown syntax highlighting in the editor
- **Auto-Save** - Content is automatically saved to localStorage
- **Undo/Redo** - Full undo/redo support for all editing actions

#### Editor Features

The split-pane editor includes:

- **CodeMirror Integration** - Professional code editing experience
- **Real-time Synchronization** - Editor and preview stay synchronized
- **Dark/Light Themes** - Switch between themes based on your preference
- **Line Numbers** - Toggle line numbers for easier navigation
- **Search & Replace** - Find and replace text within your documents
- **Word Wrap** - Toggle word wrapping for better readability
- **Full Screen Mode** - Focus mode for distraction-free editing

#### Keyboard Shortcuts in Editor

- **Ctrl/Cmd + S** - Save current session
- **Ctrl/Cmd + Z** - Undo last action
- **Ctrl/Cmd + Shift + Z** - Redo last action
- **Ctrl/Cmd + F** - Find text
- **Ctrl/Cmd + H** - Replace text
- **F11** - Toggle full screen mode
- **Escape** - Exit full screen mode

### Export Options

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

#### Save to Cloud (Future Feature)

- Cloud storage integration planned
- Version control and history tracking
- Collaboration features

## Session Persistence

### Auto-Save Functionality

Blueprintify automatically saves your work to browser localStorage, ensuring you never lose progress:

- **Automatic Saving** - Content saves automatically as you work
- **Session Management** - Each blueprint generation creates a new session
- **Cross-Session Persistence** - Your work persists across browser sessions
- **Multiple Sessions** - Save and manage multiple blueprint sessions
- **Offline Access** - Access your saved blueprints even when offline

#### Session Organization

- **Session Titles** - Give your sessions descriptive names for easy identification
- **Tags** - Organize sessions with custom tags
- **Search** - Find sessions quickly using the search functionality
- **Archive** - Archive old sessions to keep your workspace organized
- **Sort & Filter** - Sort sessions by date, title, or tags

#### Storage Management

- **Storage Monitoring** - Monitor your localStorage usage
- **Cleanup Tools** - Automatic cleanup of old/archived sessions
- **Export Backups** - Export sessions as JSON for external backup
- **Import Sessions** - Import previously exported sessions
- **Storage Limits** - Intelligent management to stay within browser limits

#### Session Features

Each saved session includes:

- **Wizard Configuration** - All project settings and selections
- **Generated Content** - Your blueprint.md and task.md files
- **Edit History** - Track changes made during editing
- **Export Count** - Number of times exported
- **Last Accessed** - Timestamp for sorting and identification

## AI-Powered Refinement Workflow

### Selective Content Refinement

The refinement workflow allows you to improve specific sections of your blueprint using AI assistance while preserving your manual edits:

#### Refinement Options

- **Regenerate** - Completely regenerate selected sections with fresh AI output
- **Enhance** - Enhance existing content with more detail and clarity
- **Expand** - Add more comprehensive information to sections
- **Simplify** - Simplify complex content for better readability
- **Fix Issues** - Address specific problems or inconsistencies
- **Custom Instructions** - Provide your own refinement instructions

#### Section Selection

1. **Browse Sections** - View all blueprint sections in an organized tree
2. **Multi-Select** - Select multiple sections for batch refinement
3. **Preview Context** - See related sections for context awareness
4. **Manual Edit Detection** - AI automatically detects and preserves your manual edits
5. **Dependency Analysis** - Understand how sections relate to each other

#### Edit Preservation

- **Smart Detection** - AI identifies your manual edits and modifications
- **Preserve Strategies** - Choose how to handle edits during regeneration
- **Conflict Resolution** - Handle conflicts between AI suggestions and your edits
- **Merge Options** - Intelligent merging of AI content with your modifications
- **Version History** - Track changes through multiple refinement iterations

#### Refinement Process

1. **Select Sections** - Choose which sections to refine
2. **Set Refinement Type** - Select the type of refinement needed
3. **Provide Instructions** - Give specific instructions for the AI
4. **Monitor Progress** - Watch real-time streaming of refined content
5. **Review Changes** - Compare before and after versions
6. **Apply or Discard** - Accept or reject refinement suggestions

#### Streaming Experience

- **Real-time Updates** - See refined content appear as it's generated
- **Progress Indicators** - Track refinement progress for each section
- **Cancellation** - Cancel long-running refinements if needed
- **Error Recovery** - Automatic recovery from network or server issues
- **Partial Results** - Use partial results if refinement is interrupted

#### Advanced Features

- **Batch Refinement** - Refine multiple sections simultaneously
- **Context Awareness** - AI considers your project context and constraints
- **Tone Matching** - Maintains consistent writing style and tone
- **Technical Accuracy** - Ensures technical details remain accurate
- **Best Practices** - Incorporates industry best practices and standards

## Export and Import Functionality

### Exporting Your Blueprints

Blueprintify provides flexible export options to backup and share your work:

#### Supported Export Formats

**JSON Format (.blueprint)**

- Primary format for complete data export
- Includes all session metadata and content
- Machine-readable and version-controlled
- Ideal for backups and data migration

**ZIP Archive (.zip)**

- Contains both blueprint and task files
- Includes supporting assets and metadata
- Perfect for distribution and sharing
- Structured folder organization

**Markdown Files (.md)**

- Individual markdown files for blueprints and tasks
- Human-readable format
- Compatible with any markdown editor
- Great for documentation integration

#### Export Options

**Single Session Export**

- Export one specific session
- Choose format based on your needs
- Include or exclude assets
- Add custom metadata

**Bulk Export**

- Export multiple sessions at once
- Filter by date range, tags, or status
- Include archived sessions if needed
- Create comprehensive backups

**Filtered Export**

- Export sessions matching specific criteria
- Date range filtering
- Tag-based selection
- Word count thresholds
- Archive status filtering

#### Export Process

1. **Select Export Type** - Choose single, bulk, or filtered export
2. **Choose Format** - Select JSON, ZIP, or Markdown format
3. **Configure Options** - Set export preferences and filters
4. **Preview Export** - Review what will be exported
5. **Download File** - Receive your export file
6. **Verify Export** - Check exported content for completeness

### Importing Blueprints

Import previously exported blueprints with comprehensive validation and conflict resolution:

#### Import Validation

Before importing, the system validates your export file:

- **Format Validation** - Checks file format and structure
- **Schema Compatibility** - Ensures compatibility with current version
- **Data Integrity** - Verifies data completeness and consistency
- **Security Scanning** - Checks for malicious content
- **Size Validation** - Ensures file is within acceptable limits

#### Import Options

**Conflict Resolution**

- **Skip** - Skip sessions with conflicts
- **Overwrite** - Replace existing sessions
- **Rename** - Create renamed copies
- **Merge** - Merge with existing sessions
- **Duplicate** - Create duplicates

**Import Settings**

- **Preserve IDs** - Keep original session IDs
- **Import Assets** - Include associated assets
- **Create Backup** - Backup before importing
- **Migration Strategy** - Handle version differences

#### Import Process

1. **Select File** - Choose your export file (JSON or ZIP)
2. **Validation** - Automatic validation and compatibility check
3. **Preview** - Review what will be imported
4. **Conflict Resolution** - Handle any conflicts found
5. **Import Execution** - Process the import
6. **Verification** - Verify imported content

### Advanced Features

#### Migration Support

- **Automatic Migration** - Handles schema version differences
- **Compatibility Matrix** - Shows what features are compatible
- **Migration Path** - Provides upgrade/downgrade options
- **Legacy Support** - Supports older export formats

#### Backup and Recovery

- **Automatic Backups** - Creates backup before major imports
- **Rollback Capability** - Undo import operations
- **Version History** - Track import/export history
- **Recovery Tools** - Recover from corrupted imports

#### Data Management

- **Deduplication** - Detect and handle duplicate sessions
- **Asset Management** - Organize and validate imported assets
- **Tag Preservation** - Maintain existing tag structures
- **Metadata Transfer** - Preserve session metadata

### Best Practices

#### Export Best Practices

- **Regular Backups** - Export frequently to prevent data loss
- **Multiple Formats** - Keep backups in different formats
- **Version Control** - Store exports in version control
- **Offsite Storage** - Keep copies in cloud storage
- **Test Restores** - Verify exported files can be imported

#### Import Best Practices

- **Validate First** - Always use validate endpoint before import
- **Review Conflicts** - Carefully review conflict resolution options
- **Test Imports** - Test imports in a safe environment first
- **Keep Backups** - Never import without a backup
- **Verify Results** - Check imported content after import

#### Troubleshooting

**Common Import Issues**

- **File Corrupted** - Check file integrity and try re-exporting
- **Version Incompatible** - Use migration options or update format
- **Size Limits** - Split large exports into smaller files
- **Permission Denied** - Check file permissions and access rights
- **Network Issues** - Ensure stable connection during import

**Common Export Issues**

- **Export Fails** - Check available storage space
- **Missing Content** - Verify all sessions are selected
- **Format Errors** - Ensure correct format is chosen
- **Asset Problems** - Check asset file sizes and types
- **Timeout Issues** - Export in smaller batches if needed

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
