"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import AnalysisResult from "@/components/AnalysisResult";
import { analyzePlantDisease, fileToBase64 } from "@/lib/api/analysis";
import { saveAnalysisToHistory } from "@/lib/supabase/analyses";
import { supabase } from "@/lib/supabase/client";
import type { AnalysisResponse } from "@/types";
import { Sparkles, Leaf, Zap } from "lucide-react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setAnalysis(null);
    setError(null);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert image to Base64
      const imageBase64 = await fileToBase64(selectedImage);

      // Send to n8n webhook
      const result = await analyzePlantDisease(imageBase64);

      setAnalysis(result);

      // Save to Supabase if user is authenticated
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await saveAnalysisToHistory(user.id, result, imageBase64);
        }
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        // Don't show error to user if DB save fails
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Görsel analiz edilirken bir hata oluştu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Leaf className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                AI Destekli Bitki Hastalığı Tanıma
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Bitki yaprağınızın fotoğrafını yükleyin ve anında AI destekli
                tanı ile tedavi önerileri alın
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Anında Analiz
                </h3>
                <p className="text-gray-600">
                  Gelişmiş AI teknolojimiz ile saniyeler içinde sonuç alın
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Doğru Tanı
                </h3>
                <p className="text-gray-600">
                  Detaylı içgörülerle yüksek güvenilirlikte hastalık tespiti
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Leaf className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Uzman Önerileri
                </h3>
                <p className="text-gray-600">
                  Bitkinize özel tedavi ve önleme tavsiyeleri
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Bitki Görselinizi Yükleyin
            </h2>

            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onRemoveImage={handleRemoveImage}
            />

            {selectedImage && !isLoading && !analysis && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleAnalyze}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Bitki Hastalığını Analiz Et
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            <AnalysisResult analysis={analysis} isLoading={isLoading} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

