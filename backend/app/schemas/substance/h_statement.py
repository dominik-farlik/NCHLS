from typing import Optional

from pydantic import BaseModel, ConfigDict


class HStatementBase(BaseModel):
    code: str
    description: Optional[str]

    model_config = ConfigDict(from_attributes=True)