import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import type { AnalysisResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Görsel verisi bulunamadı" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      // Return mock data if webhook URL is not configured
      return NextResponse.json(getMockAnalysisResponse());
    }

    try {
      const response = await axios.post<any>(webhookUrl, {
        image: image,
      });

      // Validate and normalize the response from n8n
      const normalizedResponse = normalizeAnalysisResponse(response.data);

      return NextResponse.json(normalizedResponse);
    } catch (error: any) {
      // Check if it's a 404 error (webhook not found or workflow not active)
      if (error.response?.status === 404) {
        console.warn(
          "⚠️ n8n webhook bulunamadı veya workflow aktif değil. Mock veri kullanılıyor."
        );
        console.warn(
          "💡 n8n'de workflow'un aktif olduğundan ve webhook URL'inin doğru olduğundan emin olun."
        );
      } else {
        console.error("n8n webhook hatası:", error.message || error);
      }
      // Fallback to mock data on error
      return NextResponse.json(getMockAnalysisResponse());
    }
  } catch (error) {
    console.error("API route hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}

/**
 * Normalizes the response from n8n to match our expected format
 */
function normalizeAnalysisResponse(data: any): AnalysisResponse {
  // If data is already in the correct format, return it
  if (
    data &&
    typeof data.diseaseName === "string" &&
    Array.isArray(data.treatmentRecommendations) &&
    Array.isArray(data.preventiveAdvice)
  ) {
    return {
      diseaseName: data.diseaseName,
      confidenceScore: typeof data.confidenceScore === "number" ? data.confidenceScore : 0,
      treatmentRecommendations: data.treatmentRecommendations,
      preventiveAdvice: data.preventiveAdvice,
      severityPercentage: typeof data.severityPercentage === "number" ? data.severityPercentage : undefined,
      yieldLossRisk: typeof data.yieldLossRisk === "number" ? data.yieldLossRisk : undefined,
    };
  }

  // If data has different field names, try to map them
  // Common variations from n8n responses
  const diseaseName =
    data?.diseaseName ||
    data?.disease_name ||
    data?.disease ||
    data?.name ||
    "Bilinmeyen Hastalık";

  // Handle confidence - can be number, string with %, or string without %
  let confidenceScore = 0;
  if (typeof data?.confidenceScore === "number") {
    confidenceScore = data.confidenceScore;
  } else if (typeof data?.confidence_score === "number") {
    confidenceScore = data.confidence_score;
  } else if (typeof data?.confidence === "number") {
    confidenceScore = data.confidence;
  } else if (typeof data?.confidence === "string") {
    // Handle string format like "%95" or "95"
    const confidenceStr = data.confidence.replace("%", "").trim();
    const confidenceNum = parseFloat(confidenceStr);
    if (!isNaN(confidenceNum)) {
      // If it's a percentage (0-100), convert to decimal (0-1)
      confidenceScore = confidenceNum > 1 ? confidenceNum / 100 : confidenceNum;
    }
  }

  // Handle treatment - can be array or string
  let treatmentRecommendations: string[] = [];
  if (Array.isArray(data?.treatmentRecommendations)) {
    treatmentRecommendations = data.treatmentRecommendations;
  } else if (Array.isArray(data?.treatment_recommendations)) {
    treatmentRecommendations = data.treatment_recommendations;
  } else if (Array.isArray(data?.treatment)) {
    treatmentRecommendations = data.treatment;
  } else if (Array.isArray(data?.recommendations)) {
    treatmentRecommendations = data.recommendations;
  } else if (typeof data?.treatment === "string" && data.treatment.trim()) {
    // If treatment is a single string, split it intelligently
    const treatmentStr = data.treatment.trim();
    
    // First try splitting by common separators (comma, period, etc.)
    // Look for patterns like "gibi", "tavsiye edilir", "uygulanması" etc.
    if (treatmentStr.includes(",") || treatmentStr.includes(".") || treatmentStr.includes(";")) {
      // Split by commas, periods, or semicolons, but keep meaningful sentences
      treatmentRecommendations = treatmentStr
        .split(/(?<=[.!?])\s+|,\s*(?=[A-ZÇĞİÖŞÜ])|;\s*/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 10); // Filter out very short fragments
      
      // If splitting didn't work well, try splitting by "gibi" or "tavsiye"
      if (treatmentRecommendations.length === 0 || treatmentRecommendations.length === 1) {
        treatmentRecommendations = treatmentStr
          .split(/(?=\w+\s+gibi|tavsiye|önerilen|uygulanması)/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 10);
      }
    } else {
      // If no clear separators, just use the whole string as one recommendation
      treatmentRecommendations = [treatmentStr];
    }
  } else if (typeof data?.treatment_recommendations === "string" && data.treatment_recommendations.trim()) {
    const treatmentStr = data.treatment_recommendations.trim();
    if (treatmentStr.includes(",") || treatmentStr.includes(".") || treatmentStr.includes(";")) {
      treatmentRecommendations = treatmentStr
        .split(/(?<=[.!?])\s+|,\s*(?=[A-ZÇĞİÖŞÜ])|;\s*/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 10);
    } else {
      treatmentRecommendations = [treatmentStr];
    }
  }

  // Handle preventive advice - can be array or string (description field)
  let preventiveAdvice: string[] = [];
  if (Array.isArray(data?.preventiveAdvice)) {
    preventiveAdvice = data.preventiveAdvice;
  } else if (Array.isArray(data?.preventive_advice)) {
    preventiveAdvice = data.preventive_advice;
  } else if (Array.isArray(data?.prevention)) {
    preventiveAdvice = data.prevention;
  } else if (Array.isArray(data?.advice)) {
    preventiveAdvice = data.advice;
  } else if (typeof data?.description === "string" && data.description.trim()) {
    // Use description as preventive advice, split into sentences
    preventiveAdvice = data.description
      .split(/[.!?]\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  } else if (typeof data?.preventive_advice === "string" && data.preventive_advice.trim()) {
    preventiveAdvice = data.preventive_advice
      .split(/[.!?]\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }

  // Handle severity percentage (hasar yüzdesi)
  let severityPercentage: number | undefined = undefined;
  if (typeof data?.severityPercentage === "number") {
    severityPercentage = data.severityPercentage;
  } else if (typeof data?.severity_percentage === "number") {
    severityPercentage = data.severity_percentage;
  } else if (typeof data?.severity === "number") {
    severityPercentage = data.severity;
  } else if (typeof data?.severity_percentage === "string") {
    const severityStr = data.severity_percentage.replace("%", "").trim();
    const severityNum = parseFloat(severityStr);
    if (!isNaN(severityNum)) {
      severityPercentage = severityNum > 100 ? severityNum / 100 * 100 : severityNum;
    }
  }

  // Handle yield loss risk (verim kaybı riski)
  let yieldLossRisk: number | undefined = undefined;
  if (typeof data?.yieldLossRisk === "number") {
    yieldLossRisk = data.yieldLossRisk;
  } else if (typeof data?.yield_loss_risk === "number") {
    yieldLossRisk = data.yield_loss_risk;
  } else if (typeof data?.yield_loss === "number") {
    yieldLossRisk = data.yield_loss;
  } else if (typeof data?.yieldLossRisk === "string") {
    const yieldStr = data.yieldLossRisk.replace("%", "").trim();
    const yieldNum = parseFloat(yieldStr);
    if (!isNaN(yieldNum)) {
      yieldLossRisk = yieldNum > 100 ? yieldNum / 100 * 100 : yieldNum;
    }
  } else if (typeof data?.yield_loss_risk === "string") {
    const yieldStr = data.yield_loss_risk.replace("%", "").trim();
    const yieldNum = parseFloat(yieldStr);
    if (!isNaN(yieldNum)) {
      yieldLossRisk = yieldNum > 100 ? yieldNum / 100 * 100 : yieldNum;
    }
  }

  return {
    diseaseName,
    confidenceScore,
    treatmentRecommendations,
    preventiveAdvice,
    severityPercentage,
    yieldLossRisk,
  };
}

/**
 * Mock analysis response for testing
 */
function getMockAnalysisResponse(): AnalysisResponse {
  return {
    diseaseName: "Yaprak Lekesi Hastalığı",
    confidenceScore: 0.87,
    treatmentRecommendations: [
      "Enfekteli yaprakları derhal çıkarın ve yok edin",
      "Bakır veya klorotalonil içeren mantar ilacı uygulayın",
      "Bitki etrafında hava sirkülasyonunu iyileştirin",
      "Yaprakları ıslatmamak için bitkinin tabanından sulayın",
    ],
    preventiveAdvice: [
      "Bitkiler arasında uygun mesafe bırakın",
      "Yaprakların kuruması için sabah erken saatlerde sulayın",
      "Mümkün olduğunda hastalığa dayanıklı bitki çeşitleri kullanın",
      "Aletleri temizleyerek iyi bahçe hijyeni sağlayın",
    ],
    severityPercentage: 65, // %65 hasar
    yieldLossRisk: 45, // %45 verim kaybı riski
  };
}

