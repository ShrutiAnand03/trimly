from app.config import database
from app.config.database import init_db


def test_init_db_creates_session_factory(test_database_url):
    init_db(test_database_url)

    assert database.SessionLocal is not None

    session = database.SessionLocal()
    session.close()
