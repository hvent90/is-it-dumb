import { NextRequest, NextResponse } from 'next/server';
import { DetailedReport, Geolocation, UserAgentDetails } from '@/types';
import { UAParser } from 'ua-parser-js';

// Flattened event structure for Tinybird ingestion
interface TinybirdEvent {
  session_id: string;
  timestamp: string;
  model_name: string;
  event_type: 'search' | 'report';
  entry_path: string;
  quick_report_text: string | null;
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

// Helper function to send event to Tinybird
async function sendToTinybird(event: TinybirdEvent): Promise<void> {
  const token = process.env.TINYBIRD_API_TOKEN;
  if (!token) {
    console.warn('TINYBIRD_API_TOKEN not configured, event not sent to Tinybird');
    return;
  }

  try {
    const response = await fetch('https://api.tinybird.co/v0/events?name=llm_events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Tinybird API error: ${response.status}`);
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
    if (!body.session_id || !body.original_timestamp || !body.issue_category) {
      return NextResponse.json({ 
        error: 'Missing required fields: session_id, original_timestamp, issue_category' 
      }, { status: 400 });
    }

    // Extract IP and User-Agent
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Perform enrichment
    const [geoLocation, userAgentDetails] = await Promise.all([
      getGeoLocation(clientIP),
      Promise.resolve(parseUserAgent(userAgent))
    ]);

    const detailedReport: DetailedReport = {
      session_id: body.session_id,
      original_timestamp: body.original_timestamp,
      issue_category: body.issue_category,
      severity: body.severity || 'medium',
      product_context: body.product_context || 'Unknown',
      example_prompts: body.example_prompts
    };

    // Flatten for Tinybird ingestion (as a report event)
    const flattenedEvent: TinybirdEvent = {
      session_id: detailedReport.session_id,
      timestamp: new Date().toISOString(),
      model_name: body.model_name || 'Unknown', // Should be provided or looked up
      event_type: 'report',
      entry_path: 'search_tab', // Reports typically come from search tab
      quick_report_text: null,
      geo_city: geoLocation.city || null,
      geo_country: geoLocation.country || null,
      ua_browser: userAgentDetails.browser || null,
      ua_os: userAgentDetails.os || null,
      device_type: userAgentDetails.device_type,
      issue_category: detailedReport.issue_category,
      severity: detailedReport.severity,
      product_context: detailedReport.product_context,
      example_prompts: detailedReport.example_prompts || null
    };

    // Send to Tinybird
    await sendToTinybird(flattenedEvent);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Detailed report submitted successfully',
      report_id: `report_${Date.now()}`
    });
    
  } catch (error) {
    console.error('Error processing detailed report:', error);
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