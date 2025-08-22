"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Footer from '@/components/Footer';
import { Copy, Save, Check, ArrowLeft, Code, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
  // State for code execution
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [runError, setRunError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const shareId = params.id as string;

  const createSlugFromTitle = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const checkTitleAvailability = useCallback(async (slug: string) => {
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
      setTitleError('Could not verify title. Please try again.');
    } finally {
      setTitleChecking(false);
    }
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    const validationError = validateTitle(value);
    setTitleError(validationError);

    if (!value.trim()) {
      setTitleAvailable(null);
      return;
    }

    if (!validationError) {
      const slug = createSlugFromTitle(value);
      if (slug.length >= 3) {
        checkTitleAvailability(slug);
      }
    }
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

  const saveCodeShare = async () => {
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
        const finalSlug = isSaved && title ? createSlugFromTitle(title) : shareId;
        setShareUrl(`${window.location.origin}/${finalSlug}`);
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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
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

  useEffect(() => {
    if (typeof window !== 'undefined' && shareId) {
      const finalSlug = isSaved && title ? createSlugFromTitle(title) : shareId;
      setShareUrl(`${window.location.origin}/${finalSlug}`);
    }
  }, [shareId, isSaved, title]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 font-sans text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Back to Home"
              >
                <ArrowLeft className="h-5 w-5 text-neutral-300" />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-300">Create Share</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveCodeShare}
                disabled={isSaving || !!titleError || (title.trim() !== '' && titleAvailable === false)}
                className="inline-flex items-center space-x-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save & Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isSaved ? (
          <div className="max-w-3xl mx-auto bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 p-8 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold text-blue-300 mb-4">Share Created!</h2>
            <p className="text-neutral-300 mb-6">Your code is now saved and ready to be shared.</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-blue-300 font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                aria-label="Copy Share URL"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
             <p className="text-xs text-neutral-500 mt-2">
                {password ? "This share is password-protected for editing." : "Anyone with the link can view. Editing is locked."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-8 inline-flex items-center space-x-2 px-6 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Create Another</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Settings */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-neutral-300 mb-2">Language</label>
                    <select
                      id="language-select"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="password-input" className="block text-sm font-medium text-neutral-300 mb-2">Edit Password (Optional)</label>
                    <input
                      id="password-input"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Leave empty for view-only"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 focus:ring-2 focus:ring-blue-500 transition"
                    />
                     <p className="text-xs text-neutral-500 mt-1">Set a password to be able to edit this share later.</p>
                  </div>
                </div>
              </div>
               <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-4">Custom URL (Optional)</h3>
                   <input
                      type="text"
                      value={title}
                      onChange={e => handleTitleChange(e.target.value)}
                      placeholder="e.g., 'My Awesome Script'"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100 focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <div className="h-4 mt-2 text-sm">
                      {titleChecking && <p className="text-blue-400">Checking...</p>}
                      {titleError && <p className="text-red-400">{titleError}</p>}
                      {titleAvailable === true && <p className="text-green-400">Title is available!</p>}
                      {titleAvailable === false && <p className="text-red-400">This title is already taken.</p>}
                    </div>
               </div>
            </div>

            {/* Right Column: Editor */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 overflow-hidden">
                <div className="border-b border-neutral-800 px-4 py-2 bg-neutral-800/50 flex justify-between items-center">
                   <p className="text-sm text-neutral-300 font-mono">{title ? createSlugFromTitle(title) : shareId}</p>
                   <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(`/execute?code=${encodeURIComponent(code)}&lang=${encodeURIComponent(language)}`, '_blank');
                        }
                      }}
                      className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all duration-300"
                    >
                      <Code className="h-3 w-3" />
                      <span>Compile</span>
                    </button>
                </div>
                <div className="h-[600px]">
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={value => setCode(value || '')}
                    theme="vs-dark"
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
        )}
      </main>
      <Footer />
    </div>
  );
}
