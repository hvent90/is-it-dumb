#!/usr/bin/env tsx

/**
 * Proof of Concept script to measure end-to-end latency
 * Tests the ingestion pipeline performance to validate real-time requirements
 */

import { performance } from 'perf_hooks';

interface LatencyMeasurement {
  ingestionTime: number;
  geoipTime: number;
  tinybirdTime: number;
  totalTime: number;
}

async function measureIngestionLatency(apiEndpoint: string): Promise<LatencyMeasurement> {
  const startTotal = performance.now();
  
  // Mock a realistic search event
  const searchEvent = {
    session_id: `poc-session-${Date.now()}`,
    model_name: 'GPT-4',
    entry_path: 'search_tab',
    quick_report_text: 'Testing latency for ingestion pipeline'
  };

  try {
    const startIngestion = performance.now();
    
    const response = await fetch(`${apiEndpoint}/api/events/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Forwarded-For': '203.0.113.123' // Mock IP for testing
      },
      body: JSON.stringify(searchEvent)
    });

    const endIngestion = performance.now();
    const ingestionTime = endIngestion - startIngestion;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    await response.json();
    const endTotal = performance.now();
    const totalTime = endTotal - startTotal;

    // For this PoC, we'll estimate component times based on total time
    // In a production environment, you'd instrument the actual components
    const geoipTime = totalTime * 0.3; // Estimate ~30% for GeoIP lookup
    const tinybirdTime = totalTime * 0.2; // Estimate ~20% for Tinybird API

    return {
      ingestionTime,
      geoipTime,
      tinybirdTime,
      totalTime
    };

  } catch (error) {
    console.error('Error during latency measurement:', error);
    throw error;
  }
}

async function runLatencyPoC() {
  console.log('🚀 Starting Ingestion Pipeline Latency PoC\n');

  // Configuration
  const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000';
  const NUM_REQUESTS = 10;
  const TARGET_LATENCY_MS = 100; // TRD-94: T_ingestion_p95 < 100ms

  console.log(`API Endpoint: ${API_ENDPOINT}`);
  console.log(`Number of requests: ${NUM_REQUESTS}`);
  console.log(`Target latency (P95): ${TARGET_LATENCY_MS}ms\n`);

  const measurements: LatencyMeasurement[] = [];

  // Run multiple measurements for statistical analysis
  for (let i = 0; i < NUM_REQUESTS; i++) {
    try {
      console.log(`📊 Running measurement ${i + 1}/${NUM_REQUESTS}...`);
      const measurement = await measureIngestionLatency(API_ENDPOINT);
      measurements.push(measurement);
      
      console.log(`   Total: ${measurement.totalTime.toFixed(1)}ms, Ingestion: ${measurement.ingestionTime.toFixed(1)}ms`);
      
      // Small delay between requests to avoid overwhelming the service
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Measurement ${i + 1} failed:`, error);
    }
  }

  if (measurements.length === 0) {
    console.error('❌ No successful measurements recorded');
    process.exit(1);
  }

  // Calculate statistics
  const sortedTotal = measurements.map(m => m.totalTime).sort((a, b) => a - b);
  const sortedIngestion = measurements.map(m => m.ingestionTime).sort((a, b) => a - b);

  const stats = {
    total: {
      min: Math.min(...sortedTotal),
      max: Math.max(...sortedTotal),
      avg: sortedTotal.reduce((a, b) => a + b, 0) / sortedTotal.length,
      p50: sortedTotal[Math.floor(sortedTotal.length * 0.5)],
      p95: sortedTotal[Math.floor(sortedTotal.length * 0.95)],
      p99: sortedTotal[Math.floor(sortedTotal.length * 0.99)]
    },
    ingestion: {
      min: Math.min(...sortedIngestion),
      max: Math.max(...sortedIngestion),
      avg: sortedIngestion.reduce((a, b) => a + b, 0) / sortedIngestion.length,
      p50: sortedIngestion[Math.floor(sortedIngestion.length * 0.5)],
      p95: sortedIngestion[Math.floor(sortedIngestion.length * 0.95)],
      p99: sortedIngestion[Math.floor(sortedIngestion.length * 0.99)]
    }
  };

  // Report results
  console.log('\n📈 Latency Analysis Results');
  console.log('═'.repeat(50));
  
  console.log('\n🔄 Total Request Latency:');
  console.log(`   Min:  ${stats.total.min.toFixed(1)}ms`);
  console.log(`   Avg:  ${stats.total.avg.toFixed(1)}ms`);
  console.log(`   P50:  ${stats.total.p50.toFixed(1)}ms`);
  console.log(`   P95:  ${stats.total.p95.toFixed(1)}ms`);
  console.log(`   P99:  ${stats.total.p99.toFixed(1)}ms`);
  console.log(`   Max:  ${stats.total.max.toFixed(1)}ms`);

  console.log('\n⚡ Ingestion Processing Latency:');
  console.log(`   Min:  ${stats.ingestion.min.toFixed(1)}ms`);
  console.log(`   Avg:  ${stats.ingestion.avg.toFixed(1)}ms`);
  console.log(`   P50:  ${stats.ingestion.p50.toFixed(1)}ms`);
  console.log(`   P95:  ${stats.ingestion.p95.toFixed(1)}ms`);
  console.log(`   P99:  ${stats.ingestion.p99.toFixed(1)}ms`);
  console.log(`   Max:  ${stats.ingestion.max.toFixed(1)}ms`);

  // Validate against requirements
  console.log('\n✅ Requirement Validation:');
  const ingestionP95Passes = stats.ingestion.p95 <= TARGET_LATENCY_MS;
  console.log(`   TRD-94 (Ingestion P95 < ${TARGET_LATENCY_MS}ms): ${ingestionP95Passes ? '✅ PASS' : '❌ FAIL'} (${stats.ingestion.p95.toFixed(1)}ms)`);

  // Component breakdown (estimated)
  const avgGeoip = measurements.reduce((sum, m) => sum + m.geoipTime, 0) / measurements.length;
  const avgTinybird = measurements.reduce((sum, m) => sum + m.tinybirdTime, 0) / measurements.length;
  
  console.log('\n🏗️  Component Breakdown (Estimated):');
  console.log(`   GeoIP Lookup:     ${avgGeoip.toFixed(1)}ms`);
  console.log(`   Tinybird API:     ${avgTinybird.toFixed(1)}ms`);
  console.log(`   Processing Logic: ${(stats.total.avg - avgGeoip - avgTinybird).toFixed(1)}ms`);

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (stats.ingestion.p95 > TARGET_LATENCY_MS) {
    console.log('   • Consider implementing async processing for GeoIP lookups');
    console.log('   • Add caching layer for repeat IP addresses');
    console.log('   • Optimize Tinybird payload size');
  } else {
    console.log('   • Latency requirements are met ✅');
    console.log('   • Monitor performance in production environment');
  }

  console.log('\n🎯 Summary:');
  console.log(`   Successful measurements: ${measurements.length}/${NUM_REQUESTS}`);
  console.log(`   Overall performance: ${ingestionP95Passes ? '✅ MEETS REQUIREMENTS' : '❌ NEEDS OPTIMIZATION'}`);
}

// Run the PoC if this script is executed directly
if (require.main === module) {
  runLatencyPoC().catch((error) => {
    console.error('❌ PoC failed:', error);
    process.exit(1);
  });
}

export { measureIngestionLatency, runLatencyPoC };