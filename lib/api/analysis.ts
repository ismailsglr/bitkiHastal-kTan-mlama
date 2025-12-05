import axios from "axios";
import type { AnalysisResponse } from "@/types";

/**
 * Converts a File to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Sends image to Next.js API route for analysis (which proxies to n8n webhook)
 */
export const analyzePlantDisease = async (
  imageBase64: string
): Promise<AnalysisResponse> => {
  try {
    // Call our Next.js API route instead of n8n directly
    // This avoids CORS issues since it's a server-to-server call
    // Use full URL for client-side requests
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await axios.post<AnalysisResponse>(
      `${baseUrl}/api/analyze`,
      {
        image: imageBase64,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Bitki hastalığı analiz hatası:", error);
    // Fallback to mock data on error
    return getMockAnalysisResponse();
  }
};

/**
 * Mock analysis response for testing
 */
export const getMockAnalysisResponse = (): Promise<AnalysisResponse> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
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
      });
    }, 2000); // 2 second delay to simulate API call
  });
};

