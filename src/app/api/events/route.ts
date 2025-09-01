import { NextResponse } from 'next/server';

// Health check endpoint for /api/events
export async function GET() {
  return NextResponse.json({ 
    message: 'Is It Dumb API - Event Ingestion Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}