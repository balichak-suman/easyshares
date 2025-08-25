'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Copy, Edit3, Eye, Code, Check, AlertTriangle, Download, FileText, Save } from 'lucide-react';
import Link from 'next/link';
import mammoth from 'mammoth';

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
  const [editLanguage, setEditLanguage] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState('');

  const params = useParams();
  const shareTitle = params.title as string;

  const fetchShare = useCallback(async () => {
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
        setEditLanguage(data.language);
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
  }, [shareTitle]);

  useEffect(() => {
    fetchShare();
  }, [fetchShare]);

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
    } catch {
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
          language: editLanguage,
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
    } catch {
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
      setEditLanguage(codeShare.language);
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
    } catch {
      setAuthError('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async () => {
    if (!fileShare) return;

    if (fileShare.hasPassword && !password.trim()) {
      setAuthError('Password is required to view this file');
      return;
    }

    setViewing(true);
    setAuthError('');
    setPreviewError('');
    setPreviewContent(null);

    try {
      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareTitle,
          password,
          action: 'view',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const mimeType = data.mimeType;
        const byteCharacters = atob(data.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        if (mimeType.startsWith('text/')) {
          const text = await blob.text();
          setPreviewContent(`<pre style="white-space: pre-wrap; word-wrap: break-word;">${text}</pre>`);
        } else if (mimeType.startsWith('image/')) {
          const url = URL.createObjectURL(blob);
          setPreviewContent(`<img src="${url}" alt="Image preview" style="max-width: 100%; height: auto;" />`);
        } else if (mimeType === 'application/pdf') {
          const url = URL.createObjectURL(blob);
          setPreviewContent(`<iframe src="${url}" style="width: 100%; height: 80vh;" title="PDF preview"></iframe>`);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setPreviewContent(result.value);
        } else {
          setPreviewError('This file type cannot be previewed.');
        }
      } else if (response.status === 401) {
        setAuthError('Invalid password');
      } else {
        const errorData = await response.json();
        setPreviewError(errorData.error || 'Failed to load preview');
      }
    } catch (err) {
      setPreviewError('Failed to load preview.');
      console.error(err);
    } finally {
      setViewing(false);
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center text-neutral-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-neutral-300">Loading share...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center text-neutral-100">
        <div className="max-w-md mx-auto text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-100 mb-2">Share Not Found</h1>
          <p className="text-neutral-300">{error}</p>
        </div>
      </div>
    );
  }

  // Render code share
  if (shareType === 'code' && codeShare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 font-sans text-neutral-100">
        {/* Header */}
        <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-100">EasyShares</h1>
              </Link>
              <div className="text-sm text-neutral-400">
                Code Share
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Share Info */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-100">{codeShare.title}</h2>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
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
              
              <div className="flex items-center space-x-4 text-sm text-neutral-400">
                <span>Created: {formatDate(codeShare.createdAt)}</span>
                <span>•</span>
                <span>Expires in {getDaysUntilExpiry(codeShare.expiresAt)} days</span>
              </div>
            </div>

            {/* Editor / View */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
              <div className="border-b border-neutral-800 px-4 py-3 bg-neutral-800/30 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-100">Code</h3>
                
                {!isEditing && codeShare.hasPassword && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter edit password"
                      className="px-3 py-1.5 border border-neutral-700 bg-neutral-950 rounded text-sm text-neutral-100"
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
                  <div className="text-sm text-neutral-400">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-800 text-neutral-300">
                      <Eye className="h-4 w-4 mr-1" />
                      Public View-Only
                    </span>
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="px-3 py-1.5 border border-neutral-700 bg-neutral-950 rounded text-sm text-neutral-100"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 border border-neutral-700 text-neutral-300 text-sm rounded-lg hover:bg-neutral-800 transition-colors"
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
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4">
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}
              
              <div className="h-[500px]">
                <Editor
                  height="100%"
                  language={isEditing ? editLanguage : codeShare.language}
                  value={isEditing ? editCode : codeShare.code}
                  onChange={(value) => isEditing && setEditCode(value || '')}
                  theme="vs-dark"
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
        {/* <Footer /> */}
      </div>
    );
  }

  // Render file share
  if (shareType === 'file' && fileShare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 font-sans text-neutral-100">
        {/* Header */}
        <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-100">EasyShares</h1>
              </Link>
              <div className="text-sm text-neutral-400">
                File Share
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* File Info */}
            <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-100 mb-2">{fileShare.title}</h2>
                  {fileShare.description && (
                    <p className="text-neutral-300">{fileShare.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-400">
                    Expires in {getDaysUntilExpiry(fileShare.expiresAt)} days
                  </p>
                </div>
              </div>

              <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-800/30">
                <div className="flex items-center space-x-4">
                  <FileText className="h-12 w-12 text-neutral-500" />
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-100">{fileShare.fileName}</h3>
                    <p className="text-sm text-neutral-400">{formatFileSize(fileShare.fileSize)}</p>
                    <p className="text-xs text-neutral-500">Created: {formatDate(fileShare.createdAt)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {fileShare.hasPassword && (
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="px-3 py-1.5 border border-neutral-700 bg-neutral-950 rounded text-sm text-neutral-100"
                      />
                    )}
                    <button
                      onClick={handleView}
                      disabled={viewing}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded-lg transition-colors"
                    >
                      {viewing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span>{viewing ? 'Loading...' : 'View'}</span>
                    </button>
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
                </div>
              </div>
              
              {authError && (
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mt-4">
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}

              {previewContent && (
                <div className="mt-6 border-t border-neutral-800 pt-6">
                  <h3 className="text-xl font-bold text-neutral-100 mb-4">File Preview</h3>
                  <div id="pptx-preview" className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
                </div>
              )}
              {previewError && (
                <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-4">
                  <p className="text-yellow-400 text-sm">{previewError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center text-neutral-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-neutral-300">Loading...</p>
      </div>
    </div>
  );
}
