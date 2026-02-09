"""
File Processing Service
Handles Excel file upload, parsing, and data preparation
"""

import pandas as pd
import os
import glob
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class FileProcessor:
    """
    Service for processing Excel files and managing claims data
    """
    
    def __init__(self):
        self.processed_data_dir = "data/processed"
        self.uploads_dir = "data/uploads"
        
        # Column mapping for different Excel formats
        self.column_mapping = {
            # Standard mappings
            'Member ID (MEM)': 'member_id',
            'Service Date': 'service_date',
            'Provider Treat Code': 'provider_treat_code',
            'Gross Claim Amt': 'gross_claim_amount',
            'Quantity': 'quantity',
            'Service Category': 'service_category',
            'Clinic/Specialty': 'specialty_name',
            'Treating Physician': 'treating_physician',
            'Primary Diag Code': 'primary_diag_code',
            'Invoice No.': 'invoice_no',
            'Patient Name': 'patient_name',
            
            # Alternative column names
            'MemberID': 'member_id',
            'ServiceDate': 'service_date',
            'ProviderCode': 'provider_treat_code',
            'ClaimAmount': 'gross_claim_amount',
            'Qty': 'quantity',
            'Category': 'service_category',
            'Specialty': 'specialty_name',
            'Physician': 'treating_physician',
            'DiagnosisCode': 'primary_diag_code',
            'InvoiceNo': 'invoice_no',
            'PatientName': 'patient_name',
        }
    
    def process_excel(self, file_path: str) -> pd.DataFrame:
        """
        Process Excel file and return standardized DataFrame
        """
        try:
            logger.info(f"Processing Excel file: {file_path}")
            
            # Read Excel file
            df = pd.read_excel(file_path)
            logger.info(f"Loaded {len(df)} rows from Excel file")
            
            # Standardize column names
            df = self._standardize_columns(df)
            
            # Clean and validate data
            df = self._clean_data(df)
            
            logger.info(f"Processed {len(df)} valid records")
            return df
            
        except Exception as e:
            logger.error(f"Error processing Excel file {file_path}: {str(e)}")
            raise
    
    def _standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Standardize column names using mapping
        """
        # Create reverse mapping for case-insensitive matching
        reverse_mapping = {}
        for original, standard in self.column_mapping.items():
            reverse_mapping[original.lower()] = standard
        
        # Rename columns
        new_columns = {}
        for col in df.columns:
            col_lower = str(col).lower().strip()
            if col_lower in reverse_mapping:
                new_columns[col] = reverse_mapping[col_lower]
            else:
                # Keep original column name, make it lowercase and replace spaces
                new_columns[col] = col_lower.replace(' ', '_').replace('(', '').replace(')', '')
        
        df = df.rename(columns=new_columns)
        
        logger.info(f"Standardized columns: {list(df.columns)}")
        return df
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and validate data
        """
        original_count = len(df)
        
        # Convert data types
        if 'service_date' in df.columns:
            df['service_date'] = pd.to_datetime(df['service_date'], errors='coerce')
        
        if 'gross_claim_amount' in df.columns:
            df['gross_claim_amount'] = pd.to_numeric(df['gross_claim_amount'], errors='coerce')
        
        if 'quantity' in df.columns:
            df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
        
        # Remove rows with missing critical data
        critical_columns = ['member_id', 'service_date', 'provider_treat_code']
        available_critical = [col for col in critical_columns if col in df.columns]
        
        if available_critical:
            df = df.dropna(subset=available_critical)
        
        # Fill missing values
        df = df.fillna({
            'gross_claim_amount': 0,
            'quantity': 1,
            'service_category': 'Unknown',
            'specialty_name': 'Unknown',
            'primary_diag_code': 'Unknown'
        })
        
        # Remove duplicates
        df = df.drop_duplicates()
        
        cleaned_count = len(df)
        logger.info(f"Data cleaning: {original_count} → {cleaned_count} records")
        
        return df
    
    def get_latest_processed_data(self) -> Optional[pd.DataFrame]:
        """
        Get the most recently processed claims data
        """
        try:
            # Find latest processed CSV file
            pattern = os.path.join(self.processed_data_dir, "*_processed.csv")
            files = glob.glob(pattern)
            
            if not files:
                logger.warning("No processed data files found")
                return None
            
            # Get most recent file
            latest_file = max(files, key=os.path.getctime)
            logger.info(f"Loading latest processed data: {latest_file}")
            
            df = pd.read_csv(latest_file)
            
            # Ensure proper data types
            if 'service_date' in df.columns:
                df['service_date'] = pd.to_datetime(df['service_date'], errors='coerce')
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading processed data: {str(e)}")
            return None
    
    def get_file_info(self) -> Dict[str, Any]:
        """
        Get information about uploaded and processed files
        """
        try:
            # Count uploaded files
            upload_pattern = os.path.join(self.uploads_dir, "*")
            uploaded_files = glob.glob(upload_pattern)
            
            # Count processed files
            processed_pattern = os.path.join(self.processed_data_dir, "*_processed.csv")
            processed_files = glob.glob(processed_pattern)
            
            # Get latest file info
            latest_info = None
            if processed_files:
                latest_file = max(processed_files, key=os.path.getctime)
                df = pd.read_csv(latest_file)
                latest_info = {
                    "filename": os.path.basename(latest_file),
                    "records": len(df),
                    "columns": list(df.columns),
                    "last_modified": os.path.getctime(latest_file)
                }
            
            return {
                "uploaded_files_count": len(uploaded_files),
                "processed_files_count": len(processed_files),
                "latest_processed": latest_info
            }
            
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            return {
                "uploaded_files_count": 0,
                "processed_files_count": 0,
                "latest_processed": None
            }
