'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Copy, Save, Share2, Lock, Eye, Code, ArrowLeft, Check } from 'lucide-react';

export default function CreatePage() {
  const [code, setCode] = useState('// Welcome to CodeShare!\n// Write your code here...\n\nfunction hello() {\n    console.log("Hello, World!");\n}');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [titleError, setTitleError] = useState('');
  const [titleChecking, setTitleChecking] = useState(false);
  const [titleAvailable, setTitleAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const shareId = params.id as string;

  useEffect(() => {
    if (typeof window !== 'undefined' && shareId) {
      const finalSlug = isSaved && title ? createSlugFromTitle(title) : shareId;
      setShareUrl(`${window.location.origin}/${finalSlug}`);
    }
  }, [shareId, isSaved, title]);

  const createSlugFromTitle = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const validateTitle = (titleText: string) => {
    if (!titleText) return '';
    
    const slug = createSlugFromTitle(titleText);
    
    // Check minimum length
    if (slug.length < 3) {
      return 'Title must be at least 3 characters long when converted to URL';
    }
    
    // Check maximum length
    if (slug.length > 50) {
      return 'Title is too long (max 50 characters in URL format)';
    }
    
    return '';
  };

  const handleTitleChange = async (value: string) => {
    setTitle(value);
    
    if (!value.trim()) {
      setTitleError('');
      setTitleAvailable(null);
      return;
    }

    const validationError = validateTitle(value);
    setTitleError(validationError);
    
    if (!validationError) {
      const slug = createSlugFromTitle(value);
      
      if (slug.length >= 3) {
        setTitleChecking(true);
        setTitleAvailable(null);
        
        try {
          const response = await fetch(`/api/codeshare/check-slug?slug=${slug}`);
          const data = await response.json();
          setTitleAvailable(data.available);
          
          if (!data.available) {
            setTitleError('This title creates a URL that is already taken');
          }
        } catch (error) {
          console.error('Error checking title availability:', error);
        } finally {
          setTitleChecking(false);
        }
      }
    } else {
      setTitleAvailable(null);
    }
  };

  const saveCodeShare = async () => {
    // Check for title validation errors only if title is provided
    if (title.trim() && titleError) {
      alert('Please fix the title error before saving');
      return;
    }

    if (title.trim() && titleAvailable === false) {
      alert('This title creates a URL that is already taken. Please choose a different title.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Use title-based slug if title exists, otherwise use random shareId
      const finalId = title.trim() ? createSlugFromTitle(title) : shareId;
      const finalTitle = title.trim() || 'Untitled EasyShare';
      
      const response = await fetch('/api/codeshare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: finalId,
          title: finalTitle,
          code,
          language,
          password,
          isCustomSlug: !!title.trim(),
        }),
      });

      if (response.ok) {
        setIsSaved(true);
      } else if (response.status === 409) {
        alert('This title creates a URL that is already taken. Please choose a different title.');
        setTitleAvailable(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      alert('Failed to save code share. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Show a fallback message to user
      alert(`Copy this URL manually: ${shareUrl}`);
    }
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'markdown', label: 'Markdown' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">ShareIt</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isSaved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-medium">Saved</span>
                </div>
              )}
              
              <button
                onClick={saveCodeShare}
                disabled={isSaving}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Share Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <span>Share Settings</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (becomes your URL)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="my-awesome-code"
                      className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                        titleError ? 'border-red-300' : 
                        titleAvailable === true ? 'border-green-300' :
                        'border-gray-300'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {titleChecking && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                      {!titleChecking && titleAvailable === true && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      {!titleChecking && titleAvailable === false && (
                        <span className="text-red-600 text-xs">✕</span>
                      )}
                    </div>
                  </div>
                  {titleError && (
                    <p className="text-xs text-red-600 mt-1">{titleError}</p>
                  )}
                  {!titleError && titleAvailable === true && (
                    <p className="text-xs text-green-600 mt-1">✓ This URL is available!</p>
                  )}
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {title && typeof window !== 'undefined' ? (
                      <>
                        Your code will be available at: <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {window.location.host}/{createSlugFromTitle(title)}
                        </code>
                      </>
                    ) : (
                      'Leave empty for random URL'
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span>Edit Password (Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for public code (anyone can view)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set a password to control editing, or leave empty for view-only public sharing
                  </p>
                </div>
              </div>
            </div>

            {/* Share URL */}
            {isSaved && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>Share URL</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Share this URL with others. They can view your code but only you can edit it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {title || 'Untitled EasyShare'}
                </h2>
              </div>
              
              <div className="h-[600px]">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-light"
                  options={{
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
