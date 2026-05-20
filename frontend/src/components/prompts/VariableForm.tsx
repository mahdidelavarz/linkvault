'use client';

import { useState } from 'react';
import { PromptVariable } from '@/types/prompt';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface VariableFormProps {
  variables: PromptVariable[];
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export default function VariableForm({ variables, onSubmit, onCancel }: VariableFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variables.forEach(v => {
      initial[v.name] = v.defaultValue || '';
    });
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  if (variables.length === 0) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900">Fill in Variables</h4>
      {variables.map(variable => (
        <Input
          key={variable.name}
          label={variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          type="text"
          value={values[variable.name] || ''}
          onChange={(e) => setValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
          placeholder={variable.description || `Enter ${variable.name}`}
        />
      ))}
      <div className="flex gap-3">
        <Button type="submit" fullWidth>
          Apply Variables
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Skip
        </Button>
      </div>
    </form>
  );
}