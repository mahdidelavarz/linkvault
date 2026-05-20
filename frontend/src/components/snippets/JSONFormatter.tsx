'use client';

import { useState } from 'react';
import { formatJSON } from '@/lib/snippetUtils';
import Button from '@/components/ui/Button';

interface JSONFormatterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JSONFormatter({ value, onChange }: JSONFormatterProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFormat = () => {
    try {
      const formatted = formatJSON(value);
      onChange(formatted);
      setError(null);
    } catch (e) {
      setError('Invalid JSON');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(value);
      setError(null);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleFormat}>
          ✨ Format JSON
        </Button>
        <Button variant="outline" onClick={handleValidate}>
          ✓ Validate
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {!error && value && (
        <p className="text-sm text-green-600">✓ Valid JSON</p>
      )}
    </div>
  );
}