export type AssetCategory = 'financial' | 'business' | 'physical' | 'personal';

export type AssetStatus = 'idea' | 'research' | 'planning' | 'in_progress' | 'under_development' | 'acquired' | 'active' | 'generating_income' | 'completed' | 'archived';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  description?: string;
  status: AssetStatus;
  target_completion_date?: string;
  expected_cost: number;
  actual_invested: number;
  expected_value: number;
  expected_monthly_income: number;
  actual_monthly_income: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  project_id?: string;
  scalability: number;
  roadmap_canvas_data?: any;
  created_at: string;
  updated_at: string;
}

export interface AssetIdea {
  id: string;
  title: string;
  estimated_cost: number;
  estimated_time_months: number;
  potential_roi_percent: number;
  risk_level: RiskLevel;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  research_links?: string;
  asset_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssetDashboardData {
  total_assets_value: number;
  future_assets_value: number;
  total_monthly_income: number;
  expected_monthly_income: number;
  active_assets_count: number;
  ideas_count: number;
}
