'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, ArrowLeft, Lock, Eye, EyeOff, Share2, FileText, AlertCircle, Copy, Check } from 'lucide-react';
import Footer from '@/components/Footer';

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareId = Array.isArray(params.id) ? params.id[0] : params.id;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size must be 10MB or less');
      return;
    }

    setFile(selectedFile);
    setError('');
    
    // Do not auto-fill title. Require user to enter it.
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (!droppedFile) return;

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (droppedFile.size > maxSize) {
      setError('File size must be 10MB or less');
      return;
    }

    setFile(droppedFile);
    setError('');
    
    // Do not auto-fill title. Require user to enter it.
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    let finalTitle = title.trim();
    if (!finalTitle) {
      // Generate a random code if no title entered
      finalTitle = Math.random().toString(36).substring(2, 10);
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:type;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: shareId,
          title: finalTitle,
          description: description.trim(),
          password,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          content: base64,
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Show share link and copy button
      const data = await response.json();
      if (data && data.title) {
        setShareUrl(`/${data.title}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="p-2 bg-green-600 rounded-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EasyShares</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-green-600" />
              <span>Share a File</span>
            </h2>

            {/* Auto-deletion notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Auto-Deletion Notice</span>
              </div>
              <p className="text-amber-700 mt-1 text-sm">
                Files are automatically deleted after <strong>3 days</strong> for security and storage management.
              </p>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File (Max 10MB) *
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {file ? (
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg text-gray-600 mb-2">
                      Drop a file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional - becomes your URL)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., my-project-files"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-black"
              />
              {title && (
                <p className="mt-2 text-sm text-blue-600 font-medium">
                  Your file will be available at: <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    /{title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
                  </code>
                </p>
              )}
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your file..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-black placeholder-black"
                style={{ color: 'black' }}
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password (optional - for editing/deleting only)
              </label>
              <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-black flex items-center space-x-1">
                <Lock className="h-4 w-4" />
                <span>Only you can edit with this password. Others can only download.</span>
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            {!shareUrl ? (
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" />
                    <span>Upload & Share</span>
                  </>
                )}
              </button>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-green-700 font-semibold mb-2">File uploaded successfully!</p>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={window.location.origin + shareUrl}
                    readOnly
                    className="font-mono px-2 py-1 border border-gray-300 rounded bg-gray-50 text-blue-700 text-base w-2/3"
                    style={{ cursor: 'pointer' }}
                    onClick={async (e) => {
                      e.currentTarget.select();
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const textToCopy = (typeof window !== 'undefined' ? window.location.origin : '') + shareUrl;
                      let success = false;
                      try {
                        if (
                          typeof window !== 'undefined' &&
                          typeof navigator !== 'undefined' &&
                          navigator.clipboard &&
                          typeof navigator.clipboard.writeText === 'function'
                        ) {
                          await navigator.clipboard.writeText(textToCopy);
                          success = true;
                        } else if (typeof window !== 'undefined') {
                          // Fallback for older browsers
                          const input = document.createElement('input');
                          input.value = textToCopy;
                          document.body.appendChild(input);
                          input.select();
                          document.execCommand('copy');
                          document.body.removeChild(input);
                          success = true;
                        }
                      } catch {
                        success = false;
                      }
                      setCopied(success);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
