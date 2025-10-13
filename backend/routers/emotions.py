from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import sys
import os
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.schemas.db import get_db
from backend.tasks.emotion_scheduler import emotion_scheduler

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/emotions", tags=["emotions"])

@router.get("/", response_model=List[dict])
async def get_emotions(
    user_id: Optional[str] = Query(None),
    journal_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get emotion analysis results"""
    logger.info(f"[EmotionsAPI] GET emotions - user_id: {user_id}, journal_date: {journal_date}")
    
    try:
        base_query = "SELECT * FROM emotions WHERE 1=1"
        params = {}
        
        if user_id:
            base_query += " AND user_id = :user_id"
            params["user_id"] = user_id
        
        if journal_date:
            base_query += " AND journal_date = :journal_date"
            params["journal_date"] = journal_date
        
        base_query += " ORDER BY journal_date DESC"
        
        query = text(base_query)
        result = db.execute(query, params)
        
        emotions = result.fetchall()
        logger.info(f"[EmotionsAPI] Found {len(emotions)} emotion records")
        
        emotion_list = [dict(emotion._mapping) for emotion in emotions]
        logger.info(f"[EmotionsAPI] ✓ Successfully retrieved emotions")
        return emotion_list
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Error getting emotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/{user_id}")
async def get_dashboard_data(
    user_id: str,
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard data for a user"""
    logger.info(f"[EmotionsAPI] GET dashboard data for user: {user_id}, days: {days}")
    
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        
        # Get mood improvement data
        mood_improvement = await get_mood_improvement_data(user_id, days, db)
        
        # Get mood journey data  
        mood_journey = await get_mood_journey_data(user_id, days, db)
        
        # Get emotional landscape
        emotional_landscape = await get_emotional_landscape_data(user_id, days, db)
        
        # Get progress metrics
        progress_data = await get_progress_data(user_id, days, db)
        
        # Get journal entry count
        journal_entries = await get_journal_entries_count(user_id, days, db)
        
        dashboard_data = {
            "mood_improvement": mood_improvement,
            "mood_journey": mood_journey,
            "emotional_landscape": emotional_landscape,
            "progress": progress_data,
            "journal_entries": journal_entries,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            }
        }
        
        logger.info(f"[EmotionsAPI] ✓ Successfully retrieved dashboard data")
        return dashboard_data
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Error getting dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_mood_improvement_data(user_id: str, days: int, db: Session) -> Dict[str, Any]:
    """Calculate mood improvement percentage and trend"""
    try:
        # Get emotions for the period
        query = text("""
            SELECT journal_date, happy, sad, anxious, stressed, angry, agitated, neutral
            FROM emotions 
            WHERE user_id = :user_id 
            AND journal_date >= :start_date
            ORDER BY journal_date ASC
        """)
        
        start_date = date.today() - timedelta(days=days-1)
        result = db.execute(query, {"user_id": user_id, "start_date": start_date})
        emotions = result.fetchall()
        
        if len(emotions) < 2:
            return {
                "percentage": 0,
                "trend": "neutral",
                "message": "Need more data",
                "days_compared": 0
            }
        
        # Calculate mood scores (positive emotions - negative emotions)
        def calculate_mood_score(emotion_row):
            positive = emotion_row.happy + emotion_row.neutral
            negative = emotion_row.sad + emotion_row.anxious + emotion_row.stressed + emotion_row.angry + emotion_row.agitated
            return positive - negative
        
        # Compare first week vs last week
        mid_point = len(emotions) // 2
        first_half = emotions[:mid_point]
        second_half = emotions[mid_point:]
        
        first_half_avg = sum(calculate_mood_score(e) for e in first_half) / len(first_half)
        second_half_avg = sum(calculate_mood_score(e) for e in second_half) / len(second_half)
        
        # Calculate improvement percentage
        if first_half_avg != 0:
            improvement = ((second_half_avg - first_half_avg) / abs(first_half_avg)) * 100
        else:
            improvement = 0
        
        trend = "improving" if improvement > 5 else "declining" if improvement < -5 else "stable"
        
        return {
            "percentage": round(improvement, 1),
            "trend": trend,
            "message": f"{abs(round(improvement))}% {'better' if improvement > 0 else 'change'} than last period",
            "days_compared": len(emotions)
        }
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error calculating mood improvement: {e}")
        return {"percentage": 0, "trend": "neutral", "message": "Error calculating", "days_compared": 0}

