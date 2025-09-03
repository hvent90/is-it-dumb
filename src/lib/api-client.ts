import { DetailedReport } from '@/types/events';
import { DataSource } from '@/contexts/data-source-context';

// Frontend-friendly interface for search submission
export interface SearchSubmission {
  model_name: string;
  quick_report_text?: string;
  entry_path?: 'search_tab' | 'overview_tab';
}

// Frontend-friendly interface for detailed report submission
export interface DetailedReportSubmission extends Omit<DetailedReport, 'session_id' | 'original_timestamp'> {
  model_name: string;
}

class ApiClient {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = '/api/events';
    // Generate a session ID for this browser session
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    }
    // Fallback for server-side rendering
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  async submitSearchEvent(submission: SearchSubmission): Promise<{ success: boolean; event_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          session_id: this.sessionId,
          entry_path: submission.entry_path || 'search_tab'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to submit search event' };
      }

      // Store the search timestamp for potential detailed report
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_search_timestamp', new Date().toISOString());
        sessionStorage.setItem('last_search_model', submission.model_name);
      }

      return { success: true, event_id: data.event_id };
    } catch (error) {
      console.error('Error submitting search event:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async submitDetailedReport(submission: DetailedReportSubmission): Promise<{ success: boolean; report_id?: string; error?: string }> {
    try {
      const lastTimestamp = typeof window !== 'undefined' 
        ? sessionStorage.getItem('last_search_timestamp') 
        : new Date().toISOString();
      
      if (!lastTimestamp) {
        return { success: false, error: 'No previous search event found' };
      }

      const response = await fetch(`${this.baseUrl}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          session_id: this.sessionId,
          original_timestamp: lastTimestamp,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to submit report' };
      }

      return { success: true, report_id: data.report_id };
    } catch (error) {
      console.error('Error submitting report:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Analytics data fetching methods
  async getModelCounts(timeRange?: string, modelFamily?: string, dataSource: DataSource = 'real'): Promise<{ data: Array<{ name: string; value: number }> }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      return {
        data: [
          { name: 'GPT-4', value: 1250 },
          { name: 'Claude-3', value: 980 },
          { name: 'GPT-3.5', value: 750 },
          { name: 'Gemini Pro', value: 620 },
          { name: 'Llama 2', value: 450 },
        ]
      };
    }

    // Original real API logic (without try/catch fallback)
    const params = new URLSearchParams({
      type: 'model_counts',
      ...(timeRange && { time_range: timeRange }),
      ...(modelFamily && modelFamily !== 'all' && { model_family: modelFamily }),
    });

    const response = await fetch(`/api/analytics?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch model counts');
    }

    return data;
  }

  async getIssueCounts(timeRange?: string, modelFamily?: string, dataSource: DataSource = 'real'): Promise<{ data: Array<{ name: string; value: number }> }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      return {
        data: [
          { name: 'Hallucination', value: 35 },
          { name: 'Memory Issues', value: 28 },
          { name: 'Reliability', value: 22 },
          { name: 'UI Problems', value: 15 },
          { name: 'Performance', value: 12 },
          { name: 'Safety Concerns', value: 8 }
        ]
      };
    }

    // Original real API logic (without try/catch fallback)
    const params = new URLSearchParams({
      type: 'issue_counts',
      ...(timeRange && { time_range: timeRange }),
      ...(modelFamily && modelFamily !== 'all' && { model_family: modelFamily }),
    });

    const response = await fetch(`/api/analytics?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch issue counts');
    }

    return data;
  }

  async getModelTimeseries(modelName: string, dataSource: DataSource = 'real'): Promise<{ data: Array<{ date: string; value: number }> }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      return {
        data: [
          { date: '2024-01-01', value: 10 },
          { date: '2024-01-02', value: 15 },
          { date: '2024-01-03', value: 8 },
          { date: '2024-01-04', value: 12 },
          { date: '2024-01-05', value: 20 },
        ]
      };
    }

    // Original real API logic (without try/catch fallback)
    const response = await fetch(`/api/analytics?type=model_timeseries&model_name=${encodeURIComponent(modelName)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch model timeseries');
    }

    return data;
  }

  async getModelIssueBreakdown(modelName: string, dataSource: DataSource = 'real'): Promise<{ data: Array<{ name: string; value: number }> }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      return {
        data: [
          { name: 'Hallucination', value: 45 },
          { name: 'Memory Issues', value: 32 },
          { name: 'Reliability', value: 28 },
          { name: 'UI Problems', value: 18 },
        ]
      };
    }

    // Original real API logic (without try/catch fallback)
    const response = await fetch(`/api/analytics?type=model_issue_breakdown&model_name=${encodeURIComponent(modelName)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch model issue breakdown');
    }

    return data;
  }

  async getIssueAffectedModels(issueCategory: string, dataSource: DataSource = 'real'): Promise<{ data: Array<{ name: string; value: number }> }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      return {
        data: [
          { name: 'GPT-4', value: 25 },
          { name: 'Claude-3', value: 18 },
          { name: 'GPT-3.5', value: 15 },
          { name: 'Gemini Pro', value: 12 },
        ]
      };
    }

    // Original real API logic (without try/catch fallback)
    const response = await fetch(`/api/analytics?type=issue_models&issue_category=${encodeURIComponent(issueCategory)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch issue affected models');
    }

    return data;
  }

  async getRecentClusters(dataSource: DataSource = 'real'): Promise<{ data: Array<{ cluster_id: string; cluster_summary: string; report_count: number; representative_texts: string[]; processed_at: string }> }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      return {
        data: [
          {
            cluster_id: 'cluster_001',
            cluster_summary: 'Issues related to: hallucination, reliability (5 reports)',
            report_count: 5,
            representative_texts: ['Model keeps making up facts', 'Unreliable responses with incorrect information'],
            processed_at: new Date().toISOString()
          },
          {
            cluster_id: 'cluster_002',
            cluster_summary: 'Issues related to: memory, context (3 reports)',
            report_count: 3,
            representative_texts: ['Loses track of conversation', 'Forgets previous context'],
            processed_at: new Date().toISOString()
          }
        ]
      };
    }

    // Original real API logic (without try/catch fallback)
    const response = await fetch(`/api/analytics?type=recent_clusters`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch recent clusters');
    }

    return data;
  }

  async getModelIssuesTimeseries(timeRange?: string, modelFamily?: string, dataSource: DataSource = 'real'): Promise<{
    data: Array<{
      date: string;
      name: string;
      value: number;
      [modelName: string]: string | number;
    }>;
    models: string[]
  }> {
    if (dataSource === 'mock') {
      // Return mock data directly, no API call
      const mockModels = ['GPT-4', 'Claude-3', 'GPT-3.5', 'Gemini Pro', 'Llama 2'];
      const mockData = [];

      // Determine number of days based on timeRange
      const daysMap: { [key: string]: number } = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      const days = daysMap[timeRange || '30d'] || 30;

      // Generate mock data for the specified time range
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const entry: { date: string; name: string; value: number; [modelName: string]: string | number } = {
          date: dateStr,
          name: dateStr,
          value: 0
        };

        mockModels.forEach((model) => {
          // Generate random issue counts with some models having higher baseline issues
          const baseIssues = model === 'GPT-4' ? 15 : model === 'Claude-3' ? 12 : model === 'GPT-3.5' ? 10 : model === 'Gemini Pro' ? 8 : 6;
          entry[model] = Math.max(0, baseIssues + Math.floor(Math.random() * 10) - 5);
        });

        mockData.push(entry);
      }

      return {
        data: mockData,
        models: mockModels
      };
    }

    // Original real API logic (without try/catch fallback)
    const params = new URLSearchParams({
      type: 'model_issues_timeseries',
      ...(timeRange && { time_range: timeRange }),
      ...(modelFamily && modelFamily !== 'all' && { model_family: modelFamily }),
    });

    console.log('🔍 Fetching model issues timeseries with params:', {
      timeRange,
      modelFamily,
      url: `/api/analytics?${params}`
    });

    const response = await fetch(`/api/analytics?${params}`);
    const data = await response.json();

    if (!response.ok) {
      console.log('❌ API call failed:', data.error);
      throw new Error(data.error || 'Failed to fetch model issues timeseries');
    }

    console.log('✅ API call successful, returning real data');
    return data;
  }



  // Health check
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();

      return {
        healthy: response.ok,
        message: data.message || 'API health check completed'
      };
    } catch (error) {
      console.error('API health check failed:', error);
      return { healthy: false, message: 'API unavailable' };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();