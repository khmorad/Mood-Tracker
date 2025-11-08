from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import sys
import os
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..services.emotions_service import emotions_service
from ..services.users_service import users_service
from ..services.journals_service import journals_service
from ..tasks.emotion_scheduler import emotion_scheduler

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/emotions", tags=["emotions"])

@router.get("/", response_model=List[dict])
async def get_emotions(
    user_id: Optional[str] = Query(None),
    journal_date: Optional[str] = Query(None)
):
    """Get emotion analysis results"""
    logger.info(f"[EmotionsAPI] GET emotions - user_id: {user_id}, journal_date: {journal_date}")
    
    try:
        if user_id:
            emotions = emotions_service.get_emotions_by_user(user_id)
            # Filter by date if provided
            if journal_date:
                emotions = [e for e in emotions if e.get('journal_date') == journal_date]
            logger.info(f"[EmotionsAPI] Found {len(emotions)} emotion records")
            return emotions
        else:
            # Get all emotions using Supabase
            client = emotions_service.client
            result = client.table("emotions").select("*").order("journal_date", desc=True).execute()
            logger.info(f"[EmotionsAPI] Found {len(result.data)} emotion records")
            return result.data or []
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Error getting emotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/{user_id}")
async def get_dashboard_data(
    user_id: str,
    days: int = Query(30, description="Number of days to analyze")
):
    """Get comprehensive dashboard data for a user"""
    logger.info(f"[EmotionsAPI] GET dashboard data for user: {user_id}, days: {days}")
    
    try:
        # Check if user exists
        user = users_service.get_user_by_id(user_id)
        if not user:
            logger.warning(f"[EmotionsAPI] User {user_id} not found")
            # Return empty data structure instead of error for better UX
            return {
                "mood_improvement": {"percentage": 0, "trend": "neutral", "message": "No data available", "days_compared": 0},
                "mood_journey": {"daily_moods": [], "statistics": {"average_mood": 3, "lowest_mood": 0, "highest_mood": 0, "total_days": 0}},
                "emotional_landscape": {"emotions": [], "dominant_emotion": "Neutral"},
                "progress": {
                    "good_days": {"count": 0, "total": 0, "percentage": 0},
                    "journaling_streak": {"current_days": 0, "this_period": 0},
                    "mood_stability": {"percentage": 0, "status": "no_data"},
                    "total_entries": 0
                },
                "journal_entries": {"this_week": 0, "total_period": 0, "average_per_week": 0},
                "period": {
                    "start_date": (date.today() - timedelta(days=days-1)).isoformat(),
                    "end_date": date.today().isoformat(),
                    "days": days
                }
            }
        
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        
        logger.info(f"[EmotionsAPI] Processing data for user {user_id} from {start_date} to {end_date}")
        
        # Get mood improvement data
        mood_improvement = await get_mood_improvement_data(user_id, days)
        
        # Get mood journey data  
        mood_journey = await get_mood_journey_data(user_id, days)
        
        # Get emotional landscape
        emotional_landscape = await get_emotional_landscape_data(user_id, days)
        
        # Get progress metrics
        progress_data = await get_progress_data(user_id, days)
        
        # Get journal entry count
        journal_entries = await get_journal_entries_count(user_id, days)
        
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
        
        logger.info(f"[EmotionsAPI] ✓ Successfully retrieved dashboard data for user {user_id}")
        logger.info(f"[EmotionsAPI] Data summary: {journal_entries['total_period']} entries, {progress_data['good_days']['count']} good days")
        return dashboard_data
        
    except Exception as e:
        logger.error(f"[EmotionsAPI] ✗ Error getting dashboard data for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_mood_improvement_data(user_id: str, days: int) -> Dict[str, Any]:
    """Calculate mood improvement percentage and trend"""
    try:
        # Get emotions for the period using Supabase
        emotions = emotions_service.get_emotions_by_user(user_id)
        
        # Filter by date range
        start_date = date.today() - timedelta(days=days-1)
        emotions = [e for e in emotions if datetime.fromisoformat(e['journal_date']).date() >= start_date]
        emotions.sort(key=lambda x: x['journal_date'])
        
        if len(emotions) < 2:
            return {
                "percentage": 0,
                "trend": "neutral",
                "message": "Need more data",
                "days_compared": 0
            }
        
        # Calculate mood scores (positive emotions - negative emotions)
        def calculate_mood_score(emotion_row):
            positive = emotion_row.get('happy', 0) + emotion_row.get('neutral', 0)
            negative = emotion_row.get('sad', 0) + emotion_row.get('anxious', 0) + emotion_row.get('stressed', 0) + emotion_row.get('angry', 0) + emotion_row.get('agitated', 0)
            return positive - negative
        
        # Compare first half vs second half
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

async def get_mood_journey_data(user_id: str, days: int) -> Dict[str, Any]:
    """Get mood journey data for calendar/chart visualization"""
    try:
        # Get emotions using Supabase
        emotions = emotions_service.get_emotions_by_user(user_id)
        
        # Filter by date range
        start_date = date.today() - timedelta(days=days-1)
        emotions = [e for e in emotions if datetime.fromisoformat(e['journal_date']).date() >= start_date]
        emotions.sort(key=lambda x: x['journal_date'])
        
        mood_data = []
        mood_scores = []
        
        for emotion in emotions:
            # Calculate overall mood score (1-5 scale)
            positive = emotion.get('happy', 0) + emotion.get('neutral', 0)
            negative = emotion.get('sad', 0) + emotion.get('anxious', 0) + emotion.get('stressed', 0) + emotion.get('angry', 0) + emotion.get('agitated', 0)
            total = positive + negative
            
            if total > 0:
                mood_score = (positive / total) * 5  # Scale to 1-5
            else:
                mood_score = 3  # Neutral
            
            mood_data.append({
                "date": emotion['journal_date'],
                "mood_score": round(mood_score, 1),
                "dominant_emotion": get_dominant_emotion(emotion),
                "emotions": {
                    "happy": emotion.get('happy', 0),
                    "sad": emotion.get('sad', 0),
                    "anxious": emotion.get('anxious', 0),
                    "stressed": emotion.get('stressed', 0),
                    "angry": emotion.get('angry', 0),
                    "agitated": emotion.get('agitated', 0),
                    "neutral": emotion.get('neutral', 0)
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

async def get_emotional_landscape_data(user_id: str, days: int) -> Dict[str, Any]:
    """Get emotional landscape percentages"""
    try:
        # Get emotions using Supabase
        emotions = emotions_service.get_emotions_by_user(user_id)
        
        # Filter by date range
        start_date = date.today() - timedelta(days=days-1)
        emotions = [e for e in emotions if datetime.fromisoformat(e['journal_date']).date() >= start_date]
        
        if not emotions:
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
        
        # Calculate averages
        avg_happy = sum(e.get('happy', 0) for e in emotions) / len(emotions)
        avg_sad = sum(e.get('sad', 0) for e in emotions) / len(emotions)
        avg_anxious = sum(e.get('anxious', 0) for e in emotions) / len(emotions)
        avg_stressed = sum(e.get('stressed', 0) for e in emotions) / len(emotions)
        avg_angry = sum(e.get('angry', 0) for e in emotions) / len(emotions)
        avg_agitated = sum(e.get('agitated', 0) for e in emotions) / len(emotions)
        avg_neutral = sum(e.get('neutral', 0) for e in emotions) / len(emotions)
        
        # Calculate total and percentages
        total = avg_happy + avg_sad + avg_anxious + avg_stressed + avg_angry + avg_agitated + avg_neutral
        
        if total == 0:
            total = 1  # Avoid division by zero
        
        emotions_data = [
            {
                "name": "Happy",
                "percentage": round((avg_happy / total) * 100, 1),
                "color": "#10B981"
            },
            {
                "name": "Calm", 
                "percentage": round((avg_neutral / total) * 100, 1),
                "color": "#3B82F6"
            },
            {
                "name": "Sad",
                "percentage": round((avg_sad / total) * 100, 1),
                "color": "#8B5CF6"
            },
            {
                "name": "Anxious",
                "percentage": round((avg_anxious / total) * 100, 1),
                "color": "#F59E0B"
            },
            {
                "name": "Angry",
                "percentage": round(((avg_angry + avg_agitated) / total) * 100, 1),
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

async def get_progress_data(user_id: str, days: int) -> Dict[str, Any]:
    """Get progress metrics"""
    try:
        # Get journal entries count using Supabase
        journal_entries = journals_service.get_journal_entries_by_user(user_id)
        
        # Filter by date range
        start_date = date.today() - timedelta(days=days-1)
        journal_entries = [e for e in journal_entries if datetime.fromisoformat(e['journal_date']).date() >= start_date]
        journal_count = len(journal_entries)
        
        # Get emotions using Supabase
        emotions = emotions_service.get_emotions_by_user(user_id)
        emotions = [e for e in emotions if datetime.fromisoformat(e['journal_date']).date() >= start_date]
        
        good_days = 0
        total_analyzed_days = len(emotions)
        
        for emotion in emotions:
            positive = emotion.get('happy', 0) + emotion.get('neutral', 0)
            negative = emotion.get('sad', 0) + emotion.get('anxious', 0) + emotion.get('stressed', 0) + emotion.get('angry', 0) + emotion.get('agitated', 0)
            if positive > negative:
                good_days += 1
        
        # Calculate streaks
        current_streak = await calculate_current_streak(user_id)
        
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

async def calculate_current_streak(user_id: str) -> int:
    """Calculate current journaling streak"""
    try:
        # Get journal entries using Supabase
        journal_entries = journals_service.get_journal_entries_by_user(user_id)
        
        # Get unique dates and sort
        dates = sorted(set(e['journal_date'] for e in journal_entries), reverse=True)[:30]
        
        if not dates:
            return 0
        
        # Check for consecutive days from today backwards
        streak = 0
        current_date = date.today()
        
        for check_date_str in dates:
            check_date = datetime.fromisoformat(check_date_str).date()
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
            positive = emotion.get('happy', 0) + emotion.get('neutral', 0)
            negative = emotion.get('sad', 0) + emotion.get('anxious', 0) + emotion.get('stressed', 0) + emotion.get('angry', 0) + emotion.get('agitated', 0)
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

async def get_journal_entries_count(user_id: str, days: int) -> Dict[str, Any]:
    """Get journal entries statistics"""
    try:
        # Get journal entries using Supabase
        journal_entries = journals_service.get_journal_entries_by_user(user_id)
        
        # Filter by date ranges
        this_week_start = date.today() - timedelta(days=6)
        period_start = date.today() - timedelta(days=days-1)
        
        this_week_count = len([e for e in journal_entries if datetime.fromisoformat(e['journal_date']).date() >= this_week_start])
        total_count = len([e for e in journal_entries if datetime.fromisoformat(e['journal_date']).date() >= period_start])
        
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
        "happy": emotion_row.get('happy', 0),
        "sad": emotion_row.get('sad', 0),
        "anxious": emotion_row.get('anxious', 0),
        "stressed": emotion_row.get('stressed', 0),
        "angry": emotion_row.get('angry', 0),
        "agitated": emotion_row.get('agitated', 0),
        "neutral": emotion_row.get('neutral', 0)
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
    end_date: Optional[str] = Query(None)
):
    """Get emotion summary for a user over a date range"""
    logger.info(f"[EmotionsAPI] GET summary for user: {user_id}, start_date: {start_date}, end_date: {end_date}")
    
    try:
        # Get emotions using Supabase
        emotions = emotions_service.get_emotions_by_user(user_id)
        
        # Filter by date range if provided
        if start_date:
            emotions = [e for e in emotions if e['journal_date'] >= start_date]
        if end_date:
            emotions = [e for e in emotions if e['journal_date'] <= end_date]
        
        emotions.sort(key=lambda x: x['journal_date'])
        
        logger.info(f"[EmotionsAPI] Found {len(emotions)} emotion records for summary")
        logger.info(f"[EmotionsAPI] ✓ Successfully retrieved emotion summary")
        return emotions
        
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