export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type GoalHorizon = '1y' | '3y' | '5y' | '10y';

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type ProjectStatus = 'backlog' | 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export type Mood = 'amazing' | 'good' | 'okay' | 'bad' | 'terrible';


export interface LifeGoal {
  id: string;
  title: string;
  description: string | null;
  horizon: GoalHorizon;
  target_year: number;
  progress: number;
  status: GoalStatus;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DreamImage {
  id: string;
  dream_id: string;
  image_url: string;
  caption: string | null;
  order: number;
  created_at: string;
}

export interface Dream {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  estimated_cost: number | null;
  priority: Priority;
  target_date: string | null;
  progress: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  images: DreamImage[];
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: ProjectStatus;
  due_date: string | null;
  progress: number;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  milestone_id: string | null;
  parent_task_id: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  time_estimate_mins: number | null;
  order: number;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
}

export interface JournalEntry {
  id: string;
  date: string;
  thoughts: string | null;
  wins: string | null;
  lessons: string | null;
  failures: string | null;
  gratitude: string | null;
  mood: Mood | null;
  energy_level: number | null;
  created_at: string;
  updated_at: string;
}
