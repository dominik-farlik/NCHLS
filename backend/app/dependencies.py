from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

import config
from app.database import get_db

SessionDep = Annotated[Session, Depends(get_db)]

SettingsDep = Annotated[config.Settings, Depends(config.get_settings)]
