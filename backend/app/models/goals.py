"""SQLAlchemy models for Life Management (Goals, Timeline, Dreams, Journal)."""

import uuid
import enum
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.finance import Priority


# ──────────────── Enums ────────────────

class GoalHorizon(str, enum.Enum):
    ONE_YEAR = "1y"
    THREE_YEAR = "3y"
    FIVE_YEAR = "5y"
    TEN_YEAR = "10y"


class GoalStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class ProjectStatus(str, enum.Enum):
    BACKLOG = "backlog"
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"


class Mood(str, enum.Enum):
    AMAZING = "amazing"
    GOOD = "good"
    OKAY = "okay"
    BAD = "bad"
    TERRIBLE = "terrible"


# ──────────────── Life Timeline ────────────────

class LifeGoal(Base):
    """Life timeline goals organized by time horizon."""

    __tablename__ = "life_goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    horizon: Mapped[GoalHorizon] = mapped_column(
        SAEnum(GoalHorizon), nullable=False
    )
    target_year: Mapped[int] = mapped_column(Integer, nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(GoalStatus), default=GoalStatus.NOT_STARTED
    )
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ──────────────── Dream Warehouse ────────────────

class Dream(Base):
    """Dream aspirations storage."""

    __tablename__ = "dreams"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    estimated_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority), default=Priority.MEDIUM
    )
    target_date: Mapped[Optional[date]] = mapped_column(Date)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    images: Mapped[list["DreamImage"]] = relationship(
        back_populates="dream", cascade="all, delete-orphan"
    )


class DreamImage(Base):
    """Images attached to dreams."""

    __tablename__ = "dream_images"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    dream_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dreams.id", ondelete="CASCADE"), nullable=False
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(300))
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    dream: Mapped["Dream"] = relationship(back_populates="images")


# ──────────────── Projects & Tasks ────────────────

class Project(Base):
    """Goal/Project containers."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority), default=Priority.MEDIUM
    )
    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus), default=ProjectStatus.BACKLOG
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    color: Mapped[Optional[str]] = mapped_column(String(20))
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    milestones: Mapped[list["Milestone"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class Milestone(Base):
    """Project milestones."""

    __tablename__ = "milestones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(GoalStatus), default=GoalStatus.NOT_STARTED
    )
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    project: Mapped["Project"] = relationship(back_populates="milestones")
    tasks: Mapped[list["Task"]] = relationship(back_populates="milestone")


class Task(Base):
    """Tasks and subtasks."""

    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE")
    )
    milestone_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("milestones.id", ondelete="SET NULL")
    )
    parent_task_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE")
    )
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority), default=Priority.MEDIUM
    )
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus), default=TaskStatus.TODO
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    time_estimate_mins: Mapped[Optional[int]] = mapped_column(Integer)
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    project: Mapped[Optional["Project"]] = relationship(back_populates="tasks")
    milestone: Mapped[Optional["Milestone"]] = relationship(back_populates="tasks")
    subtasks: Mapped[list["Task"]] = relationship(back_populates="parent_task")
    parent_task: Mapped[Optional["Task"]] = relationship(
        back_populates="subtasks", remote_side="Task.id"
    )


# ──────────────── Notes (Second Brain) ────────────────

class Note(Base):
    """Second Brain notes."""

    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class NoteTagMap(Base):
    """Join table for notes ↔ tags."""

    __tablename__ = "note_tag_map"

    note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )


class NoteBacklink(Base):
    """Backlinks between notes."""

    __tablename__ = "note_backlinks"

    source_note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    target_note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    )


# ──────────────── Journal ────────────────

class JournalEntry(Base):
    """Daily journal entries."""

    __tablename__ = "journal_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    thoughts: Mapped[Optional[str]] = mapped_column(Text)
    wins: Mapped[Optional[str]] = mapped_column(Text)
    lessons: Mapped[Optional[str]] = mapped_column(Text)
    failures: Mapped[Optional[str]] = mapped_column(Text)
    gratitude: Mapped[Optional[str]] = mapped_column(Text)
    mood: Mapped[Optional[Mood]] = mapped_column(SAEnum(Mood))
    energy_level: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ──────────────── Attachments (Universal) ────────────────

class Attachment(Base):
    """Universal file attachments for any entity."""

    __tablename__ = "attachments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(100))
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
