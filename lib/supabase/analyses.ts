import { supabase } from "./client";
import type { AnalysisHistory, AnalysisResponse } from "@/types";

/**
 * Save analysis result to Supabase
 */
export const saveAnalysisToHistory = async (
  userId: string,
  analysis: AnalysisResponse,
  imageBase64?: string
): Promise<AnalysisHistory | null> => {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        disease_name: analysis.diseaseName,
        confidence_score: analysis.confidenceScore,
        treatment_recommendations: analysis.treatmentRecommendations,
        preventive_advice: analysis.preventiveAdvice,
        severity_percentage: analysis.severityPercentage ?? null,
        yield_loss_risk: analysis.yieldLossRisk ?? null,
        image_url: imageBase64
          ? `data:image/jpeg;base64,${imageBase64}`
          : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving analysis:", error);
      return null;
    }

    return data as AnalysisHistory;
  } catch (error) {
    console.error("Error saving analysis:", error);
    return null;
  }
};

/**
 * Get analysis history for a user
 */
export const getAnalysisHistory = async (
  userId: string
): Promise<AnalysisHistory[]> => {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analysis history:", error);
      return [];
    }

    return (data as AnalysisHistory[]) || [];
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    return [];
  }
};

