export interface AnalysisResponse {
  diseaseName: string;
  confidenceScore: number;
  treatmentRecommendations: string[];
  preventiveAdvice: string[];
  severityPercentage?: number; // Hasar yüzdesi (0-100)
  yieldLossRisk?: number; // Verim kaybı riski (0-100)
}

export interface AnalysisHistory {
  id: string;
  user_id: string;
  image_url?: string;
  disease_name: string;
  confidence_score: number;
  treatment_recommendations: string[];
  preventive_advice: string[];
  severity_percentage?: number;
  yield_loss_risk?: number;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
}