async def get_mood_journey_data(user_id: str, days: int, db: Session) -> Dict[str, Any]:
    """Get mood journey data for calendar/chart visualization"""
    try:
        query = text("""
            SELECT journal_date, happy, sad, anxious, stressed, angry, agitated, neutral
            FROM emotions 
            WHERE user_id = :user_id 
            AND journal_date >= :start_date
            ORDER BY journal_date ASC
        """)
        
        start_date = date.today() - timedelta(days=days-1)
        result = db.execute(query, {"user_id": user_id, "start_date": start_date})
        emotions = result.fetchall()
        
        mood_data = []
        mood_scores = []
        
        for emotion in emotions:
            # Calculate overall mood score (1-5 scale)
            positive = emotion.happy + emotion.neutral
            negative = emotion.sad + emotion.anxious + emotion.stressed + emotion.angry + emotion.agitated
            total = positive + negative
            
            if total > 0:
                mood_score = (positive / total) * 5  # Scale to 1-5
            else:
                mood_score = 3  # Neutral
            
            mood_data.append({
                "date": emotion.journal_date.isoformat(),
                "mood_score": round(mood_score, 1),
                "dominant_emotion": get_dominant_emotion(emotion),
                "emotions": {
                    "happy": emotion.happy,
                    "sad": emotion.sad,
                    "anxious": emotion.anxious,
                    "stressed": emotion.stressed,
                    "angry": emotion.angry,
                    "agitated": emotion.agitated,
                    "neutral": emotion.neutral
                }
            })
            mood_scores.append(mood_score)
        
        # Calculate statistics
        if mood_scores:
            avg_mood = sum(mood_scores) / len(mood_scores)
            min_mood = min(mood_scores)
            max_mood = max(mood_scores)
        else:
            avg_mood = min_mood = max_mood = 3
        
        return {
            "daily_moods": mood_data,
            "statistics": {
                "average_mood": round(avg_mood, 1),
                "lowest_mood": round(min_mood, 1),
                "highest_mood": round(max_mood, 1),
                "total_days": len(mood_data)
            }
        }
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error getting mood journey: {e}")
        return {"daily_moods": [], "statistics": {"average_mood": 3, "lowest_mood": 3, "highest_mood": 3, "total_days": 0}}

async def get_emotional_landscape_data(user_id: str, days: int, db: Session) -> Dict[str, Any]:
    """Get emotional landscape percentages"""
    try:
        query = text("""
            SELECT 
                AVG(happy) as avg_happy,
                AVG(sad) as avg_sad,
                AVG(anxious) as avg_anxious,
                AVG(stressed) as avg_stressed,
                AVG(angry) as avg_angry,
                AVG(agitated) as avg_agitated,
                AVG(neutral) as avg_neutral
            FROM emotions 
            WHERE user_id = :user_id 
            AND journal_date >= :start_date
        """)
        
        start_date = date.today() - timedelta(days=days-1)
        result = db.execute(query, {"user_id": user_id, "start_date": start_date})
        emotion_avgs = result.fetchone()
        
        if not emotion_avgs or emotion_avgs.avg_happy is None:
            return {
                "emotions": [
                    {"name": "Happy", "percentage": 20, "color": "#10B981"},
                    {"name": "Calm", "percentage": 20, "color": "#3B82F6"},
                    {"name": "Sad", "percentage": 20, "color": "#8B5CF6"},
                    {"name": "Anxious", "percentage": 20, "color": "#F59E0B"},
                    {"name": "Angry", "percentage": 20, "color": "#EF4444"}
                ],
                "dominant_emotion": "Neutral"
            }
        
        # Calculate total and percentages
        total = (emotion_avgs.avg_happy + emotion_avgs.avg_sad + emotion_avgs.avg_anxious + 
                emotion_avgs.avg_stressed + emotion_avgs.avg_angry + emotion_avgs.avg_agitated + 
                emotion_avgs.avg_neutral)
        
        if total == 0:
            total = 1  # Avoid division by zero
        
        emotions_data = [
            {
                "name": "Happy",
                "percentage": round((emotion_avgs.avg_happy / total) * 100, 1),
                "color": "#10B981"
            },
            {
                "name": "Calm", 
                "percentage": round((emotion_avgs.avg_neutral / total) * 100, 1),
                "color": "#3B82F6"
            },
            {
                "name": "Sad",
                "percentage": round((emotion_avgs.avg_sad / total) * 100, 1),
                "color": "#8B5CF6"
            },
            {
                "name": "Anxious",
                "percentage": round((emotion_avgs.avg_anxious / total) * 100, 1),
                "color": "#F59E0B"
            },
            {
                "name": "Angry",
                "percentage": round(((emotion_avgs.avg_angry + emotion_avgs.avg_agitated) / total) * 100, 1),
                "color": "#EF4444"
            }
        ]
        
        # Find dominant emotion
        dominant = max(emotions_data, key=lambda x: x["percentage"])
        
        return {
            "emotions": emotions_data,
            "dominant_emotion": dominant["name"]
        }
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error getting emotional landscape: {e}")
        return {"emotions": [], "dominant_emotion": "Unknown"}

