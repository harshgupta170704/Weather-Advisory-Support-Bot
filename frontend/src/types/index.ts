// ClimaGuard — Frontend type definitions

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  temperature_c: number;
  precipitation_mm: number;
  precipitation_probability: number;
  wind_speed_kmh: number;
  wind_gusts_kmh: number;
  uv_index: number;
  observed_at: string;
  requested_window: string;
  source: string;
}

export interface TraceStep {
  step: string;
  detail: string;
  status: string;
}

export interface SelectedSOP {
  id: string;
  title: string;
  severity: string;
  category: string;
  reason: string;
  matched_conditions: Record<string, string>;
  selection_reason: string;
}

export interface MatchingSOP {
  id: string;
  title: string;
  severity: string;
}

export interface ChatResponse {
  answer: string;
  session_id: string;
  status: 'success' | 'no_policy' | 'location_error' | 'weather_error' | 'validation_error' | 'error';
  location: LocationData | null;
  weather: WeatherData | null;
  selected_sop: SelectedSOP | null;
  matching_sops: MatchingSOP[];
  trace: TraceStep[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  response?: ChatResponse;
  isLoading?: boolean;
}

export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
