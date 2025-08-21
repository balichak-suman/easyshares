'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Copy, Edit3, Eye, Code, Lock, Check, AlertTriangle, Download, FileText, Trash2, Calendar, User } from 'lucide-react';

interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: string;
  expiresAt: string;
}

interface FileShare {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  expiresAt: string;
}

type ShareType = 'code' | 'file' | null;

export default function UnifiedSharePage() {
  const [codeShare, setCodeShare] = useState<CodeShare | null>(null);
  const [fileShare, setFileShare] = useState<FileShare | null>(null);
  const [shareType, setShareType] = useState<ShareType>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [editCode, setEditCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const params = useParams();
  const shareTitle = params.title as string;

  useEffect(() => {
    fetchShare();
  }, [shareTitle]);

  const fetchShare = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First try to get as a code share
      let response = await fetch(`/api/codeshare?title=${encodeURIComponent(shareTitle)}`);
      
      if (response.ok) {
        const data = await response.json();
        setCodeShare(data);
        setEditCode(data.code);
        setShareType('code');
        return;
      }
      
      // If not found as code share, try as file share
      response = await fetch(`/api/files?title=${encodeURIComponent(shareTitle)}`);
      
      if (response.ok) {
        const data = await response.json();
        setFileShare(data);
        setShareType('file');
        return;
      }
      
      // If neither found
      if (response.status === 404) {
        setError('Share not found or has expired');
      } else {
        setError('Failed to load share');
      }
    } catch (err) {
      setError('Failed to load share');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (shareType === 'code' && codeShare) {
        await navigator.clipboard.writeText(codeShare.code);
      } else if (shareType === 'file' && fileShare) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setAuthError('');
  };

  const handleSave = async () => {
    if (!password.trim()) {
      setAuthError('Password is required');
      return;
    }

    setSaving(true);
    setAuthError('');

    try {
      const response = await fetch('/api/codeshare', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareTitle,
          code: editCode,
          password,
        }),
      });

      if (response.ok) {
        const updatedShare = await response.json();
        setCodeShare(updatedShare);
        setIsEditing(false);
        setPassword('');
      } else if (response.status === 401) {
        setAuthError('Invalid password');
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || 'Failed to save changes');
      }
    } catch (err) {
      setAuthError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPassword('');
    setAuthError('');
    if (codeShare) {
      setEditCode(codeShare.code);
    }
  };

  const handleDownload = async () => {
    if (!password.trim()) {
      setAuthError('Password is required to download');
      return;
    }

    setDownloading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareTitle,
          password,
          action: 'download',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert base64 to blob and download
        const byteCharacters = atob(data.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setPassword('');
      } else if (response.status === 401) {
        setAuthError('Invalid password');
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || 'Download failed');
      }
    } catch (err) {
      setAuthError('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!password.trim()) {
      setAuthError('Password is required to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this share? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setAuthError('');

    try {
      const endpoint = shareType === 'code' ? '/api/codeshare' : '/api/files';
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareTitle,
          password,
        }),
      });

      if (response.ok) {
        // Redirect to home page
        window.location.href = '/';
      } else if (response.status === 401) {
        setAuthError('Invalid password');
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || 'Delete failed');
      }
    } catch (err) {
      setAuthError('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading share...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Code className="h-5 w-5" />
            <span>Create New Share</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${shareType === 'file' ? 'bg-green-600' : 'bg-blue-600'}`}>
                {shareType === 'file' ? (
                  <FileText className="h-6 w-6 text-white" />
                ) : (
                  <Code className="h-6 w-6 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ShareIt</h1>
            </Link>
            <div className="flex items-center space-x-4">
              {/* Expiry Warning */}
              {(codeShare || fileShare) && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  getDaysUntilExpiry((codeShare || fileShare)!.expiresAt) <= 1
                    ? 'bg-red-100 text-red-700'
                    : getDaysUntilExpiry((codeShare || fileShare)!.expiresAt) <= 3
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {getDaysUntilExpiry((codeShare || fileShare)!.expiresAt) > 0
                    ? `${getDaysUntilExpiry((codeShare || fileShare)!.expiresAt)} days left`
                    : 'Expires today'
                  }
                </div>
              )}
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : shareType === 'file' ? 'Copy Link' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {shareType === 'code' && codeShare && (
          <div className="max-w-6xl mx-auto">
            {/* Code Share Header */}
            <div className="bg-white rounded-t-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{codeShare.title}</h2>
                  <p className="text-gray-600 mt-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Created {formatDate(codeShare.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Input for Editing */}
              {isEditing && (
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password to edit"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {authError && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <Lock className="h-4 w-4" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-b-xl border-l border-r border-b border-gray-200">
              <Editor
                height="500px"
                language={codeShare.language}
                value={isEditing ? editCode : codeShare.code}
                onChange={(value) => isEditing && setEditCode(value || '')}
                options={{
                  readOnly: !isEditing,
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
                theme="vs-light"
              />
            </div>
          </div>
        )}

        {shareType === 'file' && fileShare && (
          <div className="max-w-2xl mx-auto">
            {/* File Share Display */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{fileShare.fileName}</h2>
                {fileShare.description && (
                  <p className="text-gray-600 mb-4">{fileShare.description}</p>
                )}
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-6">
                  <span>{formatFileSize(fileShare.fileSize)}</span>
                  <span>•</span>
                  <span>Created {formatDate(fileShare.createdAt)}</span>
                </div>
              </div>

              {/* Password Input for File Actions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter password to download or delete:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {authError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                    <Lock className="h-4 w-4" />
                    <span>{authError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading || !password.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Download File</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={deleting || !password.trim()}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Only the original uploader can download or delete this file.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
