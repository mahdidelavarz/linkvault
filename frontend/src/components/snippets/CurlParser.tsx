'use client';

import { useState, useEffect } from 'react';
import { parseCurlCommand } from '@/lib/snippetUtils';

interface CurlParserProps {
  curlCommand: string;
}

export default function CurlParser({ curlCommand }: CurlParserProps) {
  const [parsed, setParsed] = useState<any>(null);

  useEffect(() => {
    if (curlCommand) {
      const result = parseCurlCommand(curlCommand);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [curlCommand]);

  if (!parsed) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Parsed cURL Request</h4>
      
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${
          parsed.method === 'GET' ? 'bg-blue-500' :
          parsed.method === 'POST' ? 'bg-green-500' :
          parsed.method === 'PUT' ? 'bg-orange-500' :
          parsed.method === 'DELETE' ? 'bg-red-500' :
          'bg-gray-500'
        }`}>
          {parsed.method}
        </span>
        <span className="text-sm font-mono text-gray-700">{parsed.url}</span>
      </div>

      {Object.keys(parsed.headers).length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-500">Headers:</span>
          <div className="mt-1 space-y-1">
            {Object.entries(parsed.headers).map(([key, value]: any) => (
              <div key={key} className="text-xs font-mono">
                <span className="text-blue-600">{key}</span>: <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.body && (
        <div>
          <span className="text-xs font-medium text-gray-500">Body:</span>
          <pre className="mt-1 text-xs font-mono bg-white rounded p-2 border">
            {parsed.body}
          </pre>
        </div>
      )}
    </div>
  );
}