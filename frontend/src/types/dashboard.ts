// AI Fraud Detection Types
export interface AIFraudOverviewResponse {
  total_claims: number;
  fraud_claims: number;
  fraud_rate: number;
  duplicate_claims: number;
  suspicious_qty_claims: number;
  outlier_claims: number;
  total_fraud_amount: number;
  avg_fraud_score: number;
  analysis_timestamp: string;
  top_risky_members: RiskyEntity[];
  top_risky_providers: RiskyEntity[];
}

export interface RiskyEntity {
  member_id?: string;
  provider_code?: string;
  fraud_claims: number;
  avg_fraud_score: number;
  total_amount: number;
}

export interface FraudCase {
  claim_id: string;
  member_id: string;
  patient_name: string;
  service_date: string;
  provider_code: string;
  treating_physician: string;
  invoice_no: string;
  gross_claim_amount: number;
  quantity: number;
  service_category: string;
  specialty_name: string;
  primary_diag_code: string;
  fraud_score: number;
  fraud_reasons: string[];
  recommended_action: string;
}

export interface AIFraudCasesResponse {
  fraud_cases: FraudCase[];
  total_analyzed: number;
  total_flagged: number;
  min_score_filter: number;
}

// Dashboard Types
export interface DashboardOverviewResponse {
  totalClaims: number;
  totalAmount: number;
  avgAmount: number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  topSpecialty: {
    name: string;
    claimCount: number;
  };
}

export interface SpecialtyAnalysis {
  name: string;
  claims: number;
  totalAmount: number;
  avgAmount: number;
  percentage: number;
}

// Provider Analysis Types - Following Single Responsibility Principle
export interface ProviderAnalysis {
  name: string;
  claims: number;
  totalAmount: number;
  avgAmount: number;
  percentage: number;
}

export interface ProviderAnalysisResponse {
  providers: ProviderAnalysis[];
}
