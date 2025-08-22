"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Code, Play, Terminal, ChevronDown } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const languages = [
  { id: 54, name: 'C++', monaco: 'cpp' },
  { id: 62, name: 'Java', monaco: 'java' },
  { id: 71, name: 'Python', monaco: 'python' },
  { id: 63, name: 'JavaScript', monaco: 'javascript' },
  { id: 50, name: 'C', monaco: 'c' },
  { id: 72, name: 'Ruby', monaco: 'ruby' },
  { id: 83, name: 'Swift', monaco: 'swift' },
  { id: 79, name: 'C#', monaco: 'csharp' },
];

export default function ExecutePage() {
  const [code, setCode] = useState('// Write your code here');
  const [languageId, setLanguageId] = useState(71); // Default Python
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // 'input' or 'output'

  const runCode = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin }),
      });
      const result = await res.json();
      setOutput(result.stdout || result.stderr || result.compile_output || result.message || 'No output');
      setActiveTab('output'); // Switch to output tab after running
    } catch (err) {
      setOutput('Error executing code');
      setActiveTab('output');
    }
    setLoading(false);
  };

  const selectedLanguage = languages.find(l => l.id === languageId);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans">
      {/* Header / Control Bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Code className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-blue-300 hidden sm:block">EasyShares Compiler</h1>
          </Link>
          <div className="relative">
            <select
              value={languageId}
              onChange={e => setLanguageId(Number(e.target.value))}
              className="appearance-none bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>
        </div>
        <button
          onClick={runCode}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Run</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content (Editor and I/O) */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Editor */}
        <div className="flex-grow relative">
          <MonacoEditor
            language={selectedLanguage?.monaco || 'python'}
            value={code}
            onChange={value => setCode(value || '')}
            theme="vs-dark"
            options={{ fontSize: 16, minimap: { enabled: true }, automaticLayout: true, scrollBeyondLastLine: false }}
          />
        </div>

        {/* Bottom Panel (Input/Output) */}
        <div className="flex-shrink-0 h-[30vh] flex flex-col bg-neutral-900 border-t border-neutral-800">
          {/* Tabs */}
          <div className="flex-shrink-0 flex items-center border-b border-neutral-800">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'input' ? 'bg-neutral-800 text-blue-300' : 'text-neutral-400 hover:bg-neutral-800/50'}`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'output' ? 'bg-neutral-800 text-blue-300' : 'text-neutral-400 hover:bg-neutral-800/50'}`}
            >
              <Terminal className="h-4 w-4" />
              Output
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-grow overflow-auto">
            {activeTab === 'input' && (
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Enter standard input here..."
                className="w-full h-full p-4 bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none font-mono text-sm"
              />
            )}
            {activeTab === 'output' && (
              <pre className={`p-4 text-sm font-mono whitespace-pre-wrap ${output.startsWith('Error') ? 'text-red-400' : 'text-green-300'}`}>
                {loading ? 'Executing code...' : (output || 'Click "Run" to see the output.')}
              </pre>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
