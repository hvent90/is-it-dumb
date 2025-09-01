import { DetailedReport } from '@/types';

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