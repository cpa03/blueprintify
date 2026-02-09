# Frequently Asked Questions (FAQ)

This document answers common questions about Blueprintify, covering setup, usage, troubleshooting, and best practices.

## 🚀 Getting Started

### Q: What are the system requirements for Blueprintify?

**A:** Blueprintify requires:

- **Node.js 18+** - For running the development server
- **npm 8+** - Package manager with workspace support
- **Modern browser** - Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **OpenAI API key** - For AI-powered blueprint generation

### Q: How do I install Blueprintify?

**A:** Follow these steps:

```bash
# 1. Clone the repository
git clone https://github.com/cpa03/blueprintify.git
cd blueprintify

# 2. Install dependencies
npm install

# 3. Set up environment variables
echo "OPENAI_API_KEY=your_api_key_here" > apps/api/.dev.vars

# 4. Start the development server
npm run dev:all
```

### Q: Do I need an OpenAI API key? How do I get one?

**A:** Yes, Blueprintify requires an OpenAI API key for AI-powered generation:

1. **Get API Key**: Visit [OpenAI API](https://platform.openai.com/api-keys)
2. **Create Account**: Sign up or log in to your OpenAI account
3. **Generate Key**: Click "Create new secret key"
4. **Copy Key**: Save the key (starts with `sk-`)
5. **Configure**: Add it to `apps/api/.dev.vars`:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

**Cost**: The API uses `gpt-4o-mini` which costs approximately $0.15 per 1M tokens. A typical blueprint generation uses 2-5K tokens.

### Q: Can I use a different AI model or provider?

**A:** Currently, Blueprintify is optimized for OpenAI's `gpt-4o-mini`. However, you can configure:

```bash
# In apps/api/.dev.vars
OPENAI_BASE_URL=https://api.openai.com/v1  # Or compatible provider
OPENAI_MODEL=gpt-4o-mini                    # Or other available model
```

Compatible providers include Azure OpenAI, Anthropic (with adapter), and other OpenAI-compatible APIs.

## 🔧 Development & Setup

### Q: The installation failed with "peer dependency conflicts". How do I fix this?

**A:** Try these solutions in order:

```bash
# 1. Update npm to latest version
npm install -g npm@latest

# 2. Clean install with legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 3. Use yarn instead (recommended for monorepos)
npm install -g yarn
yarn install
```

### Q: I'm getting "Port 3000 already in use". What should I do?

**A:** Either kill the process or use a different port:

```bash
# Option 1: Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Option 2: Use different port
npm run dev -- --port 3001
```

### Q: The API server fails to start with "OPENAI_API_KEY not configured". How do I fix this?

**A:** Ensure the environment file is properly configured:

```bash
# Create the environment file in the correct location
echo "OPENAI_API_KEY=sk-your-actual-key-here" > apps/api/.dev.vars

# Verify the file exists and contains the key
cat apps/api/.dev.vars

# Restart the API server
npm run dev:api
```

### Q: How do I update Blueprintify to the latest version?

**A:** To update your local installation:

```bash
# 1. Stash any local changes
git stash

# 2. Pull latest changes
git pull origin main

# 3. Update dependencies
npm install

# 4. Restore your changes (if any)
git stash pop
```

## 📝 Blueprint Generation

### Q: What makes a good project description for blueprint generation?

**A:** A good project description should:

- **Be specific**: "A task management app for remote teams" vs "An app"
- **Include key features**: "with real-time collaboration, file sharing, and deadline tracking"
- **Define target users**: "for freelancers and small agencies"
- **Mention constraints**: "must work offline, support mobile, and handle 1000+ users"

**Example**:

```
"A collaborative task management platform for remote teams, featuring real-time updates, file attachments, deadline tracking, and team analytics. Must support offline mode and work on mobile devices."
```

### Q: Which technologies should I include in my tech stack?

**A:** Include technologies that are:

- **Relevant to your project**: Web apps need frontend/backend, mobile apps need mobile frameworks
- **Compatible**: Ensure technologies work well together
- **Well-supported**: Choose popular, maintained libraries

**Common combinations**:

- **Web App**: React/Vue + Node.js/Python + PostgreSQL/MongoDB
- **Mobile App**: React Native/Flutter + Firebase/Supabase
- **Desktop App**: Electron + Node.js + SQLite

### Q: My blueprint generation is taking too long or timing out. What can I do?

**A:** Try these optimizations:

1. **Simplify your input**:
   - Reduce description length
   - Limit tech stack to 3-5 items
   - Focus on core features first

2. **Check OpenAI status**:
   - Visit [OpenAI Status](https://status.openai.com/)
   - Wait for service restoration if down

3. **Verify your API key**:

   ```bash
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   ```

4. **Reduce concurrent requests** if running multiple generations

### Q: The generated blueprint is incomplete or cut off. How do I fix this?

**A:** This usually happens due to token limits. Solutions:

1. **Generate in smaller chunks**:
   - Start with basic project info
   - Generate specific sections separately
   - Use the refine endpoint for detailed sections

2. **Adjust generation parameters** (if self-hosting):

   ```typescript
   max_tokens: 4000,  // Increase limit
   temperature: 0.7, // Adjust creativity
   ```

3. **Use the refine endpoint** to expand specific sections:
   ```bash
   curl -X POST http://localhost:8787/refine \
        -H "Content-Type: application/json" \
        -d '{
          "content": "## Authentication\n\nBasic login system",
          "instruction": "Add detailed JWT implementation with refresh tokens"
        }'
   ```

## 🎨 User Interface

### Q: The split-pane editor isn't working correctly. How do I fix it?

**A:** Check these common issues:

1. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear cache and cookies

2. **Check browser compatibility**:
   - Use a modern browser (Chrome 90+, Firefox 88+)
   - Enable JavaScript

3. **Verify responsive layout**:
   - Test on different screen sizes
   - Check if mobile layout is working

### Q: How do I customize the appearance or theme?

**A:** Blueprintify uses Tailwind CSS for styling:

1. **Dark mode toggle**: Click the moon icon in the header
2. **Custom themes**: Modify `tailwind.config.js` in `apps/web/`
3. **Component styling**: Edit component files in `apps/web/src/components/`

### Q: Can I use Blueprintify on mobile devices?

**A:** Yes! Blueprintify is fully responsive:

- **Mobile layout**: Stacked editor/preview on small screens
- **Touch support**: Mobile-friendly buttons and controls
- **Performance**: Optimized for mobile browsers

For the best experience, use Chrome Mobile or Safari Mobile.

## 📦 Export & Sharing

### Q: How do I export my generated blueprint?

**A:** You have several export options:

1. **Download ZIP**: Click "Download" button to get a `.docs/` folder
2. **Copy to clipboard**: Use the copy button in the editor
3. **Manual export**: Copy the markdown content directly

The ZIP includes:

- `blueprint.md` - Your generated blueprint
- `task.md` - Generated project tasks
- `README.md` - Project overview

### Q: Can I share my blueprint with others?

**A:** Yes! Here are sharing options:

1. **Export and share files**: Download ZIP and share via email, cloud storage, etc.
2. **Copy markdown content**: Share the raw markdown text
3. **GitHub integration**: Commit to a repository and share the link

**Note**: Blueprintify doesn't have built-in sharing links yet, but this feature is planned.

### Q: How do I import an existing blueprint into Blueprintify?

**A:** Currently, Blueprintify doesn't have direct import functionality. However, you can:

1. **Copy-paste content**: Copy existing blueprint content into the editor
2. **Use the refine endpoint**: Improve existing content with AI assistance
3. **Manual recreation**: Use the original as reference for a new generation

Import functionality is planned for a future release.

## 🔒 Security & Privacy

### Q: Is my project data secure? Where is it stored?

**A:** Blueprintify takes security seriously:

- **Local processing**: All generation happens on your server
- **No data storage**: We don't store your project descriptions or blueprints
- **OpenAI API**: Only sends generation requests to OpenAI (subject to their privacy policy)
- **Self-hosting**: You can host everything yourself for maximum privacy

### Q: What happens to my data when I use the OpenAI API?

**A:** According to OpenAI's policy:

- **Training data**: Your API data is NOT used for training OpenAI models
- **Retention**: OpenAI may retain API data for 30 days for abuse monitoring
- **Compliance**: OpenAI is SOC 2 Type 2 compliant and GDPR compliant

For maximum privacy, consider using OpenAI's private API endpoints or self-hosting compatible models.

### Q: Can I use Blueprintify without an internet connection?

**A:** Partially:

- **Offline mode**: The frontend works offline once loaded
- **API requirement**: Blueprint generation requires internet (OpenAI API call)
- **Local models**: Future versions may support local AI models

## 🐛 Troubleshooting

### Q: I'm getting CORS errors when making API calls. How do I fix this?

**A:** CORS errors occur when the frontend and API are on different domains:

1. **Check development setup**:

   ```bash
   # Ensure both are running
   npm run dev:all
   ```

2. **Verify proxy configuration** in `vite.config.ts`:

   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8787',
         changeOrigin: true
       }
     }
   }
   ```

3. **Check API CORS settings** in `apps/api/src/index.ts`:
   ```typescript
   app.use(
     "*",
     cors({
       origin: ["http://localhost:3000"],
       credentials: true,
     }),
   );
   ```

### Q: The application is slow or unresponsive. What can I do?

**A:** Try these performance optimizations:

1. **Clear browser cache and data**
2. **Close other browser tabs**
3. **Check system resources** (CPU, memory)
4. **Restart the development server**:
   ```bash
   # Stop and restart
   npm run dev:all
   ```
5. **Check for memory leaks** in browser dev tools

### Q: I'm getting "429 Too Many Requests" from OpenAI. What does this mean?

**A:** This is OpenAI's rate limiting:

- **Free tier**: 3 requests per minute
- **Paid tier**: Higher limits based on your plan
- **Solution**: Wait and retry, or upgrade your OpenAI plan

**Workaround**:

```bash
# Implement exponential backoff in your client
# Or use a different OpenAI API key
```

## 🤝 Contributing & Support

### Q: How can I contribute to Blueprintify?

**A:** We welcome contributions! Here's how:

1. **Report issues**: Create detailed GitHub issues
2. **Submit PRs**: Fork, create a feature branch, and submit a pull request
3. **Improve docs**: Help improve documentation and examples
4. **Share feedback**: Tell us what works and what doesn't

**Development setup**:

```bash
# 1. Fork and clone
git clone https://github.com/your-username/blueprintify.git

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes and test
npm run test
npm run typecheck
npm run lint

