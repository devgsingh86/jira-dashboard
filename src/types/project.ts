import { Database } from './database.types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type Issue = Database['public']['Tables']['issues']['Row'];
export type Sprint = Database['public']['Tables']['sprints']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Forecast = Database['public']['Tables']['forecasts']['Row'];

// Extended types with relations
export interface ProjectWithDetails extends Project {
  team?: Team | null;
  lead?: User | null;
  issues_count?: number;
  sprints_count?: number;
  latest_forecast?: Forecast | null;
}

export interface ProjectFilters {
  status?: string[];
  health?: string[];
  team_id?: string;
  search?: string;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  on_track: number;
  at_risk: number;
  blocked: number;
  avg_health_score: number;
}
