from pydantic import BaseModel, ConfigDict


class HStatementBase(BaseModel):
    code: str
    description: str | None

    model_config = ConfigDict(from_attributes=True)
