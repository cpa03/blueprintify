# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Blueprintify application. Follow these systematic steps before seeking additional support.

## 🚨 Quick Diagnosis

### Before You Begin

1. **Check System Requirements**
   - Node.js 18+ installed
   - npm 8+ with workspace support
   - Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

2. **Verify Environment**

   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 8.x or higher
   ```

3. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear cache and cookies if issues persist

## 🔧 Common Issues and Solutions

### Installation Issues

#### Issue: "npm install fails with peer dependency conflicts"

**Symptoms**:

```
npm ERR! peer dep missing: react@^18.0.0
npm ERR! code ERESOLVE
npm ERR! Conflicting peer dependency
```

**Solutions**:

1. **Update npm to latest version**

   ```bash
   npm install -g npm@latest
   ```

2. **Clean install with legacy peer deps**

   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Use yarn instead (recommended for monorepos)**
   ```bash
   npm install -g yarn
   yarn install
   ```

#### Issue: "Permission denied during installation"

**Symptoms**:

```
npm ERR! code EACCES
npm ERR! permission denied
```

**Solutions**:

1. **Fix npm permissions**

   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

2. **Use nvm (Node Version Manager)**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

### Development Server Issues

#### Issue: "Frontend fails to start with port already in use"

**Symptoms**:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:

1. **Kill process on port 3000**

   ```bash
   # Find process
   lsof -ti:3000

   # Kill process
   kill -9 $(lsof -ti:3000)
   ```

2. **Use different port**
   ```bash
   npm run dev -- --port 3001
   ```

#### Issue: "API server fails to start"

**Symptoms**:

```
Error: Cannot find module 'wrangler'
Error: OPENAI_API_KEY not configured
```

**Solutions**:

1. **Install Wrangler globally**

   ```bash
   npm install -g wrangler
   ```

2. **Configure environment variables**

   ```bash
   # Create apps/api/.dev.vars
   echo "OPENAI_API_KEY=your_api_key_here" > apps/api/.dev.vars
   ```

3. **Verify Cloudflare authentication**
   ```bash
   wrangler auth login
   ```

### API Integration Issues

#### Issue: "OpenAI API errors or rate limits"

**Symptoms**:

```
429 Too Many Requests
401 Invalid API Key
Error: Model not found
```

**Solutions**:

1. **Verify API key validity**

   ```bash
   # Test API key
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   ```

2. **Check API key configuration**

   ```bash
   # Verify .dev.vars file
   cat apps/api/.dev.vars

   # Should contain: OPENAI_API_KEY=sk-...
   ```

3. **Handle rate limits**
   - Wait 60 seconds after rate limit error
   - Consider upgrading API plan
   - Implement request queuing

#### Issue: "CORS errors during API calls"

**Symptoms**:

```
Access to fetch at 'http://localhost:8787' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions**:

1. **Verify API CORS configuration**

   ```typescript
   // apps/api/src/index.ts
   app.use(
     "*",
     cors({
       origin: ["http://localhost:3000", "https://yourdomain.com"],
       credentials: true,
     }),
   );
   ```

