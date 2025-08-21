'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Copy, Edit3, Eye, Code, Lock, Check, AlertTriangle } from 'lucide-react';

interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: string;
}

export default function SharePage() {
  const [codeShare, setCodeShare] = useState<CodeShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [editCode, setEditCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const params = useParams();
  const shareId = params.id as string;

  useEffect(() => {
    fetchCodeShare();
  }, [shareId]);

  const fetchCodeShare = async () => {
    try {
      const response = await fetch(`/api/codeshare/${shareId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCodeShare(data);
        setEditCode(data.code);
      } else if (response.status === 404) {
        setError('Code share not found');
      } else {
        setError('Failed to load code share');
      }
    } catch (err) {
      setError('Failed to load code share');
    } finally {
      setLoading(false);
    }
  };

  const enableEdit = async () => {
    if (!password.trim()) {
      setAuthError('Please enter the password');
      return;
    }

    try {
      const response = await fetch(`/api/codeshare/${shareId}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsEditing(true);
        setAuthError('');
      } else {
        setAuthError('Incorrect password');
      }
    } catch (err) {
      setAuthError('Authentication failed');
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/codeshare/${shareId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: editCode,
          password,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCodeShare(updatedData);
        setIsEditing(false);
        setPassword('');
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeShare?.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading code share...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Code className="h-4 w-4" />
            <span>Create New Code Share</span>
          </a>
        </div>
      </div>
    );
  }

  if (!codeShare) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CodeShare</h1>
                <p className="text-sm text-gray-600">
                  Created {new Date(codeShare.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={copyUrl}
                className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Share URL</span>
                  </>
                )}
              </button>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPassword('');
                      setAuthError('');
                      setEditCode(codeShare.code);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Code Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span>Code Info</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{codeShare.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <p className="text-gray-900 capitalize">{codeShare.language}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">
                    {new Date(codeShare.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Password */}
            {isEditing && !password && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  <span>Enter Password</span>
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter edit password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && enableEdit()}
                  />
                  
                  {authError && (
                    <p className="text-sm text-red-600">{authError}</p>
                  )}
                  
                  <button
                    onClick={enableEdit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Unlock Editor
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    Only the creator can edit this code share with the correct password.
                  </p>
                </div>
              </div>
            )}

            {/* Copy Code */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={copyToClipboard}
                className="w-full inline-flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {codeShare.title}
                </h2>
                
                {isEditing && password ? (
                  <span className="inline-flex items-center space-x-1 text-sm text-green-600 font-medium">
                    <Edit3 className="h-4 w-4" />
                    <span>Editing Mode</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>View Only</span>
                  </span>
                )}
              </div>
              
              <div className="h-[600px]">
                <Editor
                  height="100%"
                  language={codeShare.language}
                  value={isEditing && password ? editCode : codeShare.code}
                  onChange={(value) => isEditing && password && setEditCode(value || '')}
                  theme="vs-light"
                  options={{
                    readOnly: !(isEditing && password),
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
    </div>
  );
}
