"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-23

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("login", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP, nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "admin_sessions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "admin_id",
            sa.Integer,
            sa.ForeignKey("admins.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token", sa.String(512), nullable=False, unique=True),
        sa.Column("expires_at", sa.TIMESTAMP, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_admin_sessions_admin_id", "admin_sessions", ["admin_id"])


def downgrade() -> None:
    op.drop_index("ix_admin_sessions_admin_id", table_name="admin_sessions")
    op.drop_table("admin_sessions")
    op.drop_table("admins")
