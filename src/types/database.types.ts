export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type ProjectHealth = 'on_track' | 'at_risk' | 'blocked' | 'unknown';
export type IssueStatus = 'to_do' | 'in_progress' | 'done' | 'blocked';
export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask';

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          jira_key: string;
          jira_project_id: string;
          description: string | null;
          status: ProjectStatus;
          health: ProjectHealth;
          health_score: number | null;
          start_date: string | null;
          target_date: string | null;
          actual_completion_date: string | null;
          total_story_points: number;
          completed_story_points: number;
          total_issues: number;
          completed_issues: number;
          team_id: string | null;
          lead_id: string | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      issues: {
        Row: {
          id: string;
          jira_id: string;
          jira_key: string;
          project_id: string;
          sprint_id: string | null;
          parent_id: string | null;
          summary: string;
          description: string | null;
          issue_type: IssueType;
          status: IssueStatus;
          priority: string | null;
          story_points: number | null;
          assignee_id: string | null;
          reporter_id: string | null;
          labels: string[] | null;
          components: string[] | null;
          created_date: string;
          updated_date: string;
          resolved_date: string | null;
          due_date: string | null;
          is_blocked: boolean;
          blocked_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['issues']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['issues']['Insert']>;
      };
      sprints: {
        Row: {
          id: string;
          name: string;
          jira_sprint_id: string;
          project_id: string;
          state: string;
          start_date: string | null;
          end_date: string | null;
          complete_date: string | null;
          goal: string | null;
          velocity: number | null;
          planned_points: number;
          completed_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sprints']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sprints']['Insert']>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          jira_team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['teams']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          jira_account_id: string;
          team_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      forecasts: {
        Row: {
          id: string;
          project_id: string;
          forecast_type: string;
          predicted_completion_date: string;
          confidence_50_date: string | null;
          confidence_75_date: string | null;
          confidence_90_date: string | null;
          confidence_score: number | null;
          average_velocity: number | null;
          remaining_story_points: number | null;
          simulation_runs: number | null;
          metadata: Json | null;
          calculated_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['forecasts']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['forecasts']['Insert']>;
      };
    };
  };
}
