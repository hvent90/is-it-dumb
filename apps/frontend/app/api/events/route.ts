import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { SearchEvent, DetailedReport } from '@is-it-dumb/types';

// Create a Hono app
const app = new Hono().basePath('/api/events');

// Middleware for CORS
app.use('*', async (c, next) => {
  // Add CORS headers
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }
  
  await next();
});

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'Is It Dumb API - Event Ingestion Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Submit search event
app.post('/search', async (c) => {
  try {
    const body = await c.req.json();
    
    // Basic validation
    if (!body.model_name || !body.session_id) {
      return c.json({ error: 'Missing required fields: model_name, session_id' }, 400);
    }

    // Create search event with server-side enrichment
    const searchEvent: Partial<SearchEvent> = {
      ...body,
      event_type: 'search',
      timestamp: new Date().toISOString(),
      // TODO: Add GeoIP lookup
      geo_location: {
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown'
      },
      // TODO: Parse User-Agent
      user_agent_details: {
        browser: 'Unknown',
        os: 'Unknown',
        device_type: 'unknown'
      }
    };

    // TODO: Forward to Tinybird for ingestion
    console.log('Search event received:', searchEvent);
    
    return c.json({ 
      success: true, 
      message: 'Search event logged successfully',
      event_id: `search_${Date.now()}`
    });
    
  } catch (error) {
    console.error('Error processing search event:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Submit detailed report
app.post('/report', async (c) => {
  try {
    const body = await c.req.json();
    
    // Basic validation
    if (!body.session_id || !body.original_timestamp || !body.issue_category) {
      return c.json({ 
        error: 'Missing required fields: session_id, original_timestamp, issue_category' 
      }, 400);
    }

    const detailedReport: DetailedReport = {
      session_id: body.session_id,
      original_timestamp: body.original_timestamp,
      issue_category: body.issue_category,
      severity: body.severity || 'medium',
      product_context: body.product_context || 'Unknown',
      example_prompts: body.example_prompts
    };

    // TODO: Forward to Tinybird for ingestion
    console.log('Detailed report received:', detailedReport);
    
    return c.json({ 
      success: true, 
      message: 'Detailed report submitted successfully',
      report_id: `report_${Date.now()}`
    });
    
  } catch (error) {
    console.error('Error processing detailed report:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Export handlers for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);