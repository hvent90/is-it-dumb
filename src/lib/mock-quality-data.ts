// Mock data service for automated quality evaluation system
// This simulates results from an automated quality evaluation system

export interface QualityScore {
  model_name: string;
  overall_score: number; // 0-100
  accuracy_score: number; // 0-100
  safety_score: number; // 0-100
  efficiency_score: number; // 0-100
  last_evaluated: string; // ISO date string
  evaluation_count: number;
}

export interface QualityTrend {
  date: string;
  overall_score: number;
  accuracy_score: number;
  safety_score: number;
  efficiency_score: number;
}

// Mock quality scores for different models
const mockQualityScores: QualityScore[] = [
  {
    model_name: 'GPT-4',
    overall_score: 92.3,
    accuracy_score: 94.1,
    safety_score: 89.7,
    efficiency_score: 93.2,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 1250
  },
  {
    model_name: 'Claude-3',
    overall_score: 91.8,
    accuracy_score: 93.5,
    safety_score: 92.1,
    efficiency_score: 90.8,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 1180
  },
  {
    model_name: 'GPT-3.5',
    overall_score: 87.4,
    accuracy_score: 88.9,
    safety_score: 85.2,
    efficiency_score: 88.1,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 2100
  },
  {
    model_name: 'Gemini Pro',
    overall_score: 89.1,
    accuracy_score: 90.3,
    safety_score: 87.8,
    efficiency_score: 89.2,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 980
  },
  {
    model_name: 'Llama 2',
    overall_score: 84.7,
    accuracy_score: 85.4,
    safety_score: 83.1,
    efficiency_score: 85.6,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 750
  },
  {
    model_name: 'Mistral',
    overall_score: 86.2,
    accuracy_score: 87.8,
    safety_score: 84.9,
    efficiency_score: 86.1,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 620
  },
  {
    model_name: 'Claude-2',
    overall_score: 90.5,
    accuracy_score: 91.7,
    safety_score: 90.1,
    efficiency_score: 90.7,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 890
  },
  {
    model_name: 'GPT-4 Turbo',
    overall_score: 93.1,
    accuracy_score: 94.8,
    safety_score: 91.2,
    efficiency_score: 93.3,
    last_evaluated: '2024-09-01T10:00:00Z',
    evaluation_count: 1450
  }
];

// Generate mock trend data for a specific model
function generateTrendData(modelName: string, days: number = 30): QualityTrend[] {
  const baseScore = mockQualityScores.find(m => m.model_name === modelName);
  if (!baseScore) return [];

  const trends: QualityTrend[] = [];
  const baseDate = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);

    // Add some random variation to simulate real trends
    const variation = (Math.random() - 0.5) * 4; // ±2 points variation

    trends.push({
      date: date.toISOString().split('T')[0],
      overall_score: Math.max(0, Math.min(100, baseScore.overall_score + variation)),
      accuracy_score: Math.max(0, Math.min(100, baseScore.accuracy_score + variation)),
      safety_score: Math.max(0, Math.min(100, baseScore.safety_score + variation)),
      efficiency_score: Math.max(0, Math.min(100, baseScore.efficiency_score + variation))
    });
  }

  return trends;
}

export class MockQualityDataService {
  // Simulate API delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get quality scores for all models
  async getAllQualityScores(): Promise<{ data: QualityScore[] }> {
    await this.delay();
    return { data: mockQualityScores };
  }

  // Get quality score for a specific model
  async getModelQualityScore(modelName: string): Promise<{ data: QualityScore | null }> {
    await this.delay();
    const score = mockQualityScores.find(m => m.model_name === modelName);
    return { data: score || null };
  }

  // Get quality trend data for a specific model
  async getModelQualityTrends(modelName: string, days: number = 30): Promise<{ data: QualityTrend[] }> {
    await this.delay();
    return { data: generateTrendData(modelName, days) };
  }

  // Get top performing models by quality score
  async getTopQualityModels(limit: number = 5): Promise<{ data: QualityScore[] }> {
    await this.delay();
    const sorted = [...mockQualityScores].sort((a, b) => b.overall_score - a.overall_score);
    return { data: sorted.slice(0, limit) };
  }

  // Get quality scores formatted for charts
  async getQualityScoresForChart(): Promise<{ data: Array<{ name: string; value: number; type: 'quality' }> }> {
    await this.delay();
    return {
      data: mockQualityScores.map(score => ({
        name: score.model_name,
        value: score.overall_score,
        type: 'quality' as const
      }))
    };
  }

  // Get quality scores over time for line chart (multiple models)
  async getQualityTimeseriesForChart(): Promise<{ 
    data: Array<{ date: string; [modelName: string]: string | number }>; 
    models: string[] 
  }> {
    await this.delay();
    
    const models = ['GPT-4', 'Claude-3', 'GPT-3.5', 'Gemini Pro', 'Llama 2'];
    const timeseriesData = [];
    
    // Generate data for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry: { date: string; [modelName: string]: string | number } = { date: dateStr };
      
      models.forEach((model) => {
        const baseScore = mockQualityScores.find(m => m.model_name === model)?.overall_score || 80;
        // Add some realistic variation (±3 points)
        const variation = (Math.random() - 0.5) * 6;
        entry[model] = Math.max(70, Math.min(100, Math.round((baseScore + variation) * 10) / 10));
      });
      
      timeseriesData.push(entry);
    }

    return {
      data: timeseriesData,
      models: models
    };
  }
}

// Export singleton instance
export const mockQualityDataService = new MockQualityDataService();