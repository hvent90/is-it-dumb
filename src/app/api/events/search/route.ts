import { NextRequest, NextResponse } from 'next/server';
import { SearchEvent, Geolocation, UserAgentDetails } from '@/types';
import { UAParser } from 'ua-parser-js';
import { pipeline } from '@xenova/transformers';

// Flattened event structure for Tinybird ingestion
interface TinybirdEvent {
  session_id: string;
  timestamp: string;
  model_name: string;
  event_type: 'search' | 'report';
  entry_path: string;
  quick_report_text: string | null;
  embedding: number[] | null;
  geo_city: string | null;
  geo_country: string | null;
  ua_browser: string | null;
  ua_os: string | null;
  device_type: string;
  issue_category: string | null;
  severity: string | null;
  product_context: string | null;
  example_prompts: string | null;
}

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// Helper function to fetch GeoIP data using ip-api.com
async function getGeoLocation(ip: string): Promise<Geolocation> {
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown'
    };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
    if (!response.ok) {
      throw new Error('GeoIP API failed');
    }
    
    const data = await response.json();
    return {
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown',
      country: data.country || 'Unknown'
    };
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
    return {
      city: 'Unknown',
      region: 'Unknown', 
      country: 'Unknown'
    };
  }
}

// Helper function to parse User-Agent
function parseUserAgent(userAgentString: string): UserAgentDetails {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  let deviceType: 'desktop' | 'mobile' | 'unknown' = 'unknown';
  if (result.device.type === 'mobile' || result.device.type === 'tablet') {
    deviceType = 'mobile';
  } else if (result.device.type === undefined && result.os.name) {
    deviceType = 'desktop';
  }

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device_type: deviceType
  };
}

// Global variable to cache the embedding model
let embeddingModel: any = null;

// Helper function to generate embeddings locally
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Initialize the model if not already loaded
    if (!embeddingModel) {
      console.log('Loading local embedding model...');
      embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');
    }

    // Generate embedding
    const output = await embeddingModel(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

// Helper function to send event to Tinybird
async function sendToTinybird(event: TinybirdEvent): Promise<void> {
  const token = process.env.TINYBIRD_TOKEN;
  if (!token) {
    console.warn('TINYBIRD_API_TOKEN not configured, event not sent to Tinybird');
    return;
  }

  try {
    const baseUrl = process.env.TINYBIRD_BASE_URL || 'https://api.tinybird.co';
    const response = await fetch(`${baseUrl}/v0/events?name=llm_events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Tinybird API error: ${response.status} ${response.statusText} - ${errorText}`);
      console.error('Event data sent:', JSON.stringify(event, null, 2));
      throw new Error(`Tinybird API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to send event to Tinybird:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.model_name || !body.session_id) {
      return NextResponse.json({ error: 'Missing required fields: model_name, session_id' }, { status: 400 });
    }

    // Extract IP and User-Agent
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Perform enrichment
    const [geoLocation, userAgentDetails] = await Promise.all([
      getGeoLocation(clientIP),
      Promise.resolve(parseUserAgent(userAgent))
    ]);

    // Create enriched search event
    const searchEvent: SearchEvent = {
      session_id: body.session_id,
      timestamp: new Date().toISOString(),
      geo_location: geoLocation,
      user_agent_details: userAgentDetails,
      event_type: 'search',
      model_name: body.model_name,
      entry_path: body.entry_path || 'search_tab',
      quick_report_text: body.quick_report_text || null
    };

    // Generate embedding if quick_report_text is provided
    let embedding: number[] | null = null;
    if (searchEvent.quick_report_text && typeof searchEvent.quick_report_text === 'string') {
      console.log('Generating embedding for search quick report text...');
      embedding = await generateEmbedding(searchEvent.quick_report_text);
      console.log(`Generated embedding with ${embedding.length} dimensions`);
    }

    // Flatten for Tinybird ingestion
    const flattenedEvent: TinybirdEvent = {
      session_id: searchEvent.session_id,
      timestamp: searchEvent.timestamp,
      model_name: searchEvent.model_name,
      event_type: searchEvent.event_type,
      entry_path: searchEvent.entry_path,
      quick_report_text: searchEvent.quick_report_text || null,
      embedding: embedding,
      geo_city: searchEvent.geo_location.city || null,
      geo_country: searchEvent.geo_location.country || null,
      ua_browser: searchEvent.user_agent_details.browser || null,
      ua_os: searchEvent.user_agent_details.os || null,
      device_type: searchEvent.user_agent_details.device_type,
      issue_category: null,
      severity: null,
      product_context: null,
      example_prompts: null
    };

    // Send to Tinybird
    await sendToTinybird(flattenedEvent);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Search event logged successfully',
      event_id: `search_${Date.now()}`
    });
    
  } catch (error) {
    console.error('Error processing search event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}