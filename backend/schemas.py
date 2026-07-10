from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict

from models import ProjectStatus, ChecklistSection, StoryboardBlock, KanbanColumn, TaskPriority


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
    has_openai_key: bool = False

    @classmethod
    def from_user(cls, user) -> "UserOut":
        out = cls.model_validate(user)
        out.has_openai_key = bool(user.openai_api_key)
        return out


class UserSettingsUpdate(BaseModel):
    openai_api_key: Optional[str] = None


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
    note: str = ""
    column: KanbanColumn = KanbanColumn.ideeen


class IdeaCardUpdate(BaseModel):
    title: Optional[str] = None
    note: Optional[str] = None
    column: Optional[KanbanColumn] = None
    order: Optional[int] = None


class IdeaCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    note: str
    column: KanbanColumn
    order: int


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
