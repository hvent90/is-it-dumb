import { NextResponse } from 'next/server';

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - split by spaces and filter common words
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 5); // Take top 5 keywords
}

// Helper function to create cluster summary
function createClusterSummary(texts: string[]): string {
  const allKeywords = texts.flatMap(extractKeywords);
  const keywordCounts = allKeywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top keywords
  const topKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([keyword]) => keyword);

  // Create a simple summary
  const summary = `Issues related to: ${topKeywords.join(', ')} (${texts.length} reports)`;
  return summary;
}

// Helper function to send cluster data to Tinybird
async function sendClustersToTinybird(clusters: any[]): Promise<void> {
  const token = process.env.TINYBIRD_TOKEN;
  if (!token) {
    console.warn('TINYBIRD_API_TOKEN not configured, clusters not sent to Tinybird');
    return;
  }

  try {
    const baseUrl = process.env.TINYBIRD_BASE_URL || 'https://api.tinybird.co';
    const response = await fetch(`${baseUrl}/v0/events?name=report_clusters`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clusters)
    });

    if (!response.ok) {
      throw new Error(`Tinybird API error: ${response.status}`);
    }

    console.log(`Successfully sent ${clusters.length} clusters to Tinybird`);
  } catch (error) {
    console.error('Failed to send clusters to Tinybird:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('Starting clustering process...');

    // Fetch recent events with embeddings from Tinybird
    const token = process.env.TINYBIRD_TOKEN;
    if (!token) {
      return NextResponse.json({
        error: 'TINYBIRD_API_TOKEN not configured'
      }, { status: 500 });
    }

    // Get events from the last 24 hours that have embeddings
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const query = `
      SELECT
        session_id,
        timestamp,
        model_name,
        quick_report_text,
        embedding
      FROM llm_events
      WHERE timestamp >= '${oneDayAgo}'
        AND embedding IS NOT NULL
        AND length(quick_report_text) > 10
      ORDER BY timestamp DESC
      LIMIT 1000
    `;

    const baseUrl = process.env.TINYBIRD_BASE_URL || 'https://api.tinybird.co';
    const response = await fetch(`${baseUrl}/v0/sql?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    const events = data.data || [];

    console.log(`Fetched ${events.length} events with embeddings`);

    if (events.length < 2) {
      return NextResponse.json({
        success: true,
        message: 'Not enough events with embeddings to cluster',
        clusters_created: 0
      });
    }

    // Perform clustering using simple similarity-based approach
    const clusters: Record<string, any[]> = {};
    const processedEvents = new Set<string>();

    for (const event of events) {
      if (processedEvents.has(event.session_id)) continue;

      const similarEvents: any[] = [event];
      processedEvents.add(event.session_id);

      // Find similar events
      for (const otherEvent of events) {
        if (processedEvents.has(otherEvent.session_id) || otherEvent.session_id === event.session_id) continue;

        const similarity = cosineSimilarity(event.embedding, otherEvent.embedding);
        if (similarity > 0.7) { // Similarity threshold
          similarEvents.push(otherEvent);
          processedEvents.add(otherEvent.session_id);
        }
      }

      // Only create clusters with at least 2 events
      if (similarEvents.length >= 2) {
        const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        clusters[clusterId] = similarEvents;
      }
    }

    console.log(`Created ${Object.keys(clusters).length} clusters`);

    // Prepare cluster data for Tinybird
    const clusterData = Object.entries(clusters).map(([clusterId, clusterEvents]) => {
      const texts = clusterEvents.map((e: any) => e.quick_report_text).filter(Boolean);
      const summary = createClusterSummary(texts);

      return {
        processed_at: new Date().toISOString(),
        cluster_id: clusterId,
        cluster_summary: summary,
        representative_texts: texts.slice(0, 5), // Store up to 5 representative texts
        report_count: clusterEvents.length
      };
    });

    // Send to Tinybird
    if (clusterData.length > 0) {
      await sendClustersToTinybird(clusterData);
    }

    return NextResponse.json({
      success: true,
      message: `Clustering completed successfully`,
      events_processed: events.length,
      clusters_created: clusterData.length
    });

  } catch (error) {
    console.error('Error in clustering process:', error);
    return NextResponse.json({
      error: 'Internal server error during clustering'
    }, { status: 500 });
  }
}