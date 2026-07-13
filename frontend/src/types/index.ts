export type ProjectStatus = "idee" | "script" | "opnemen" | "bewerken" | "klaar" | "gepubliceerd";
export type ChecklistSection = "voorbereiding" | "tijdens_filmen" | "na_filmen";
export type StoryboardBlock = "intro" | "scene1" | "scene2" | "scene3" | "einde";
export type KanbanColumn = "backlog" | "bezig" | "afgerond";
export type TaskPriority = "hoog" | "normaal" | "laag";
export type TargetAge = "13-17" | "18-24" | "25-34" | "35+";
export type LLMProvider = "openai" | "anthropic" | "custom";
export type InspirationType = "link" | "screenshot_note" | "quote";

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  has_llm_key: boolean;
  llm_provider: LLMProvider | null;
  llm_model: string | null;
  llm_custom_endpoint: string | null;
}

export interface ChecklistItem {
  id: number;
  section: ChecklistSection;
  text: string;
  is_checked: boolean;
  is_custom: boolean;
  order: number;
}

export interface StoryboardScene {
  id: number;
  block: StoryboardBlock;
  title: string;
  notes: string;
  order: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  checklist_progress: number;
  youtube_video_id: string | null;
  youtube_video_title: string | null;
}

export interface ProjectDetail extends Project {
  checklist_items: ChecklistItem[];
  storyboard_scenes: StoryboardScene[];
}

export interface IdeaCardType {
  id: number;
  title: string;
  description: string;
  note: string;
  theme: string | null;
  target_age: TargetAge | null;
  estimated_date: string | null;
  template_key: string | null;
  ai_generations: Record<string, string>;
  column: KanbanColumn;
  order: number;
}

export interface TaskType {
  id: number;
  title: string;
  deadline: string | null;
  priority: TaskPriority;
  is_done: boolean;
  created_at: string;
}

export interface DiaryEntry {
  id: number;
  project_id: number | null;
  entry_date: string;
  wat_ging_goed: string;
  wat_kan_beter: string;
  created_at: string;
}

export interface Badge {
  key: string;
  title: string;
  icon: string;
  earned_at: string | null;
  earned: boolean;
}

export interface Dashboard {
  project_count: number;
  open_task_count: number;
  idea_count: number;
  latest_project: Project | null;
  quote: string;
  badges: Badge[];
}

export interface SearchResults {
  projects: Project[];
  ideas: IdeaCardType[];
  tasks: TaskType[];
}

export interface ProjectTemplate {
  thema: string;
  bronnen: string;
  afbeeldingen_ideeen: string;
  inspiratie_urls: string;
  intro_uitleg: string;
  midden_uitleg: string;
  einde_uitleg: string;
}

export interface ProjectTip {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export interface YoutubeStatus {
  connected: boolean;
  channel_title: string | null;
}

export interface YoutubeVideo {
  video_id: string;
  title: string;
  thumbnail: string | null;
  view_count: number | null;
  like_count: number | null;
}

export interface YoutubeStats {
  view_count: number | null;
  like_count: number | null;
}

export interface ContentTemplate {
  key: string;
  name: string;
  icon: string;
  structure: { hook: string; intro: string; body: string; cta: string; outro: string };
  recommended_length: string;
  thumbnail_tips: string;
  title_formulas: string[];
  checklist: {
    pre_productie: string[];
    opname: string[];
    montage: string[];
    publicatie: string[];
  };
}

export interface TrendCategory {
  id: string;
  label: string;
}

export interface TrendVideo {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail: string | null;
  view_count: number;
  published_at: string;
  view_velocity: number;
}

export interface TrendsData {
  region_code: string;
  category_id: string;
  fetched_at: string;
  keywords: string[];
  videos: TrendVideo[];
}

export interface RecommendationResult {
  suggested_ideas: string[];
  suggested_template: ContentTemplate | null;
  tone_and_length: string;
  reasoning: string;
}

export interface Inspiration {
  id: number;
  type: InspirationType;
  content: string;
  tags: string;
  created_at: string;
}
