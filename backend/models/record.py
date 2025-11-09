from pydantic import BaseModel


class Record(BaseModel):
    substance_id: str
    amount: int
    location_name: str
    year: int