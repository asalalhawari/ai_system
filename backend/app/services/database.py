"""
Database Service
Simple database connectivity check (optional for file-based processing)
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class DatabaseService:
    """
    Database service for optional database connectivity
    For this streamlined version, we primarily use file-based processing
    """
    
    def __init__(self):
        self.connected = False
    
    def check_connection(self) -> str:
        """
        Check database connection status
        Returns status string for health check
        """
        try:
            # For this streamlined version, we don't require database
            # All processing is done with uploaded Excel files
            return "file-based processing (no database required)"
        except Exception as e:
            logger.error(f"Database connection check failed: {str(e)}")
            return f"connection failed: {str(e)}"
    
    def get_connection_info(self) -> Dict[str, Any]:
        """
        Get database connection information
        """
        return {
            "type": "file-based",
            "status": "not required",
            "description": "Processing Excel files directly without database storage"
        }
