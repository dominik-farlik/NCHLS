from typing import Optional

from bson import ObjectId
from pydantic import BaseModel


class Record(BaseModel):
    id: Optional[str] = None
    substance_id: str
    amount: float
    location_name: str
    year: int