import datetime
from typing import Literal

from pydantic import BaseModel, Field


class InventoryReportRequest(BaseModel):
    year: int
    format: Literal["pdf", "docx"] = "pdf"
    date: datetime.date = Field(default_factory=datetime.date.today)
    responsible_employee: str = ""
    performed_by: str = ""
    contact: str = ""


class InventoryReportDefaults(BaseModel):
    responsible_employee: str
    contact: str
