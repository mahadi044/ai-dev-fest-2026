from sqlalchemy import text

from app.database.connection import engine


def migrate_database():
    with engine.begin() as connection:

        # Add user_id to existing transactions table
        columns = connection.execute(
            text("PRAGMA table_info(transactions)")
        ).fetchall()

        column_names = [column[1] for column in columns]

        if "user_id" not in column_names:
            connection.execute(
                text(
                    "ALTER TABLE transactions "
                    "ADD COLUMN user_id INTEGER"
                )
            )