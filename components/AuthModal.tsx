"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { X, Mail, Lock, User } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Check if it's an email confirmation error
          if (error.message.includes("email") && error.message.includes("confirm")) {
            setNeedsEmailConfirmation(true);
            setError(
              "E-posta adresiniz henüz onaylanmamış. Lütfen e-posta kutunuzu kontrol edin ve onay linkine tıklayın."
            );
          } else {
            throw error;
          }
          return;
        }

        setMessage("Giriş başarılı!");
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1000);
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setNeedsEmailConfirmation(true);
          setMessage(
            "Kayıt başarılı! E-posta adresinize gönderilen onay linkine tıklayarak hesabınızı aktifleştirin."
          );
        } else {
          setMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
          setTimeout(() => {
            setIsLogin(true);
            resetForm();
          }, 2000);
        }
      }
    } catch (err: any) {
      // Better error messages
      let errorMessage = err.message || "Bir hata oluştu";
      
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "E-posta veya şifre hatalı. Lütfen tekrar deneyin.";
      } else if (errorMessage.includes("email") && errorMessage.includes("confirm")) {
        setNeedsEmailConfirmation(true);
        errorMessage = "E-posta adresiniz henüz onaylanmamış. Lütfen e-posta kutunuzu kontrol edin.";
      } else if (errorMessage.includes("already registered")) {
        errorMessage = "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
      } else if (errorMessage.includes("Password")) {
        errorMessage = "Şifre en az 6 karakter olmalıdır.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      setMessage("Onay e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.");
    } catch (err: any) {
      setError(err.message || "E-posta gönderilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
    setNeedsEmailConfirmation(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {needsEmailConfirmation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 mb-2">
                E-posta onayı gerekiyor. E-postanızı kontrol edin veya onay linkini tekrar gönderin.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isLoading || !email}
                className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              >
                Onay e-postasını tekrar gönder
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "İşleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Hesabınız yok mu? Kayıt olun"
                : "Zaten hesabınız var mı? Giriş yapın"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

