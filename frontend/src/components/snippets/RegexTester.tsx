'use client';

import { useState, useEffect } from 'react';
import { testRegex } from '@/lib/snippetUtils';
import Input from '@/components/ui/Input';

interface RegexTesterProps {
  pattern: string;
  flags?: string;
}

export default function RegexTester({ pattern, flags = '' }: RegexTesterProps) {
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState<{ matches: string[]; isValid: boolean }>({ matches: [], isValid: true });

  useEffect(() => {
    if (pattern && testString) {
      const testResult = testRegex(pattern, testString, flags);
      setResult(testResult);
    } else {
      setResult({ matches: [], isValid: true });
    }
  }, [pattern, testString, flags]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter text to test regex pattern..."
        />
      </div>

      {testString && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results
          </label>
          <div className={`p-3 rounded-lg ${result.isValid ? 'bg-gray-50' : 'bg-red-50'}`}>
            {!result.isValid ? (
              <p className="text-red-600 text-sm">Invalid regex pattern</p>
            ) : result.matches.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm text-green-600 font-medium">
                  ✓ {result.matches.length} match{result.matches.length > 1 ? 'es' : ''} found
                </p>
                <div className="space-y-1">
                  {result.matches.map((match, i) => (
                    <div key={i} className="bg-white rounded px-3 py-1.5 font-mono text-sm border border-gray-200">
                      <span className="text-gray-400 mr-2">[{i + 1}]</span>
                      <span className="text-green-700">{match}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No matches found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}