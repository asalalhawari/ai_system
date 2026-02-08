import {
  AIFraudOverviewResponse,
  AIFraudCasesResponse,
  DashboardOverviewResponse,
  SpecialtyAnalysis,
  ProviderAnalysis
} from '../types/dashboard';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

class ApiService {
  private async fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // AI Fraud: Overview
  async getAIFraudOverview(limit: number = 1000): Promise<AIFraudOverviewResponse> {
    const url = `${API_BASE_URL}/api/fraud/ai-overview?limit=${limit}`;
    return this.fetchData<AIFraudOverviewResponse>(url);
  }

  // AI Fraud: Cases
  async getAIFraudCases(minScore: number = 0.3, limit: number = 50): Promise<AIFraudCasesResponse> {
    const url = `${API_BASE_URL}/api/fraud/ai-cases?min_score=${minScore}&limit=${limit}`;
    return this.fetchData<AIFraudCasesResponse>(url);
  }

  // Dashboard Overview
  async getDashboardOverview(): Promise<DashboardOverviewResponse> {
    const url = `${API_BASE_URL}/api/dashboard/overview`;
    return this.fetchData<DashboardOverviewResponse>(url);
  }

  // Specialties Data
  async getSpecialtiesData(limit: number = 20): Promise<SpecialtyAnalysis[]> {
    const url = `${API_BASE_URL}/api/dashboard/specialties?limit=${limit}`;
    const response = await this.fetchData<{ specialties: any[] }>(url);

    return response.specialties.map(specialty => ({
      name: specialty.name,
      claims: specialty.claims,
      totalAmount: specialty.totalAmount,
      avgAmount: specialty.avgAmount,
      percentage: specialty.percentage
    }));
  }

  // Providers Data - Following Interface Segregation Principle
  async getProvidersData(
    limit: number = 20,
    startDate?: string,
    endDate?: string
  ): Promise<ProviderAnalysis[]> {
    let url = `${API_BASE_URL}/api/dashboard/providers?limit=${limit}`;

    // Add optional date filters if provided
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    const response = await this.fetchData<{ providers: any[] }>(url);

    return response.providers.map(provider => ({
      name: provider.name,
      claims: provider.claims,
      totalAmount: provider.totalAmount,
      avgAmount: provider.avgAmount,
      percentage: provider.percentage
    }));
  }

  // File Upload
  async uploadFile(file: File): Promise<{ message: string; filename: string; records_processed: number; fraud_summary: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; database: string; ai_models: string }> {
    const url = `${API_BASE_URL}/api/health`;
    return this.fetchData<{ status: string; database: string; ai_models: string }>(url);
  }
}

export const apiService = new ApiService();
export default apiService;
