from datetime import datetime, date
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, EmailStr, ConfigDict

from models import (
    ProjectStatus,
    ChecklistSection,
    StoryboardBlock,
    KanbanColumn,
    TaskPriority,
    TargetAge,
    LLMProvider,
    InspirationType,
)


# --- Auth ---
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    has_llm_key: bool = False
    llm_provider: Optional[LLMProvider] = None
    llm_model: Optional[str] = None
    llm_custom_endpoint: Optional[str] = None

    @classmethod
    def from_user(cls, user) -> "UserOut":
        out = cls.model_validate(user)
        out.has_llm_key = bool(user.llm_api_key_encrypted)
        return out


class UserSettingsUpdate(BaseModel):
    llm_provider: Optional[LLMProvider] = None
    llm_api_key: Optional[str] = None
    llm_model: Optional[str] = None
    llm_custom_endpoint: Optional[str] = None


class LLMVerifyRequest(BaseModel):
    llm_provider: LLMProvider
    llm_api_key: str
    llm_model: Optional[str] = None
    llm_custom_endpoint: Optional[str] = None


class LLMVerifyResult(BaseModel):
    ok: bool
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Checklist ---
class ChecklistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    section: ChecklistSection
    text: str
    is_checked: bool
    is_custom: bool
    order: int


class ChecklistItemCreate(BaseModel):
    section: ChecklistSection
    text: str


class ChecklistItemUpdate(BaseModel):
    text: Optional[str] = None
    is_checked: Optional[bool] = None


# --- Storyboard ---
class StoryboardSceneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    block: StoryboardBlock
    title: str
    notes: str
    order: int


class StoryboardSceneUpdate(BaseModel):
    id: int
    title: Optional[str] = None
    notes: Optional[str] = None


# --- Project ---
class ProjectCreate(BaseModel):
    title: str
    description: str = ""


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    thumbnail_path: Optional[str] = None
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
    checklist_progress: float = 0.0
    youtube_video_id: Optional[str] = None
    youtube_video_title: Optional[str] = None


class ProjectDetailOut(ProjectOut):
    checklist_items: List[ChecklistItemOut] = []
    storyboard_scenes: List[StoryboardSceneOut] = []


# --- Ideas (Kanban) ---
class IdeaCardCreate(BaseModel):
    title: str
    description: str = ""
    note: str = ""
    theme: Optional[str] = None
    target_age: Optional[TargetAge] = None
    estimated_date: Optional[date] = None
    template_key: Optional[str] = None
    column: KanbanColumn = KanbanColumn.backlog


class IdeaCardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    note: Optional[str] = None
    theme: Optional[str] = None
    target_age: Optional[TargetAge] = None
    estimated_date: Optional[date] = None
    template_key: Optional[str] = None
    column: Optional[KanbanColumn] = None
    order: Optional[int] = None


class IdeaCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    note: str
    theme: Optional[str] = None
    target_age: Optional[TargetAge] = None
    estimated_date: Optional[date] = None
    template_key: Optional[str] = None
    ai_generations: Optional[Dict[str, str]] = None
    column: KanbanColumn
    order: int

    @classmethod
    def from_idea(cls, idea) -> "IdeaCardOut":
        import json

        data = {
            "id": idea.id,
            "title": idea.title,
            "description": idea.description or "",
            "note": idea.note or "",
            "theme": idea.theme,
            "target_age": idea.target_age,
            "estimated_date": idea.estimated_date,
            "template_key": idea.template_key,
            "ai_generations": json.loads(idea.ai_generations) if idea.ai_generations else {},
            "column": idea.column,
            "order": idea.order,
        }
        return cls(**data)


class IdeaGenerateRequest(BaseModel):
    kind: str


# --- Tasks ---
class TaskCreate(BaseModel):
    title: str
    deadline: Optional[date] = None
    priority: TaskPriority = TaskPriority.normaal


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    deadline: Optional[date] = None
    priority: Optional[TaskPriority] = None
    is_done: Optional[bool] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    deadline: Optional[date] = None
    priority: TaskPriority
    is_done: bool
    created_at: datetime


# --- Diary ---
class DiaryEntryCreate(BaseModel):
    project_id: Optional[int] = None
    entry_date: date = date.today()
    wat_ging_goed: str = ""
    wat_kan_beter: str = ""


class DiaryEntryUpdate(BaseModel):
    wat_ging_goed: Optional[str] = None
    wat_kan_beter: Optional[str] = None


class DiaryEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: Optional[int] = None
    entry_date: date
    wat_ging_goed: str
    wat_kan_beter: str
    created_at: datetime


# --- Project template & GPT tips ---
class ProjectTemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    thema: str
    bronnen: str
    afbeeldingen_ideeen: str
    inspiratie_urls: str
    intro_uitleg: str
    midden_uitleg: str
    einde_uitleg: str


class ProjectTemplateUpdate(BaseModel):
    thema: Optional[str] = None
    bronnen: Optional[str] = None
    afbeeldingen_ideeen: Optional[str] = None
    inspiratie_urls: Optional[str] = None
    intro_uitleg: Optional[str] = None
    midden_uitleg: Optional[str] = None
    einde_uitleg: Optional[str] = None


class TipRequest(BaseModel):
    question: str


class ProjectTipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question: str
    answer: str
    created_at: datetime


# --- YouTube ---
class YoutubeStatusOut(BaseModel):
    connected: bool
    channel_title: Optional[str] = None


class YoutubeVideoOut(BaseModel):
    video_id: str
    title: str
    thumbnail: Optional[str] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None


class YoutubeLinkUpdate(BaseModel):
    youtube_video_id: Optional[str] = None
    youtube_video_title: Optional[str] = None


class YoutubeStatsOut(BaseModel):
    view_count: Optional[int] = None
    like_count: Optional[int] = None


# --- Inspiration ---
class InspirationCreate(BaseModel):
    type: InspirationType = InspirationType.link
    content: str
    tags: str = ""


class InspirationUpdate(BaseModel):
    type: Optional[InspirationType] = None
    content: Optional[str] = None
    tags: Optional[str] = None


class InspirationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: InspirationType
    content: str
    tags: str
    created_at: datetime


# --- Content templates (static library) ---
class ContentTemplateOut(BaseModel):
    key: str
    name: str
    icon: str
    structure: Dict[str, str]
    recommended_length: str
    thumbnail_tips: str
    title_formulas: List[str]
    checklist: Dict[str, List[str]]


# --- Trends ---
class TrendVideoOut(BaseModel):
    video_id: str
    title: str
    channel_title: str
    thumbnail: Optional[str] = None
    view_count: int
    published_at: str
    view_velocity: float


class TrendsOut(BaseModel):
    region_code: str
    category_id: str
    fetched_at: datetime
    keywords: List[str]
    videos: List[TrendVideoOut]


# --- Recommendations ---
class RecommendationRequest(BaseModel):
    target_age: TargetAge
    theme: str


class RecommendationOut(BaseModel):
    suggested_ideas: List[str]
    suggested_template: Optional[ContentTemplateOut] = None
    tone_and_length: str
    reasoning: str


# --- Badges ---
class BadgeOut(BaseModel):
    key: str
    title: str
    icon: str
    earned_at: Optional[datetime] = None
    earned: bool


# --- Dashboard ---
class DashboardOut(BaseModel):
    project_count: int
    open_task_count: int
    idea_count: int
    latest_project: Optional[ProjectOut] = None
    quote: str
    badges: List[BadgeOut]


# --- Search ---
class SearchResults(BaseModel):
    projects: List[ProjectOut]
    ideas: List[IdeaCardOut]
    tasks: List[TaskOut]
