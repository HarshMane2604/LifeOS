"""Pydantic schemas for Life Management (Goals, Timeline, Projects, Tasks)."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.goals import GoalHorizon, GoalStatus, ProjectStatus, TaskStatus
from app.models.finance import Priority


# ──────────────── Life Timeline (Life Goals) ────────────────

class LifeGoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    horizon: GoalHorizon
    target_year: int
    progress: int = Field(default=0, ge=0, le=100)
    status: GoalStatus = GoalStatus.NOT_STARTED
    order: int = 0


class LifeGoalCreate(LifeGoalBase):
    pass


class LifeGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    horizon: Optional[GoalHorizon] = None
    target_year: Optional[int] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[GoalStatus] = None
    order: Optional[int] = None


class LifeGoalResponse(LifeGoalBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Projects ────────────────

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    status: ProjectStatus = ProjectStatus.BACKLOG
    due_date: Optional[date] = None
    progress: int = Field(default=0, ge=0, le=100)
    color: Optional[str] = None
    icon: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[ProjectStatus] = None
    due_date: Optional[date] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    color: Optional[str] = None
    icon: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Milestones ────────────────

class MilestoneBase(BaseModel):
    title: str
    project_id: UUID
    due_date: Optional[date] = None
    status: GoalStatus = GoalStatus.NOT_STARTED
    order: int = 0


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    project_id: Optional[UUID] = None
    due_date: Optional[date] = None
    status: Optional[GoalStatus] = None
    order: Optional[int] = None


class MilestoneResponse(MilestoneBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ──────────────── Tasks ────────────────

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[UUID] = None
    milestone_id: Optional[UUID] = None
    parent_task_id: Optional[UUID] = None
    priority: Priority = Priority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[date] = None
    time_estimate_mins: Optional[int] = None
    order: int = 0


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[UUID] = None
    milestone_id: Optional[UUID] = None
    parent_task_id: Optional[UUID] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[date] = None
    time_estimate_mins: Optional[int] = None
    order: Optional[int] = None


class TaskResponse(TaskBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskWithSubtasksResponse(TaskResponse):
    subtasks: list["TaskResponse"] = []

    model_config = {"from_attributes": True}
