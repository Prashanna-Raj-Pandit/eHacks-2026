from __future__ import annotations

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    firstName: str = ""
    lastName: str = ""
    email: str = ""
    phone: str = ""
    bio: str = ""
    location: str = ""
    skills: list[str] = Field(default_factory=list)


class WorkExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    startDate: str = ""
    endDate: str = ""
    current: bool = False
    description: str = ""


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    startDate: str = ""
    endDate: str = ""
    current: bool = False


class PortfolioProfile(BaseModel):
    user: UserProfile = Field(default_factory=UserProfile)
    workExperience: list[WorkExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)