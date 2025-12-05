"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase/client";
import { getAnalysisHistory } from "@/lib/supabase/analyses";
import type { AnalysisHistory } from "@/types";
import { Calendar, TrendingUp, Leaf } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);

        if (currentUser) {
          const analyses = await getAnalysisHistory(currentUser.id);
          setHistory(analyses);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getAnalysisHistory(session.user.id).then(setHistory);
      } else {
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Geçmiş yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md mx-auto px-4">
            <Leaf className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Geçmişi görüntülemek için giriş yapın
            </h2>
            <p className="text-gray-600 mb-6">
              Analiz geçmişinizi görmek için lütfen giriş yapın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Giriş Yap
              </button>
              <Link
                href="/"
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors text-center"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Analiz Geçmişi
          </h1>

          {history.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz analiz geçmişi yok
              </h2>
              <p className="text-gray-600 mb-6">
                Geçmişinizi burada görmek için bitki görsellerini analiz etmeye başlayın.
              </p>
              <Link
                href="/"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Bitki Analiz Et
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {item.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt="Bitki analizi"
                          className="w-full md:w-48 h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.disease_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold text-gray-700">
                            {Math.round(item.confidence_score * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(item.created_at).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Tedavi Önerileri:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {item.treatment_recommendations.map(
                              (rec, index) => (
                                <li key={index}>{rec}</li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Önleyici Tavsiyeler:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {item.preventive_advice.map((advice, index) => (
                              <li key={index}>{advice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

