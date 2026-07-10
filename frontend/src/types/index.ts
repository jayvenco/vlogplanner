export type ProjectStatus = "idee" | "script" | "opnemen" | "bewerken" | "klaar" | "gepubliceerd";
export type ChecklistSection = "voorbereiding" | "tijdens_filmen" | "na_filmen";
export type StoryboardBlock = "intro" | "scene1" | "scene2" | "scene3" | "einde";
export type KanbanColumn = "ideeen" | "mee_bezig" | "later" | "klaar";
export type TaskPriority = "hoog" | "normaal" | "laag";

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  has_openai_key: boolean;
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
  note: string;
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
