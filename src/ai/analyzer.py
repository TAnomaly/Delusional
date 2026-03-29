"""AI Background Analyzer - weekly summaries and distraction detection.

This module runs as a background task, NOT as a notification pusher.
Results are stored in the database for users to check at their own pace.
"""
import logging
from datetime import datetime, timedelta
from collections import Counter

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.post import Post
from src.models.focus_session import FocusSession
from src.models.analytics import WeeklyAnalytics

logger = logging.getLogger(__name__)


async def generate_weekly_summary(user_id: str, db: AsyncSession) -> dict:
    """Generate a weekly summary for a user. Stored silently in DB."""
    week_ago = datetime.utcnow() - timedelta(days=7)

    # Count focus sessions
    focus_result = await db.execute(
        select(
            func.count(FocusSession.id),
            func.sum(FocusSession.duration_minutes),
        ).where(
            FocusSession.user_id == user_id,
            FocusSession.completed.is_(True),
            FocusSession.started_at >= week_ago,
        )
    )
    focus_row = focus_result.one()
    total_sessions = focus_row[0] or 0
    total_minutes = focus_row[1] or 0

    # Count posts and analyze tags
    posts_result = await db.execute(
        select(Post).where(
            Post.author_id == user_id,
            Post.created_at >= week_ago,
        )
    )
    posts = posts_result.scalars().all()
    total_posts = len(posts)

    # Tag frequency analysis
    tag_counter = Counter()
    for post in posts:
        for tag in (post.tags or []):
            tag_counter[tag] += 1
    top_tags = dict(tag_counter.most_common(5))

    # Simple AI-like analysis (no external LLM needed for basic version)
    summary_parts = []
    if total_minutes >= 150:
        summary_parts.append("Great focus week! You maintained strong concentration.")
    elif total_minutes >= 60:
        summary_parts.append("Decent focus week. Room for improvement.")
    else:
        summary_parts.append("Low focus time this week. Consider setting smaller goals.")

    if total_posts > 14:
        summary_parts.append("Warning: High posting frequency. Remember quality over quantity.")
    elif total_posts == 0:
        summary_parts.append("No posts this week. Sharing reflections can help track progress.")

    suggestions = {}
    if total_minutes < 60:
        suggestions["focus"] = "Try starting with 15-minute focus sessions"
    if total_posts > 14:
        suggestions["posting"] = "Limit posts to key insights only"
    if top_tags:
        suggestions["top_topic"] = f"Your main focus: {list(top_tags.keys())[0]}"

    ai_summary = " ".join(summary_parts)

    # Store in DB
    analytics = WeeklyAnalytics(
        user_id=user_id,
        week_start=week_ago,
        total_focus_minutes=total_minutes,
        total_posts=total_posts,
        streak_days=total_sessions,
        top_tags=top_tags,
        ai_summary=ai_summary,
        ai_suggestions=suggestions,
    )
    db.add(analytics)
    await db.flush()

    logger.info(f"Weekly summary generated for user {user_id}")
    return {
        "total_focus_minutes": total_minutes,
        "total_posts": total_posts,
        "top_tags": top_tags,
        "summary": ai_summary,
        "suggestions": suggestions,
    }


async def detect_distraction(user_id: str, db: AsyncSession) -> dict | None:
    """Detect if user is spending too much time or posting excessively.

    Returns warning data only if distraction detected.
    Does NOT send notifications - stored silently for user to check.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Check today's post count
    post_count_result = await db.execute(
        select(func.count(Post.id)).where(
            Post.author_id == user_id,
            Post.created_at >= today_start,
        )
    )
    post_count = post_count_result.scalar()

    # Check total session time today
    session_result = await db.execute(
        select(func.sum(FocusSession.duration_minutes)).where(
            FocusSession.user_id == user_id,
            FocusSession.started_at >= today_start,
        )
    )
    total_platform_time = session_result.scalar() or 0

    warnings = []
    if post_count > 15:
        warnings.append("You've posted a lot today. Time to step away and focus on real tasks.")
    if total_platform_time > 60:
        warnings.append("Extended platform usage detected. Remember: 15 min/day is the goal.")

    if warnings:
        logger.info(f"Distraction detected for user {user_id}: {warnings}")
        return {"warnings": warnings, "post_count": post_count, "platform_minutes": total_platform_time}

    return None
