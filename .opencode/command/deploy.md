# Deploy Command

Deploy the application to Cloudflare Workers.

## Usage

```
/deploy [environment]
```

## Arguments

- `environment` (optional): Target environment (default: production)
  - `production` - Deploy to production
  - `staging` - Deploy to staging
  - `preview` - Deploy preview branch

## Context

@AGENTS.md
@wrangler.toml

## Instructions

1. Verify the build passes:

   ```bash
   npm run build
   ```

2. Run tests to ensure quality:

   ```bash
   npm run test:all
   ```

3. Deploy to Cloudflare Workers:

   ```bash
   # Production
   npm run deploy --workspace=apps/api

   # Or with wrangler directly
   npx wrangler deploy --config apps/api/wrangler.toml
   ```

4. Verify deployment:
   - Check the deployment URL
   - Verify health endpoint if available
   - Check Cloudflare dashboard for status

## Pre-deployment Checklist

- [ ] All tests pass
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Secrets set in Cloudflare dashboard

## Example Output

```bash
npm run deploy --workspace=apps/api

> blueprint-generator-api@1.0.0 deploy
> wrangler deploy

⛅️ wrangler 3.x
Uploading blueprint-generator-api...
Published blueprint-generator-api (production)
  https://blueprint-generator-api.your-subdomain.workers.dev
```
