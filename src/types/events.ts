/**
 * Geolocation data derived from user's IP address.
 */
export interface Geolocation {
  city?: string;
  region?: string;
  country?: string;
}

/**
 * Details parsed from the User Agent string.
 */
export interface UserAgentDetails {
  browser?: string;
  os?: string;
  device_type: 'desktop' | 'mobile' | 'unknown';
}

/**
 * Base model for all events captured by the system.
 */
export interface EventBase {
  session_id: string; // Anonymous user/session token
  timestamp: string; // ISO 8601 format
  geo_location: Geolocation;
  user_agent_details: UserAgentDetails;
}

/**
 * Model for a search event, which may include a quick report.
 */
export interface SearchEvent extends EventBase {
  event_type: 'search';
  model_name: string;
  entry_path: 'search_tab' | 'overview_tab';
  quick_report_text?: string; // Optional free-text from initial report
}

/**
 * Model for an expanded, detailed report submission.
 * This is treated as an update/enrichment of an initial SearchEvent.
 */
export interface DetailedReport {
  // Corresponds to the session_id and timestamp of the initial event
  session_id: string;
  original_timestamp: string;
  model_name: string; // Required to identify the model being reported on

  issue_category: string;
  severity?: 'low' | 'medium' | 'high';
  product_context: string; // e.g., "Direct API", "Cursor"
  quickReportText?: string;
}