import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';
import generateRoute from './routes/generate';
import tasksRoute from './routes/tasks';
import refineRoute from './routes/refine';
// ===== App Initialization =====
const app = new Hono();
// ===== Middleware =====
app.use('*', secureHeaders());
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
}));
app.use('*', prettyJSON());
// ===== Health Check =====
app.get('/', (c) => {
    return c.json({
        name: 'Blueprint Generator API',
        version: '1.0.0',
        status: 'healthy',
        endpoints: {
            generate: 'POST /generate',
            tasks: 'POST /tasks',
            refine: 'POST /refine'
        }
    });
});
// ===== Routes =====
app.route('/generate', generateRoute);
app.route('/tasks', tasksRoute);
app.route('/refine', refineRoute);
// ===== Error Handler =====
app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({
        error: err.message || 'Internal server error',
        status: 500
    }, 500);
});
// ===== 404 Handler =====
app.notFound((c) => {
    return c.json({
        error: 'Not found',
        availableEndpoints: ['/', '/generate', '/tasks', '/refine']
    }, 404);
});
export default app;