async def get_progress_data(user_id: str, days: int, db: Session) -> Dict[str, Any]:
    """Get progress metrics"""
    try:
        # Get journal entries count
        journal_query = text("""
            SELECT COUNT(*) as count
            FROM journal_entry 
            WHERE user_id = :user_id 
            AND journal_date >= :start_date
        """)
        
        start_date = date.today() - timedelta(days=days-1)
        journal_result = db.execute(journal_query, {"user_id": user_id, "start_date": start_date})
        journal_count = journal_result.fetchone().count
        
        # Calculate good days (days with positive mood)
        emotions_query = text("""
            SELECT journal_date, happy, neutral, sad, anxious, stressed, angry, agitated
            FROM emotions 
            WHERE user_id = :user_id 
            AND journal_date >= :start_date
        """)
        
        emotions_result = db.execute(emotions_query, {"user_id": user_id, "start_date": start_date})
        emotions = emotions_result.fetchall()
        
        good_days = 0
        total_analyzed_days = len(emotions)
        
        for emotion in emotions:
            positive = emotion.happy + emotion.neutral
            negative = emotion.sad + emotion.anxious + emotion.stressed + emotion.angry + emotion.agitated
            if positive > negative:
                good_days += 1
        
        # Calculate streaks
        current_streak = await calculate_current_streak(user_id, db)
        
        # Calculate mood stability (consistency in emotions)
        mood_stability = await calculate_mood_stability(emotions)
        
        return {
            "good_days": {
                "count": good_days,
                "total": total_analyzed_days,
                "percentage": round((good_days / max(total_analyzed_days, 1)) * 100, 1)
            },
            "journaling_streak": {
                "current_days": current_streak,
                "this_period": journal_count
            },
            "mood_stability": {
                "percentage": mood_stability,
                "status": "excellent" if mood_stability >= 80 else "good" if mood_stability >= 60 else "improving"
            },
            "total_entries": journal_count
        }
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error getting progress data: {e}")
        return {
            "good_days": {"count": 0, "total": 0, "percentage": 0},
            "journaling_streak": {"current_days": 0, "this_period": 0},
            "mood_stability": {"percentage": 0, "status": "unknown"},
            "total_entries": 0
        }

async def calculate_current_streak(user_id: str, db: Session) -> int:
    """Calculate current journaling streak"""
    try:
        query = text("""
            SELECT DISTINCT journal_date 
            FROM journal_entry 
            WHERE user_id = :user_id 
            ORDER BY journal_date DESC
            LIMIT 30
        """)
        
        result = db.execute(query, {"user_id": user_id})
        dates = [row.journal_date for row in result.fetchall()]
        
        if not dates:
            return 0
        
        # Check for consecutive days from today backwards
        streak = 0
        current_date = date.today()
        
        for check_date in dates:
            if check_date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error calculating streak: {e}")
        return 0

async def calculate_mood_stability(emotions) -> int:
    """Calculate mood stability percentage"""
    try:
        if len(emotions) < 3:
            return 85  # Default for insufficient data
        
        # Calculate variance in mood scores
        mood_scores = []
        for emotion in emotions:
            positive = emotion.happy + emotion.neutral
            negative = emotion.sad + emotion.anxious + emotion.stressed + emotion.angry + emotion.agitated
            total = positive + negative
            if total > 0:
                mood_score = positive / total
            else:
                mood_score = 0.5
            mood_scores.append(mood_score)
        
        # Calculate coefficient of variation (lower = more stable)
        avg_mood = sum(mood_scores) / len(mood_scores)
        variance = sum((x - avg_mood) ** 2 for x in mood_scores) / len(mood_scores)
        std_dev = variance ** 0.5
        
        if avg_mood > 0:
            cv = std_dev / avg_mood
            # Convert to stability percentage (inverse of variation)
            stability = max(0, min(100, (1 - cv) * 100))
        else:
            stability = 50
        
        return round(stability)
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error calculating mood stability: {e}")
        return 50

