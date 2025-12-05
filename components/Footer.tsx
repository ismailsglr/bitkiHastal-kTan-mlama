"use client";

import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="text-gray-700 font-medium">
              AI Destekli Bitki Hastalığı Tanıma
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

