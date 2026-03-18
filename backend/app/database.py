from time import sleep

from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel, Session, create_engine

from app.config import get_settings


settings = get_settings()
engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)


def init_db() -> None:
    last_error: OperationalError | None = None
    for _ in range(15):
        try:
            SQLModel.metadata.create_all(engine)
            return
        except OperationalError as exc:
            last_error = exc
            sleep(2)
    if last_error is not None:
        raise last_error


def get_session():
    with Session(engine) as session:
        yield session
