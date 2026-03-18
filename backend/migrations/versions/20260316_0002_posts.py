"""Add posts table for feed."""

from alembic import op
import sqlalchemy as sa


revision = "20260316_0002"
down_revision = "20260315_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "post",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=True),
        sa.Column("highlight_video_id", sa.Integer(), sa.ForeignKey("highlightvideo.id"), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("post_type", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_post_user_id", "post", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_post_user_id", table_name="post")
    op.drop_table("post")
