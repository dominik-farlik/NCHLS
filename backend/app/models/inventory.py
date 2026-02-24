from pydantic import BaseModel


class ResponsibleEmployee(BaseModel):
    employee: str
    department_name: str
