import enum
from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


class ProjectStatus(str, enum.Enum):
    idee = "idee"
    script = "script"
    opnemen = "opnemen"
    bewerken = "bewerken"
    klaar = "klaar"
    gepubliceerd = "gepubliceerd"


class ChecklistSection(str, enum.Enum):
    voorbereiding = "voorbereiding"
    tijdens_filmen = "tijdens_filmen"
    na_filmen = "na_filmen"


class StoryboardBlock(str, enum.Enum):
    intro = "intro"
    scene1 = "scene1"
    scene2 = "scene2"
    scene3 = "scene3"
    einde = "einde"


class KanbanColumn(str, enum.Enum):
    ideeen = "ideeen"
    mee_bezig = "mee_bezig"
    later = "later"
    klaar = "klaar"


class TaskPriority(str, enum.Enum):
    hoog = "hoog"
    normaal = "normaal"
    laag = "laag"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    openai_api_key = Column(String, nullable=True)
    youtube_access_token = Column(String, nullable=True)
    youtube_refresh_token = Column(String, nullable=True)
    youtube_token_expires_at = Column(DateTime, nullable=True)
    youtube_channel_id = Column(String, nullable=True)
    youtube_channel_title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    ideas = relationship("IdeaCard", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    diary_entries = relationship("DiaryEntry", back_populates="owner", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    thumbnail_path = Column(String, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.idee, nullable=False)
    youtube_video_id = Column(String, nullable=True)
    youtube_video_title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    checklist_items = relationship(
        "ChecklistItem", back_populates="project", cascade="all, delete-orphan", order_by="ChecklistItem.order"
    )
    storyboard_scenes = relationship(
        "StoryboardScene", back_populates="project", cascade="all, delete-orphan", order_by="StoryboardScene.order"
    )
    diary_entries = relationship("DiaryEntry", back_populates="project", cascade="all, delete-orphan")
    template = relationship(
        "ProjectTemplate", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    tips = relationship(
        "ProjectTip", back_populates="project", cascade="all, delete-orphan", order_by="ProjectTip.created_at.desc()"
    )


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    section = Column(Enum(ChecklistSection), nullable=False)
    text = Column(String, nullable=False)
    is_checked = Column(Boolean, default=False)
    is_custom = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    project = relationship("Project", back_populates="checklist_items")


class StoryboardScene(Base):
    __tablename__ = "storyboard_scenes"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    block = Column(Enum(StoryboardBlock), nullable=False)
    title = Column(String, default="")
    notes = Column(Text, default="")
    order = Column(Integer, default=0)

    project = relationship("Project", back_populates="storyboard_scenes")


class IdeaCard(Base):
    __tablename__ = "idea_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    note = Column(Text, default="")
    column = Column(Enum(KanbanColumn), default=KanbanColumn.ideeen, nullable=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="ideas")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    deadline = Column(Date, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.normaal, nullable=False)
    is_done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="tasks")


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    entry_date = Column(Date, default=date.today)
    wat_ging_goed = Column(Text, default="")
    wat_kan_beter = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="diary_entries")
    project = relationship("Project", back_populates="diary_entries")


class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    thema = Column(Text, default="")
    bronnen = Column(Text, default="")
    afbeeldingen_ideeen = Column(Text, default="")
    inspiratie_urls = Column(Text, default="")
    intro_uitleg = Column(Text, default="")
    midden_uitleg = Column(Text, default="")
    einde_uitleg = Column(Text, default="")

    project = relationship("Project", back_populates="template")


class ProjectTip(Base):
    __tablename__ = "project_tips"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tips")


class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = (UniqueConstraint("user_id", "badge_key", name="uq_user_badge"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_key = Column(String, nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="badges")