# 4. Submit PR
git push origin feature/your-feature
```

### Q: Where can I get help if I'm stuck?

**A:** Several support options are available:

1. **Documentation**: Check the [User Guide](./user-guide.md) and [Troubleshooting Guide](./troubleshooting.md)
2. **GitHub Issues**: Search existing issues or create a new one
3. **GitHub Discussions**: Ask questions and share experiences
4. **Community**: Join our Discord or Slack (links in README)

**When creating an issue**, include:

- System information (OS, Node.js version, browser)
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

### Q: Is Blueprintify free to use? What are the costs?

**A:** Blueprintify is open-source and free to use, but there are costs:

- **Software**: 100% free (MIT license)
- **OpenAI API**: Pay-per-use (typically $0.15 per 1M tokens)
- **Hosting**: Free for development, paid for production deployment

**Typical costs**:

- **Blueprint generation**: ~$0.001-0.005 per blueprint
- **Development**: $0-5 per month (depending on usage)
- **Production**: $5-50 per month (depending on traffic)

## 🔮 Future Features

### Q: What features are planned for future releases?

**A:** Here's our roadmap:

**Short-term (Next 1-3 months)**:

- [ ] Import existing blueprints
- [ ] Blueprint sharing links
- [ ] Custom templates
- [ ] Local AI model support

**Medium-term (3-6 months)**:

- [ ] Team collaboration features
- [ ] Version control integration
- [ ] Advanced customization options
- [ ] Mobile app

**Long-term (6+ months)**:

- [ ] Enterprise features
- [ ] Plugin system
- [ ] Multi-language support
- [ ] AI-powered suggestions

### Q: Can I request a specific feature?

**A:** Absolutely! We love feature requests:

1. **Check existing issues**: Search to see if it's already requested
2. **Create a feature request**: Use the "Feature request" template
3. **Provide details**: Explain the use case and desired behavior
4. **Vote on issues**: Help prioritize popular features

**Feature request template**:

```markdown
## Feature Description

Brief description of the feature

## Use Case

Why do you need this feature?

## Proposed Solution

How should it work?

## Alternatives

What other approaches have you considered?
```

---

_This FAQ is continuously updated. Last updated: 2026-02-09_

**Still have questions?** [Create an issue](https://github.com/cpa03/blueprintify/issues) or join our [community discussions](https://github.com/cpa03/blueprintify/discussions).
