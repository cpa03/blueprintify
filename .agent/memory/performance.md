# Performance Engineering Patterns & Conventions

## Performance Philosophy

- **Measure First**: Never optimize without a benchmark. "I think it's slow" is not enough.
- **Trade-offs**: Optimization often adds complexity. Justify it.
- **Evidence Required**: PR descriptions MUST include before/after metrics.

## Performance Targets

### Frontend

| Metric      | Target  | Description              |
| ----------- | ------- | ------------------------ |
| LCP         | < 2.5s  | Largest Contentful Paint |
| FID         | < 100ms | First Input Delay        |
| CLS         | < 0.1   | Cumulative Layout Shift  |
| TTFB        | < 600ms | Time to First Byte       |
| Bundle Size | < 500KB | Initial JS bundle        |

### Backend

| Metric         | Target  | Description       |
| -------------- | ------- | ----------------- |
| API Response   | < 200ms | P95 response time |
| Database Query | < 50ms  | P95 query time    |
| Memory Usage   | < 128MB | Per request       |

## Optimization Techniques

### Frontend

1. **Code Splitting**: Use `React.lazy()` for route-based splitting
2. **Memoization**: `useMemo` for expensive computations, `useCallback` for callbacks
3. **Image Optimization**: Lazy loading, proper sizing, WebP format
4. **Bundle Analysis**: Use `rollup-plugin-visualizer` to identify large dependencies

### Backend

1. **Database Indexing**: Add indexes for frequently queried columns
2. **Caching**: Use Cloudflare KV for cacheable responses
3. **Query Optimization**: Avoid N+1 queries, use DataLoader for batching
4. **Connection Pooling**: Reuse database connections

## Measurement Tools

- **Lighthouse**: Frontend performance auditing
- **Chrome DevTools**: Profiling, network analysis
- **Vitest**: Benchmark tests with `bench()` API
- **Cloudflare Analytics**: Real user monitoring

## Lessons Learned

- **Premature Optimization**: Don't optimize without measuring first
- **Cache Invalidation**: Caching is hard. Ensure invalidation logic is solid
- **Bundle Size**: Small improvements compound over time

## Related Files

- `apps/web/vite.config.ts` - Build optimization
- `apps/api/wrangler.toml` - Cloudflare configuration
- `apps/api/src/middleware/rateLimit.ts` - Rate limiting
