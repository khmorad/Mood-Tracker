from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import date, datetime
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