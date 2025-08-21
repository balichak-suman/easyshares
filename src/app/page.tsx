'use client';

import { useRouter } from 'next/navigation';
import { Shield, Code, Share, Zap, Edit3, Lock, Share2, Eye, FileText, Upload } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ShareIt</h1>
            </div>
            <div className="text-sm text-gray-600">
              Share code snippets securely
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Share Code
              <span className="text-blue-600"> Instantly</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create beautiful code snippets with custom URLs or share files up to 10MB. 
              Password-protected editing, public viewing. Perfect for tutorials, collaboration, and showcasing your work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                type="button"
                disabled={navigating}
                onClick={() => {
                  if (navigating) return;
                  setNavigating(true);
                  const id = Math.random().toString(36).substring(2, 15);
                  const target = `/create/${id}`;

                  // Attempt client-side navigation, but always have a fast fallback
                  // router.push may not reject on failure, so use a timed check
                  void router.push(target);

                  // If navigation hasn't occurred after 300ms, force a full load
                  const fallback = setTimeout(() => {
                    if (typeof window !== 'undefined' && window.location.pathname !== target) {
                      window.location.assign(target);
                    }
                  }, 300);

                  // Clear fallback after 3s and reset navigating (in case of failure)
                  setTimeout(() => {
                    clearTimeout(fallback);
                    setNavigating(false);
                  }, 3000);
                }}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                {navigating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-5 w-5" />
                    <span>Share Code</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                disabled={navigating}
                onClick={() => {
                  if (navigating) return;
                  setNavigating(true);
                  const id = Math.random().toString(36).substring(2, 15);
                  const target = `/upload/${id}`;

                  void router.push(target);

                  const fallback = setTimeout(() => {
                    if (typeof window !== 'undefined' && window.location.pathname !== target) {
                      window.location.assign(target);
                    }
                  }, 300);

                  setTimeout(() => {
                    clearTimeout(fallback);
                    setNavigating(false);
                  }, 3000);
                }}
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                {navigating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Share Files</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Protected
              </h3>
              <p className="text-gray-600 text-sm">
                Only you can edit your code with your secret password. Others can only view.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom URLs
              </h3>
              <p className="text-gray-600 text-sm">
                Your title becomes the URL. Easy to remember and share.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Syntax Highlighting
              </h3>
              <p className="text-gray-600 text-sm">
                Beautiful syntax highlighting for all popular programming languages.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                File Sharing
              </h3>
              <p className="text-gray-600 text-sm">
                Share files up to 10MB. Auto-deleted after 3 days for security.
              </p>
            </div>
          </div>

          {/* Auto-deletion notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 text-amber-800">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Auto-Deletion Policy</span>
            </div>
            <p className="text-amber-700 mt-2 text-sm">
              Code shares are automatically deleted after <strong>14 days</strong> and files after <strong>3 days</strong> for security and storage management.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">How it works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Create</h4>
                <p className="text-gray-600">Write your code and set a title that becomes your URL</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Share</h4>
                <p className="text-gray-600">Copy the link and share it with anyone</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Collaborate</h4>
                <p className="text-gray-600">Others can view, you can edit with your password</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 ShareIt. Created by <span className="font-semibold text-blue-600">Balichak Suman</span></p>
            <p className="text-sm mt-1">Built with Next.js, TypeScript & Monaco Editor</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
