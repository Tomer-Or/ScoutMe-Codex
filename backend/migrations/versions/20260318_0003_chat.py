"""Add chat conversations and messages."""

from alembic import op
import sqlalchemy as sa


revision = "20260318_0003"
down_revision = "20260316_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "conversation",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("participant_one_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("participant_two_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("participant_one_id", "participant_two_id", name="uq_conversation_pair"),
    )
    op.create_index("ix_conversation_participant_one_id", "conversation", ["participant_one_id"], unique=False)
    op.create_index("ix_conversation_participant_two_id", "conversation", ["participant_two_id"], unique=False)

    op.create_table(
        "message",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversation.id"), nullable=False),
        sa.Column("sender_user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_message_conversation_id", "message", ["conversation_id"], unique=False)
    op.create_index("ix_message_sender_user_id", "message", ["sender_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_message_sender_user_id", table_name="message")
    op.drop_index("ix_message_conversation_id", table_name="message")
    op.drop_table("message")

    op.drop_index("ix_conversation_participant_two_id", table_name="conversation")
    op.drop_index("ix_conversation_participant_one_id", table_name="conversation")
    op.drop_table("conversation")
