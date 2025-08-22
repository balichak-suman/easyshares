'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Copy, Edit3, Eye, Code, Lock, Check, AlertTriangle, Download, FileText, Trash2, Calendar, User, Save } from 'lucide-react';

interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  hasPassword?: boolean;
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
  hasPassword?: boolean;
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
      
      console.log('Fetching share for title:', shareTitle);
      
      // First try to get as a code share
      let response = await fetch(`/api/codeshare?title=${encodeURIComponent(shareTitle)}`);
      
      console.log('Code share response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Code share data:', data);
        setCodeShare(data);
        setEditCode(data.code);
        setShareType('code');
        return;
      }
      
      // If not found as code share, try as file share
      response = await fetch(`/api/files?title=${encodeURIComponent(shareTitle)}`);
      
      console.log('File share response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('File share data:', data);
        setFileShare(data);
        setShareType('file');
        return;
      }
      
      // If neither found
      console.log('Neither code nor file share found');
      if (response.status === 404) {
        setError('Share not found or has expired');
      } else {
        setError('Failed to load share');
      }
    } catch (err) {
      console.error('Error fetching share:', err);
      setError('Failed to load share');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    let success = false;
    try {
      let textToCopy = '';
      if (shareType === 'code' && codeShare) {
        textToCopy = codeShare.code;
      } else if (shareType === 'file' && fileShare) {
        textToCopy = window.location.href;
      }
      if (
        typeof window !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } else if (typeof window !== 'undefined') {
        const input = document.createElement('input');
        input.value = textToCopy;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        success = true;
      }
    } catch (err) {
      success = false;
      console.error('Failed to copy to clipboard');
    }
    setCopied(success);
    setTimeout(() => setCopied(false), 2000);
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
    if (fileShare?.hasPassword && !password.trim()) {
      setAuthError('Password is required to download this file');
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
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render code share
  if (shareType === 'code' && codeShare) {
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
                Code Share
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Share Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{codeShare.title}</h2>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {codeShare.language}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Created: {formatDate(codeShare.createdAt)}</span>
                <span>•</span>
                <span>Expires in {getDaysUntilExpiry(codeShare.expiresAt)} days</span>
              </div>
            </div>

            {/* Editor / View */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Code</h3>
                
                {!isEditing && codeShare.hasPassword && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter edit password"
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                    />
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}

                {!isEditing && !codeShare.hasPassword && (
                  <div className="text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                      <Eye className="h-4 w-4 mr-1" />
                      Public View-Only
                    </span>
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                )}
              </div>
              
              {authError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-red-700 text-sm">{authError}</p>
                </div>
              )}
              
              <div className="h-[500px]">
                <Editor
                  height="100%"
                  language={codeShare.language}
                  value={isEditing ? editCode : codeShare.code}
                  onChange={(value) => isEditing && setEditCode(value || '')}
                  theme="vs-light"
                  options={{
                    readOnly: !isEditing,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render file share
  if (shareType === 'file' && fileShare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">ShareIt</h1>
              </div>
              <div className="text-sm text-gray-600">
                File Share
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* File Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{fileShare.title}</h2>
                  {fileShare.description && (
                    <p className="text-gray-600">{fileShare.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Expires in {getDaysUntilExpiry(fileShare.expiresAt)} days
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{fileShare.fileName}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(fileShare.fileSize)}</p>
                    <p className="text-xs text-gray-400">Created: {formatDate(fileShare.createdAt)}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {fileShare.hasPassword ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                        />
                        <button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
                        >
                          {downloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span>{downloading ? 'Downloading...' : 'Download'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
                      >
                        {downloading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span>{downloading ? 'Downloading...' : 'Download'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {authError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                  <p className="text-red-700 text-sm">{authError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
