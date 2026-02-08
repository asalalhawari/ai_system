"""
Claims AI Dashboard - Streamlined Backend
FastAPI server with essential endpoints for dashboard and AI fraud detection
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
from datetime import datetime
from typing import List, Optional, Dict, Any
import pandas as pd
import logging

from app.services.fraud_ai import FraudAI
from app.services.database import DatabaseService
from app.services.file_processor import FileProcessor

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Claims AI Dashboard API",
    description="AI-powered medical claims fraud detection and analytics",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
fraud_ai = FraudAI()
db_service = DatabaseService()
file_processor = FileProcessor()

# Create directories
os.makedirs("data/uploads", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "Claims AI Dashboard API",
        "version": "2.0.0",
        "status": "running"
    }

@app.get("/api/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": db_service.check_connection(),
        "ai_models": "ready"
    }

# =============================================================================
# FILE UPLOAD
# =============================================================================

@app.post("/api/upload")
async def upload_excel_file(file: UploadFile = File(...)):
    """
    Upload Excel file for claims processing and AI fraud analysis
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are supported")
    
    try:
        # Save uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = f"data/uploads/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process file and run AI analysis
        df = file_processor.process_excel(file_path)
        fraud_summary, analyzed_df = fraud_ai.analyze_claims(df)
        
        # Save processed data
        processed_path = f"data/processed/{timestamp}_processed.csv"
        analyzed_df.to_csv(processed_path, index=False)
        
        return {
            "message": "File uploaded and processed successfully",
            "filename": filename,
            "records_processed": len(df),
            "fraud_summary": fraud_summary,
            "processed_file": processed_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# =============================================================================
# AI FRAUD DETECTION
# =============================================================================

@app.get("/api/fraud/ai-overview")
async def get_ai_fraud_overview(
    limit: int = Query(1000, ge=100, le=10000, description="Max claims to analyze")
):
    """
    AI fraud detection overview with ML-powered insights
    """
    try:
        # Get latest processed data
        df = file_processor.get_latest_processed_data()
        if df is None or len(df) == 0:
            return {
                "message": "No processed claims data available. Please upload an Excel file first.",
                "total_claims": 0,
                "fraud_claims": 0,
                "fraud_rate": 0.0
            }
        
        # Limit data for performance
        if len(df) > limit:
            df = df.head(limit)
        
        # Run AI fraud analysis
        summary, analyzed_df = fraud_ai.analyze_claims(df)
        
        # Get top risky entities
        top_members = fraud_ai.get_top_risky_members(analyzed_df)
        top_providers = fraud_ai.get_top_risky_providers(analyzed_df)
        
        return {
            **summary,
            "top_risky_members": top_members,
            "top_risky_providers": top_providers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in AI fraud analysis: {str(e)}")

@app.get("/api/fraud/ai-cases")
async def get_ai_fraud_cases(
    min_score: float = Query(0.3, ge=0.0, le=1.0, description="Minimum fraud score"),
    limit: int = Query(50, ge=1, le=200, description="Max cases to return")
):
    """
    Get detailed AI fraud cases with scores and recommended actions
    """
    try:
        # Get latest processed data
        df = file_processor.get_latest_processed_data()
        if df is None or len(df) == 0:
            return {"fraud_cases": [], "total_analyzed": 0}
        
        # Run AI analysis
        summary, analyzed_df = fraud_ai.analyze_claims(df)
        
        # Get fraud cases
        fraud_cases = fraud_ai.get_fraud_cases(analyzed_df, min_score, limit)
        
        return {
            "fraud_cases": fraud_cases,
            "total_analyzed": len(analyzed_df),
            "total_flagged": len(fraud_cases),
            "min_score_filter": min_score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting AI fraud cases: {str(e)}")

# =============================================================================
# DASHBOARD ANALYTICS
# =============================================================================

@app.get("/api/dashboard/overview")
async def get_dashboard_overview():
    """
    Dashboard overview with key metrics
    """
    try:
        df = file_processor.get_latest_processed_data()
        if df is None or len(df) == 0:
            return {
                "totalClaims": 0,
                "totalAmount": 0.0,
                "avgAmount": 0.0,
                "dateRange": {"start": None, "end": None},
                "topSpecialty": {"name": "N/A", "claimCount": 0}
            }
        
        # Calculate overview metrics
        total_claims = len(df)
        total_amount = df['gross_claim_amount'].sum() if 'gross_claim_amount' in df.columns else 0
        avg_amount = df['gross_claim_amount'].mean() if 'gross_claim_amount' in df.columns else 0
        
        # Date range
        date_range = {"start": None, "end": None}
        if 'service_date' in df.columns:
            date_range = {
                "start": df['service_date'].min().isoformat() if pd.notna(df['service_date'].min()) else None,
                "end": df['service_date'].max().isoformat() if pd.notna(df['service_date'].max()) else None
            }
        
        # Top specialty
        top_specialty = {"name": "N/A", "claimCount": 0}
        if 'specialty_name' in df.columns:
            specialty_counts = df['specialty_name'].value_counts()
            if len(specialty_counts) > 0:
                top_specialty = {
                    "name": specialty_counts.index[0],
                    "claimCount": int(specialty_counts.iloc[0])
                }
        
        return {
            "totalClaims": int(total_claims),
            "totalAmount": float(total_amount),
            "avgAmount": float(avg_amount),
            "dateRange": date_range,
            "topSpecialty": top_specialty
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting dashboard overview: {str(e)}")

@app.get("/api/dashboard/specialties")
async def get_specialties_data(limit: int = Query(20, ge=1, le=100)):
    """
    Get specialty analysis for clinical dashboard
    """
    try:
        df = file_processor.get_latest_processed_data()
        if df is None or len(df) == 0 or 'specialty_name' not in df.columns:
            return {"specialties": []}
        
        # Group by specialty
        specialty_stats = df.groupby('specialty_name').agg({
            'gross_claim_amount': ['count', 'sum', 'mean']
        }).round(2)
        
        specialty_stats.columns = ['claims', 'total_amount', 'avg_amount']
        specialty_stats = specialty_stats.sort_values('claims', ascending=False).head(limit)
        
        # Calculate percentages
        total_claims = len(df)
        specialty_stats['percentage'] = (specialty_stats['claims'] / total_claims * 100).round(2)
        
        specialties = []
        for name, row in specialty_stats.iterrows():
            specialties.append({
                "name": str(name),
                "claims": int(row['claims']),
                "totalAmount": float(row['total_amount']),
                "avgAmount": float(row['avg_amount']),
                "percentage": float(row['percentage'])
            })
        
        return {"specialties": specialties}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting specialties data: {str(e)}")

@app.get("/api/dashboard/diagnoses")
async def get_diagnoses_data(limit: int = Query(20, ge=1, le=100)):
    """
    Get diagnosis analysis for clinical dashboard
    """
    try:
        df = file_processor.get_latest_processed_data()
        if df is None or len(df) == 0 or 'primary_diag_code' not in df.columns:
            return {"diagnoses": []}
        
        # Group by diagnosis
        diag_stats = df.groupby('primary_diag_code').agg({
            'gross_claim_amount': ['count', 'sum', 'mean']
        }).round(2)
        
        diag_stats.columns = ['cases', 'total_cost', 'avg_cost']
        diag_stats = diag_stats.sort_values('cases', ascending=False).head(limit)
        
        diagnoses = []
        for name, row in diag_stats.iterrows():
            diagnoses.append({
                "name": str(name),
                "cases": int(row['cases']),
                "totalCost": float(row['total_cost']),
                "avgCost": float(row['avg_cost'])
            })
        
        return {"diagnoses": diagnoses}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting diagnoses data: {str(e)}")

@app.get("/api/dashboard/providers")
async def get_providers_data(
    limit: int = Query(20, ge=1, le=100, description="Number of top providers to return"),
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
):
    """
    Get provider performance analysis
    
    Returns top providers by claims volume with financial metrics.
    Useful for identifying high-volume providers and fraud patterns.
    
    Args:
        limit: Number of providers to return (1-100)
        start_date: Optional start date for filtering
        end_date: Optional end date for filtering
    
    Returns:
        JSON with provider statistics including claims count, amounts, and percentages
    """
    try:
        # Get latest processed data
        df = file_processor.get_latest_processed_data()
        
        if df is None or len(df) == 0:
            logger.warning("No processed data available for provider analysis")
            return {"providers": []}
        
        # Check for required columns
        if 'provider_treat_code' not in df.columns:
            logger.error("Missing 'provider_treat_code' column in data")
            raise HTTPException(
                status_code=400,
                detail="Data missing required 'provider_treat_code' column"
            )
        
        # Apply date filtering if provided
        if start_date and end_date:
            if 'service_date' in df.columns:
                try:
                    df['service_date'] = pd.to_datetime(df['service_date'], errors='coerce')
                    start = pd.to_datetime(start_date)
                    end = pd.to_datetime(end_date)
                    df = df[(df['service_date'] >= start) & (df['service_date'] <= end)]
                    logger.info(f"Filtered data from {start_date} to {end_date}, {len(df)} records remain")
                except Exception as e:
                    logger.warning(f"Date filtering failed: {str(e)}")
        
        if len(df) == 0:
            return {"providers": []}
        
        # Group by provider and calculate statistics
        provider_stats = df.groupby('provider_treat_code').agg({
            'gross_claim_amount': ['count', 'sum', 'mean']
        }).round(2)
        
        # Flatten column names
        provider_stats.columns = ['claims', 'total_amount', 'avg_amount']
        
        # Sort by claims count (descending) and limit results
        provider_stats = provider_stats.sort_values('claims', ascending=False).head(limit)
        
        # Calculate percentage of total claims
        total_claims = len(df)
        provider_stats['percentage'] = (provider_stats['claims'] / total_claims * 100).round(2)
        
        # Convert to list of dictionaries for JSON response
        providers = []
        for provider_code, row in provider_stats.iterrows():
            providers.append({
                "name": str(provider_code),
                "claims": int(row['claims']),
                "totalAmount": float(row['total_amount']),
                "avgAmount": float(row['avg_amount']),
                "percentage": float(row['percentage'])
            })
        
        logger.info(f"Provider analysis completed: {len(providers)} providers returned")
        
        return {"providers": providers}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in provider analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during provider analysis: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