async def get_journal_entries_count(user_id: str, days: int, db: Session) -> Dict[str, Any]:
    """Get journal entries statistics"""
    try:
        # This week
        this_week_start = date.today() - timedelta(days=6)
        this_week_query = text("""
            SELECT COUNT(*) as count
            FROM journal_entry 
            WHERE user_id = :user_id 
            AND journal_date >= :start_date
        """)
        
        this_week_result = db.execute(this_week_query, {"user_id": user_id, "start_date": this_week_start})
        this_week_count = this_week_result.fetchone().count
        
        # Total for period
        period_start = date.today() - timedelta(days=days-1)
        total_result = db.execute(this_week_query, {"user_id": user_id, "start_date": period_start})
        total_count = total_result.fetchone().count
        
        return {
            "this_week": this_week_count,
            "total_period": total_count,
            "average_per_week": round((total_count / max(days / 7, 1)), 1)
        }
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] Error getting journal entries count: {e}")
        return {"this_week": 0, "total_period": 0, "average_per_week": 0}

def get_dominant_emotion(emotion_row) -> str:
    """Get the dominant emotion from an emotion row"""
    emotions = {
        "happy": emotion_row.happy,
        "sad": emotion_row.sad,
        "anxious": emotion_row.anxious,
        "stressed": emotion_row.stressed,
        "angry": emotion_row.angry,
        "agitated": emotion_row.agitated,
        "neutral": emotion_row.neutral
    }
    
    return max(emotions.items(), key=lambda x: x[1])[0]

@router.post("/analyze")
async def trigger_emotion_analysis(
    user_id: Optional[str] = Query(None),
    target_date: Optional[str] = Query(None)
):
    """Manually trigger emotion analysis"""
    logger.info(f"[EmotionsAPI] POST analyze - user_id: {user_id}, target_date: {target_date}")
    
    try:
        analysis_date = None
        if target_date:
            try:
                analysis_date = datetime.strptime(target_date, '%Y-%m-%d').date()
                logger.info(f"[EmotionsAPI] Parsed target date: {analysis_date}")
            except ValueError:
                logger.error(f"[EmotionsAPI] Invalid date format: {target_date}")
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        logger.info(f"[EmotionsAPI] Triggering manual analysis...")
        result = await emotion_scheduler.run_manual_analysis(user_id, analysis_date)
        logger.info(f"[EmotionsAPI] ✓ Manual analysis completed: {result}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Error triggering analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{user_id}")
async def get_emotion_summary(
    user_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get emotion summary for a user over a date range"""
    logger.info(f"[EmotionsAPI] GET summary for user: {user_id}, start_date: {start_date}, end_date: {end_date}")
    
    try:
        base_query = """
            SELECT 
                journal_date,
                happy, stressed, anxious, angry, sad, agitated, neutral
            FROM emotions 
            WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        
        if start_date:
            base_query += " AND journal_date >= :start_date"
            params["start_date"] = start_date
        
        if end_date:
            base_query += " AND journal_date <= :end_date"
            params["end_date"] = end_date
        
        base_query += " ORDER BY journal_date ASC"
        
        query = text(base_query)
        result = db.execute(query, params)
        
        emotions = result.fetchall()
        logger.info(f"[EmotionsAPI] Found {len(emotions)} emotion records for summary")
        
        emotion_list = [dict(emotion._mapping) for emotion in emotions]
        logger.info(f"[EmotionsAPI] ✓ Successfully retrieved emotion summary")
        return emotion_list
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Error getting emotion summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint for emotions
@router.get("/health")
async def emotions_health_check():
    """Health check for emotions system"""
    logger.info("[EmotionsAPI] Health check requested")
    
    try:
        # Check if scheduler is running
        scheduler_status = emotion_scheduler.is_running
        
        result = {
            "status": "healthy",
            "scheduler_running": scheduler_status,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"[EmotionsAPI] ✓ Health check result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))