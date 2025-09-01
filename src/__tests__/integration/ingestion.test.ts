/**
 * Integration test for the ingestion pipeline
 * Tests the complete flow from frontend request to Tinybird ingestion
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the external dependencies
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
process.env.TINYBIRD_API_TOKEN = 'test_token';

describe('Ingestion Pipeline Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should enrich and send search event to Tinybird', async () => {
    // Mock GeoIP API response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          city: 'San Francisco',
          regionName: 'California',
          country: 'United States'
        })
      })
      // Mock Tinybird API response
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    // Create a mock request
    const mockRequest = new Request('http://localhost:3000/api/events/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-forwarded-for': '203.0.113.45'
      },
      body: JSON.stringify({
        session_id: 'test-session-123',
        model_name: 'GPT-4',
        entry_path: 'search_tab',
        quick_report_text: 'Model is giving incorrect responses'
      })
    });

    // Import the route handler dynamically to avoid top-level imports
    const { POST } = await import('../../app/api/events/search/route');
    
    // Execute the request
    const response = await POST(mockRequest);
    const responseData = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Search event logged successfully');

    // Verify GeoIP API was called
    expect(mockFetch).toHaveBeenCalledWith(
      'http://ip-api.com/json/203.0.113.45?fields=city,regionName,country'
    );

    // Verify Tinybird API was called with enriched data
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tinybird.co/v0/events?name=llm_events',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test_token',
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('test-session-123')
      })
    );

    // Parse the Tinybird request body to verify enrichment
    const tinybirdCall = mockFetch.mock.calls.find(call => 
      call[0] === 'https://api.tinybird.co/v0/events?name=llm_events'
    );
    
    if (tinybirdCall) {
      const requestBody = JSON.parse(tinybirdCall[1].body);
      
      expect(requestBody).toMatchObject({
        session_id: 'test-session-123',
        model_name: 'GPT-4',
        event_type: 'search',
        entry_path: 'search_tab',
        quick_report_text: 'Model is giving incorrect responses',
        geo_city: 'San Francisco',
        geo_country: 'United States',
        ua_browser: 'Chrome',
        ua_os: 'macOS',
        device_type: 'desktop',
        issue_category: null,
        severity: null,
        product_context: null,
        example_prompts: null
      });

      expect(requestBody.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }
  });

  it('should handle GeoIP API failure gracefully', async () => {
    // Mock GeoIP API failure
    mockFetch
      .mockRejectedValueOnce(new Error('GeoIP API failed'))
      // Mock Tinybird API success
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    const mockRequest = new Request('http://localhost:3000/api/events/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'x-real-ip': '198.51.100.42'
      },
      body: JSON.stringify({
        session_id: 'test-session-456',
        model_name: 'Claude-3.5-Sonnet'
      })
    });

    const { POST } = await import('../../app/api/events/search/route');
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    // Verify that even with GeoIP failure, the event was still sent to Tinybird with fallback data
    const tinybirdCall = mockFetch.mock.calls.find(call =>
      call[0] === 'https://api.tinybird.co/v0/events?name=llm_events'
    );
    
    if (tinybirdCall) {
      const requestBody = JSON.parse(tinybirdCall[1].body);
      
      expect(requestBody).toMatchObject({
        session_id: 'test-session-456',
        model_name: 'Claude-3.5-Sonnet',
        geo_city: 'Unknown',
        geo_country: 'Unknown',
        ua_browser: 'Unknown',
        device_type: 'mobile'
      });
    }
  });

  it('should process detailed report events correctly', async () => {
    // Mock GeoIP API response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          city: 'London',
          regionName: 'England',
          country: 'United Kingdom'
        })
      })
      // Mock Tinybird API response
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    const mockRequest = new Request('http://localhost:3000/api/events/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-forwarded-for': '192.0.2.123'
      },
      body: JSON.stringify({
        session_id: 'test-session-789',
        original_timestamp: '2024-01-15T10:30:00Z',
        model_name: 'Gemini-Pro',
        issue_category: 'hallucination',
        severity: 'high',
        product_context: 'Direct API',
        example_prompts: 'When I asked about historical facts, it provided incorrect information'
      })
    });

    const { POST } = await import('../../app/api/events/report/route');
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    // Verify Tinybird was called with report event data
    const tinybirdCall = mockFetch.mock.calls.find(call => 
      call[0] === 'https://api.tinybird.co/v0/events?name=llm_events'
    );
    
    if (tinybirdCall) {
      const requestBody = JSON.parse(tinybirdCall[1].body);
      
      expect(requestBody).toMatchObject({
        session_id: 'test-session-789',
        model_name: 'Gemini-Pro',
        event_type: 'report',
        geo_city: 'London',
        geo_country: 'United Kingdom',
        ua_browser: 'WebKit',
        ua_os: 'Windows',
        device_type: 'desktop',
        issue_category: 'hallucination',
        severity: 'high',
        product_context: 'Direct API',
        example_prompts: 'When I asked about historical facts, it provided incorrect information'
      });
    }
  });

  it('should validate required fields', async () => {
    const mockRequest = new Request('http://localhost:3000/api/events/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: 'test-session-invalid'
        // Missing model_name
      })
    });

    const { POST } = await import('../../app/api/events/search/route');
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.error).toBe('Missing required fields: model_name, session_id');
  });
});