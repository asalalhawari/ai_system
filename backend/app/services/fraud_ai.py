"""
AI Fraud Detection Service
Converted from Duplicate_Claims_Check.ipynb for production use
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
from typing import Dict, List, Any, Tuple
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class FraudAI:
    """
    AI-powered fraud detection service implementing notebook logic
    """
    
    def __init__(self):
        self.isolation_forest = None
        self.label_encoders = {}
        # Thresholds from notebook analysis
        self.fraud_thresholds = {
            'T': 5,  # Major surgeries → Quantity > 5 suspicious
            'P': 3,  # Pharmacy → Quantity > 3 suspicious
        }
    
    def detect_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Detect duplicate claims based on Member ID, Service Date, Provider Treat Code
        Implementation from notebook cell [1]
        """
        logger.info(f"Analyzing {len(df)} claims for duplicates")
        
        duplicate_columns = ["member_id", "service_date", "provider_treat_code"]
        
        # Check if required columns exist
        missing_cols = [col for col in duplicate_columns if col not in df.columns]
        if missing_cols:
            logger.warning(f"Missing columns for duplicate detection: {missing_cols}")
            df['duplicate_flag'] = False
            return df
        
        # Mark duplicates (same as notebook logic)
        df['duplicate_flag'] = df.duplicated(subset=duplicate_columns, keep=False)
        
        duplicate_count = df['duplicate_flag'].sum()
        logger.info(f"Found {duplicate_count} duplicate claims")
        
        return df
    
    def detect_suspicious_quantities(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Detect suspicious quantities based on service category thresholds
        Implementation from notebook cell [2]
        """
        logger.info("Analyzing suspicious quantities")
        
        df['suspicious_qty_flag'] = False
        
        if 'service_category' not in df.columns or 'quantity' not in df.columns:
            logger.warning("Missing columns for quantity analysis")
            return df
        
        # Apply threshold rules from notebook
        for category, threshold in self.fraud_thresholds.items():
            mask = (df['service_category'] == category) & (df['quantity'] > threshold)
            df.loc[mask, 'suspicious_qty_flag'] = True
        
        suspicious_count = df['suspicious_qty_flag'].sum()
        logger.info(f"Found {suspicious_count} suspicious quantity claims")
        
        return df
    
    def detect_outliers(self, df: pd.DataFrame, contamination: float = 0.02) -> pd.DataFrame:
        """
        Use Isolation Forest to detect outlier claims
        Implementation from notebook cell [3]
        """
        logger.info("Running Isolation Forest outlier detection")
        
        # Select features for outlier detection (from notebook)
        feature_columns = ["gross_claim_amount", "quantity", "service_category", "specialty_name"]
        available_features = [col for col in feature_columns if col in df.columns]
        
        if len(available_features) < 2:
            logger.warning("Insufficient features for outlier detection")
            df['outlier_flag'] = False
            df['outlier_score'] = 0.0
            return df
        
        # Prepare features
        df_features = df[available_features].copy()
        
        # Encode categorical variables (same as notebook)
        for col in ['service_category', 'specialty_name']:
            if col in df_features.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                
                # Handle missing values
                df_features[col] = df_features[col].fillna('Unknown')
                df_features[col] = self.label_encoders[col].fit_transform(df_features[col].astype(str))
        
        # Handle missing numerical values
        for col in ['gross_claim_amount', 'quantity']:
            if col in df_features.columns:
                df_features[col] = pd.to_numeric(df_features[col], errors='coerce').fillna(0)
        
        # Train Isolation Forest (same parameters as notebook)
        try:
            self.isolation_forest = IsolationForest(
                contamination=contamination, 
                random_state=42,
                n_estimators=100
            )
            
            outlier_predictions = self.isolation_forest.fit_predict(df_features)
            outlier_scores = self.isolation_forest.score_samples(df_features)
            
            # Convert predictions (-1 = outlier, 1 = normal) to boolean flags
            df['outlier_flag'] = outlier_predictions == -1
            df['outlier_score'] = outlier_scores
            
            outlier_count = df['outlier_flag'].sum()
            logger.info(f"Found {outlier_count} outlier claims")
            
        except Exception as e:
            logger.error(f"Error in outlier detection: {str(e)}")
            df['outlier_flag'] = False
            df['outlier_score'] = 0.0
        
        return df
    
    def compute_fraud_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute overall fraud score based on multiple flags
        Implementation from notebook cell [4]
        """
        # Initialize fraud score
        df['fraud_score'] = 0.0
        
        # Add points for each type of fraud indicator (same weights as notebook)
        if 'duplicate_flag' in df.columns:
            df.loc[df['duplicate_flag'], 'fraud_score'] += 0.4
        
        if 'suspicious_qty_flag' in df.columns:
            df.loc[df['suspicious_qty_flag'], 'fraud_score'] += 0.3
        
        if 'outlier_flag' in df.columns:
            df.loc[df['outlier_flag'], 'fraud_score'] += 0.3
        
        # Normalize outlier scores and add to fraud score
        if 'outlier_score' in df.columns:
            min_score = df['outlier_score'].min()
            max_score = df['outlier_score'].max()
            if max_score > min_score:
                normalized_scores = 1 - (df['outlier_score'] - min_score) / (max_score - min_score)
                df['fraud_score'] += normalized_scores * 0.2
        
        # Cap fraud score at 1.0
        df['fraud_score'] = df['fraud_score'].clip(0, 1)
        
        return df
    
    def analyze_claims(self, df: pd.DataFrame) -> Tuple[Dict[str, Any], pd.DataFrame]:
        """
        Run complete fraud analysis on claims data
        Main analysis function combining all notebook logic
        """
        logger.info(f"Starting fraud analysis on {len(df)} claims")
        
        # Run all detection methods (same sequence as notebook)
        df = self.detect_duplicates(df)
        df = self.detect_suspicious_quantities(df)
        df = self.detect_outliers(df)
        df = self.compute_fraud_score(df)
        
        # Create overall fraud flag
        df['fraud_suspected'] = (
            df.get('duplicate_flag', False) | 
            df.get('suspicious_qty_flag', False) | 
            df.get('outlier_flag', False)
        )
        
        # Generate summary statistics (same as notebook output)
        total_claims = len(df)
        fraud_claims = df['fraud_suspected'].sum()
        duplicate_claims = df.get('duplicate_flag', pd.Series([False])).sum()
        suspicious_qty_claims = df.get('suspicious_qty_flag', pd.Series([False])).sum()
        outlier_claims = df.get('outlier_flag', pd.Series([False])).sum()
        
        total_fraud_amount = df[df['fraud_suspected']]['gross_claim_amount'].sum() if 'gross_claim_amount' in df.columns else 0
        avg_fraud_score = df['fraud_score'].mean()
        
        summary = {
            'total_claims': int(total_claims),
            'fraud_claims': int(fraud_claims),
            'fraud_rate': round(fraud_claims / total_claims * 100, 2) if total_claims > 0 else 0,
            'duplicate_claims': int(duplicate_claims),
            'suspicious_qty_claims': int(suspicious_qty_claims),
            'outlier_claims': int(outlier_claims),
            'total_fraud_amount': float(total_fraud_amount),
            'avg_fraud_score': round(float(avg_fraud_score), 3),
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Fraud analysis complete: {fraud_claims}/{total_claims} claims flagged ({summary['fraud_rate']}%)")
        
        return summary, df
    
    def get_top_risky_members(self, df: pd.DataFrame, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top risky members by fraud flags (from notebook cell [5])"""
        if 'member_id' not in df.columns or 'fraud_suspected' not in df.columns:
            return []
        
        member_stats = df[df['fraud_suspected']].groupby('member_id').agg({
            'fraud_score': 'mean',
            'fraud_suspected': 'sum',
            'gross_claim_amount': 'sum' if 'gross_claim_amount' in df.columns else 'count'
        }).sort_values(['fraud_suspected', 'fraud_score'], ascending=[False, False]).head(limit)
        
        result = []
        for member_id, row in member_stats.iterrows():
            result.append({
                'member_id': str(member_id),
                'fraud_claims': int(row['fraud_suspected']),
                'avg_fraud_score': round(float(row['fraud_score']), 3),
                'total_amount': float(row['gross_claim_amount']) if 'gross_claim_amount' in df.columns else 0
            })
        
        return result
    
    def get_top_risky_providers(self, df: pd.DataFrame, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top risky providers by fraud flags (from notebook cell [5])"""
        if 'provider_treat_code' not in df.columns or 'fraud_suspected' not in df.columns:
            return []
        
        provider_stats = df[df['fraud_suspected']].groupby('provider_treat_code').agg({
            'fraud_score': 'mean',
            'fraud_suspected': 'sum',
            'gross_claim_amount': 'sum' if 'gross_claim_amount' in df.columns else 'count'
        }).sort_values(['fraud_suspected', 'fraud_score'], ascending=[False, False]).head(limit)
        
        result = []
        for provider_code, row in provider_stats.iterrows():
            result.append({
                'provider_code': str(provider_code),
                'fraud_claims': int(row['fraud_suspected']),
                'avg_fraud_score': round(float(row['fraud_score']), 3),
                'total_amount': float(row['gross_claim_amount']) if 'gross_claim_amount' in df.columns else 0
            })
        
        return result
    
    def get_fraud_cases(self, df: pd.DataFrame, min_score: float = 0.3, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get detailed fraud cases for review
        """
        if 'fraud_suspected' not in df.columns:
            return []
        
        # Filter fraud cases
        fraud_df = df[df['fraud_suspected'] & (df['fraud_score'] >= min_score)].copy()
        fraud_df = fraud_df.sort_values('fraud_score', ascending=False).head(limit)
        
        cases = []
        for _, row in fraud_df.iterrows():
            # Determine fraud reasons
            reasons = []
            if row.get('duplicate_flag', False):
                reasons.append('Duplicate claim detected')
            if row.get('suspicious_qty_flag', False):
                reasons.append('Suspicious quantity for service category')
            if row.get('outlier_flag', False):
                reasons.append('Statistical outlier pattern')
            
            case = {
                'claim_id': str(row.get('id', '')),
                'member_id': str(row.get('member_id', '')),
                'patient_name': str(row.get('patient_name', '')),
                'service_date': str(row.get('service_date', '')),
                'provider_code': str(row.get('provider_treat_code', '')),
                'treating_physician': str(row.get('treating_physician', '')),
                'invoice_no': str(row.get('invoice_no', '')),
                'gross_claim_amount': float(row.get('gross_claim_amount', 0)),
                'quantity': int(row.get('quantity', 0)),
                'service_category': str(row.get('service_category', '')),
                'specialty_name': str(row.get('specialty_name', '')),
                'primary_diag_code': str(row.get('primary_diag_code', '')),
                'fraud_score': round(float(row['fraud_score']), 3),
                'fraud_reasons': reasons,
                'recommended_action': self._get_recommended_action(row['fraud_score'], reasons)
            }
            cases.append(case)
        
        return cases
    
    def _get_recommended_action(self, fraud_score: float, reasons: List[str]) -> str:
        """Get recommended action based on fraud score and reasons"""
        if fraud_score >= 0.7:
            return "High Priority: Immediate manual review and potential claim suspension"
        elif fraud_score >= 0.5:
            return "Medium Priority: Schedule audit within 48 hours"
        elif "Duplicate claim detected" in reasons:
            return "Verify if legitimate resubmission or process duplicate"
        elif "Suspicious quantity" in reasons:
            return "Review medical necessity and provider billing patterns"
        else:
            return "Low Priority: Include in routine audit cycle"
