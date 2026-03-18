"""Initial ScoutMe schema."""

from alembic import op
import sqlalchemy as sa


revision = "20260315_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=True)

    op.create_table(
        "playerprofile",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False, unique=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("profile_image_url", sa.String(), nullable=True),
        sa.Column("primary_position", sa.String(), nullable=False),
        sa.Column("secondary_position", sa.String(), nullable=True),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=True),
        sa.Column("dominant_foot", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "clubhistory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=False),
        sa.Column("club_name", sa.String(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("position", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    op.create_table(
        "playerstats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=False, unique=True),
        sa.Column("matches_played", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("goals", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("assists", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("minutes_played", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clean_sheets", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custom_notes", sa.Text(), nullable=True),
    )

    op.create_table(
        "achievement",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
    )

    op.create_table(
        "highlightvideo",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("video_url", sa.String(), nullable=False),
        sa.Column("thumbnail_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "comment",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=False),
        sa.Column("author_user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "endorsement",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("player_profile_id", sa.Integer(), sa.ForeignKey("playerprofile.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("player_profile_id", "user_id", name="uq_player_endorsement"),
    )


def downgrade() -> None:
    op.drop_table("endorsement")
    op.drop_table("comment")
    op.drop_table("highlightvideo")
    op.drop_table("achievement")
    op.drop_table("playerstats")
    op.drop_table("clubhistory")
    op.drop_table("playerprofile")
    op.drop_index("ix_user_email", table_name="user")
    op.drop_table("user")
