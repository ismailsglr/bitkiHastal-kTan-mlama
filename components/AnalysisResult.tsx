"use client";

import type { AnalysisResponse } from "@/types";
import { CheckCircle2, AlertCircle, Lightbulb, Shield, AlertTriangle } from "lucide-react";

interface AnalysisResultProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
}

export default function AnalysisResult({
  analysis,
  isLoading,
}: AnalysisResultProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // Safety checks for undefined arrays
  const treatmentRecommendations = analysis.treatmentRecommendations || [];
  const preventiveAdvice = analysis.preventiveAdvice || [];
  const diseaseName = analysis.diseaseName || "Bilinmeyen Hastalık";
  const confidenceScore = analysis.confidenceScore || 0;
  const severityPercentage = analysis.severityPercentage ?? null;
  const yieldLossRisk = analysis.yieldLossRisk ?? null;

  const confidencePercentage = Math.round(confidenceScore * 100);

  // Risk seviyesi belirleme (0-100 arası)
  const getRiskColor = (value: number) => {
    if (value >= 70) return "bg-red-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskLabel = (value: number) => {
    if (value >= 70) return "Yüksek Risk";
    if (value >= 40) return "Orta Risk";
    return "Düşük Risk";
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        {/* Disease Name and Confidence */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {diseaseName}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Güven:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        confidencePercentage >= 70
                          ? "bg-primary"
                          : confidencePercentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${confidencePercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {confidencePercentage}%
                  </span>
                </div>
              </div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0" />
          </div>
        </div>

        {/* Hasar Tespiti ve Verim Tahmini */}
        {(severityPercentage !== null || yieldLossRisk !== null) && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900">
                Hasar Tespiti ve Verim Tahmini
              </h3>
            </div>
            
            <div className="space-y-4">
              {severityPercentage !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tahmini Hasar Oranı
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(severityPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${getRiskColor(severityPercentage)}`}
                      style={{ width: `${Math.min(severityPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRiskLabel(severityPercentage)}
                  </p>
                </div>
              )}

              {yieldLossRisk !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tedavi Edilmezse Verim Kaybı Riski
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(yieldLossRisk)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${getRiskColor(yieldLossRisk)}`}
                      style={{ width: `${Math.min(yieldLossRisk, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRiskLabel(yieldLossRisk)} - {yieldLossRisk >= 70 ? "Acil müdahale gerekli!" : yieldLossRisk >= 40 ? "Tedavi önerilir" : "Düşük risk seviyesi"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treatment Recommendations */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              Tedavi Önerileri
            </h3>
          </div>
          <ul className="space-y-3">
            {treatmentRecommendations.length > 0 ? (
              treatmentRecommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 text-gray-700"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1">{recommendation}</span>
              </li>
              ))
            ) : (
              <li className="text-gray-500 italic">Tedavi önerisi bulunamadı</li>
            )}
          </ul>
        </div>

        {/* Preventive Advice */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-gray-900">
              Önleyici Tavsiyeler
            </h3>
          </div>
          <ul className="space-y-3">
            {preventiveAdvice.length > 0 ? (
              preventiveAdvice.map((advice, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 text-gray-700"
              >
                <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{advice}</span>
              </li>
              ))
            ) : (
              <li className="text-gray-500 italic">Önleyici tavsiye bulunamadı</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

