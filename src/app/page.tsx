"use client";
import Footer from '@/components/Footer';

import { Shield, Code, Edit3, Lock, Share2, Eye, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [navigating, setNavigating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 font-sans text-neutral-100">
      {/* Minimal Background Accent */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 opacity-30 blur-xl pointer-events-none z-0" />
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm relative z-10 animate-fade-in-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-blue-300">EasyShares</h1>
            </Link>
            <div className="text-sm text-neutral-400">
              Share code snippets securely
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16 flex flex-col items-center justify-center animate-fade-in-up">
            <h2 className="text-5xl font-extrabold text-blue-200 mb-6 tracking-tight font-display animate-gradient-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Easy<span className="inline-block text-blue-400 animate-bounce">Shares</span>
            </h2>
            <p className="text-lg text-neutral-300 mb-8 font-light animate-fade-in">
              Simple, secure & beautiful code sharing for everyone.
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
                  if (typeof window !== 'undefined') {
                    window.location.assign(target);
                  }
                  setTimeout(() => setNavigating(false), 3000);
                }}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  if (typeof window !== 'undefined') {
                    window.location.assign(target);
                  }
                  setTimeout(() => setNavigating(false), 3000);
                }}
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400"
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
            <div className="p-6 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up delay-100">
              <div className="p-3 bg-green-900 rounded-lg w-fit mx-auto mb-4">
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-blue-200 mb-2">
                Password Protected
              </h3>
              <p className="text-neutral-300 text-sm">
                Only you can edit your code with your secret password. Others can only view.
              </p>
            </div>
            <div className="p-6 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up delay-200">
              <div className="p-3 bg-blue-900 rounded-lg w-fit mx-auto mb-4">
                <Share2 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-blue-200 mb-2">
                Custom URLs
              </h3>
              <p className="text-neutral-300 text-sm">
                Your title becomes the URL. Easy to remember and share.
              </p>
            </div>
            <div className="p-6 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up delay-300">
              <div className="p-3 bg-purple-900 rounded-lg w-fit mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-blue-200 mb-2">
                Syntax Highlighting
              </h3>
              <p className="text-neutral-300 text-sm">
                Beautiful syntax highlighting for all popular programming languages.
              </p>
            </div>
            <div className="p-6 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up delay-400">
              <div className="p-3 bg-pink-900 rounded-lg w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-blue-200 mb-2">
                File Sharing
              </h3>
              <p className="text-neutral-300 text-sm">
                Share files up to 10MB. Auto-deleted after 3 days for security.
              </p>
            </div>
          </div>

          {/* Auto-deletion notice */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 text-blue-300">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Auto-Deletion Policy</span>
            </div>
            <p className="text-neutral-300 mt-2 text-sm">
              Code shares are automatically deleted after <strong>14 days</strong> and files after <strong>3 days</strong> for security and storage management.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-neutral-900 rounded-2xl p-8 shadow-sm border border-neutral-800">
            <h3 className="text-2xl font-bold text-blue-200 mb-8">How it works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold text-blue-200 mb-2">Create</h4>
                <p className="text-neutral-300">Write your code and set a title that becomes your URL</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold text-blue-200 mb-2">Share</h4>
                <p className="text-neutral-300">Copy the link and share it with anyone</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold text-blue-200 mb-2">Collaborate</h4>
                <p className="text-neutral-300">Others can view, you can edit with your password</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