2. **Check development proxy settings**
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8787',
         changeOrigin: true
       }
     }
   }
   ```

### Blueprint Generation Issues

#### Issue: "Blueprint generation hangs or times out"

**Symptoms**:

- Loading spinner continues indefinitely
- No response after 30+ seconds
- Server error logs

**Solutions**:

1. **Check OpenAI API status**
   - Visit [OpenAI Status](https://status.openai.com/)
   - Wait for service restoration if down

2. **Verify prompt size**

   ```bash
   # Check if prompt is too long
   curl -X POST http://localhost:8787/generate \
        -H "Content-Type: application/json" \
        -d '{"config": {"name": "test"}}'
   ```

3. **Reduce complexity**
   - Start with simpler project configuration
   - Remove advanced features temporarily
   - Generate in smaller chunks

#### Issue: "Generated blueprint is incomplete or malformed"

**Symptoms**:

- Missing sections in output
- Invalid markdown formatting
- Truncated content

**Solutions**:

1. **Check token limits**

   ```typescript
   // Monitor token usage
   console.log("Prompt tokens:", promptTokens);
   console.log("Completion tokens:", completionTokens);
   console.log("Total tokens:", totalTokens);
   ```

2. **Adjust generation parameters**

   ```typescript
   // apps/api/src/blueprint-generator.ts
   const completion = await openai.chat.completions.create({
     model: "gpt-4o-mini",
     max_tokens: 4000, // Increase if needed
     temperature: 0.7,
     stream: true,
   });
   ```

3. **Implement retry logic**
   ```typescript
   // Add exponential backoff
   const retry = async (fn, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise((resolve) =>
           setTimeout(resolve, 1000 * Math.pow(2, i)),
         );
       }
     }
   };
   ```

### UI/UX Issues

#### Issue: "Split-pane editor not working properly"

**Symptoms**:

- Editor not loading
- Preview not updating
- Layout broken on mobile

**Solutions**:

1. **Check CodeMirror dependencies**

   ```bash
   npm list @uiw/react-codemirror
   npm list codemirror
   ```

2. **Verify responsive CSS**

   ```css
   /* Check Tailwind responsive classes */
   .flex-col lg:flex-row
   .w-full lg:w-1/2
   ```

3. **Test on different screen sizes**
   - Use browser dev tools device emulation
   - Test on actual mobile devices
   - Check viewport meta tag

#### Issue: "Dark mode not applying correctly"

**Symptoms**:

- Inconsistent theming
- Flash of unstyled content
- Color contrast issues

**Solutions**:

1. **Verify Tailwind dark mode config**

   ```javascript
   // tailwind.config.js
   darkMode: 'class', // or 'media'
   ```

2. **Check CSS order**

   ```html
   <!-- Ensure Tailwind CSS loads before custom styles -->
   <link href="/dist/index.css" rel="stylesheet" />
   ```

3. **Add theme transition**
   ```css
   /* Prevent flash of unstyled content */
   * {
     transition:
       background-color 0.2s ease,
       color 0.2s ease;
   }
   ```

### Performance Issues

#### Issue: "Application is slow or unresponsive"

**Symptoms**:

- High memory usage
- Slow initial load
- Lag during interactions

**Solutions**:

1. **Profile the application**

   ```bash
   # Use React DevTools Profiler
   npm run build
   npm run preview
   ```

2. **Check bundle size**

   ```bash
   npm run build -- --analyze
   # Look for large chunks in output
   ```

3. **Optimize imports**

   ```typescript
   // Use dynamic imports for heavy components
   const HeavyComponent = lazy(() => import("./HeavyComponent"));
   ```

4. **Implement code splitting**
   ```typescript
   // Split routes
   const BlueprintPage = lazy(() => import("./pages/BlueprintPage"));
   const SettingsPage = lazy(() => import("./pages/SettingsPage"));
   ```

### Deployment Issues

#### Issue: "Cloudflare Workers deployment fails"

**Symptoms**:

```
Error: Account not found
Error: Worker script too large
Error: Environment variables not set
```

**Solutions**:

1. **Verify Cloudflare authentication**

   ```bash
   wrangler whoami
   wrangler auth login
   ```

2. **Check worker size limits**

   ```bash
   # Bundle size should be < 1MB
   npm run build
   du -sh dist/*
   ```

3. **Set production environment variables**
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```

#### Issue: "Custom domain not working"

**Symptoms**:

- DNS propagation errors
- SSL certificate issues
- 404 errors on custom domain

**Solutions**:

1. **Check DNS configuration**

   ```bash
   # Verify CNAME record
   dig CNAME yourdomain.com
   ```

2. **Configure Cloudflare DNS**
   - Add CNAME record pointing to workers.dev
   - Enable SSL/TLS in Cloudflare dashboard
   - Wait for DNS propagation (up to 24 hours)

3. **Test worker subdomain**
   ```bash
   curl https://your-worker.your-subdomain.workers.dev
   ```

## 🔍 Debugging Tools and Techniques

### Browser Developer Tools

1. **Console Errors**
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Look for network request failures

2. **Network Tab**
   - Monitor API calls
   - Check response status codes
   - Verify request/response payloads

3. **Performance Tab**
   - Record performance profile
   - Identify bottlenecks
   - Check memory usage

### Server-Side Debugging

1. **Cloudflare Workers Logs**

   ```bash
   wrangler tail
   ```

2. **Local API Debugging**

   ```bash
   # Start API with debug logging
   DEBUG=* npm run dev:api
   ```

3. **Environment Variable Testing**
   ```bash
   # Test API key locally
   curl -X POST http://localhost:8787/generate \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d '{"config": {"name": "test"}}'
   ```

### Logging Best Practices

1. **Structured Logging**

   ```typescript
   console.log({
     event: "blueprint_generation_started",
     config: projectConfig,
     timestamp: new Date().toISOString(),
   });
   ```

2. **Error Context**
   ```typescript
   console.error({
     error: error.message,
     stack: error.stack,
     context: { userId, projectId },
     timestamp: new Date().toISOString(),
   });
   ```

## 📞 Getting Help

### Self-Service Resources

1. **Documentation**
   - [User Guide](./user-guide.md)
   - [API Documentation](./api-documentation.md)
   - [Development Workflow](./development-workflow.md)

2. **Community Support**
   - GitHub Issues (search before posting)
   - GitHub Discussions
   - Stack Overflow (tag with `blueprintify`)

### Creating Support Requests

When creating a GitHub issue, include:

1. **Environment Information**

   ```bash
   node --version
   npm --version
   OS: [Windows/macOS/Linux]
   Browser: [Chrome/Firefox/Safari/Edge]
   ```

2. **Reproduction Steps**
   - Clear step-by-step instructions
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Error Logs**
   - Full error messages
   - Console output
   - Server logs

4. **Configuration**
   - Relevant environment variables (sanitized)
   - Custom configuration files
   - Package.json dependencies

### Emergency Contacts

For critical production issues:

1. **Security Vulnerabilities**
   - Email: security@blueprintify.dev
   - Follow responsible disclosure

2. **Production Outages**
   - Check status page first
   - Create urgent GitHub issue
   - Include production impact assessment

---

_This troubleshooting guide is continuously updated. Last updated: 2026-02-09_
