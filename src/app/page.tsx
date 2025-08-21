'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Code, Share, Zap, Edit3, Lock, Share2, Eye } from 'lucide-react';

export default function Home() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const createNewShare = () => {
    setIsCreating(true);
    // Generate a unique ID for the new share
    const shareId = Math.random().toString(36).substring(2, 15);
    router.push(`/create/${shareId}`);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">CodeShare</h1>
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
              <span className="text-blue-600"> Securely</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create code snippets with custom titles as URLs. Only you can edit with your password, others can view.
              Perfect for sharing code with colleagues, students, or clients.
            </p>
            
            <button
              onClick={createNewShare}
              disabled={isCreating}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-5 w-5" />
                  <span>Create New Code Share</span>
                </>
              )}
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Password Protected
              </h3>
              <p className="text-gray-600">
                Only you can edit your code with your secret password. Others can only view.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Title-Based URLs
              </h3>
              <p className="text-gray-600">
                Your title becomes the URL: <code className="bg-gray-100 px-1 rounded">codeshare.io/my-react-code</code>
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Syntax Highlighting
              </h3>
              <p className="text-gray-600">
                Beautiful syntax highlighting for all popular programming languages.
              </p>
            </div>
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
            <p>&copy; 2025 CodeShare. Built with Next.js and TypeScript.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
