"use client";

import { useState, useRef, useEffect } from "react";
import { type PromptVariable } from "@/types/prompt";
import Button from "@/components/ui/Button";
import { LucideVariable, LucideX } from "@/Icons/Icons";

interface VariableFormProps {
  variables: PromptVariable[];
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export default function VariableForm({
  variables,
  onSubmit,
  onCancel,
}: VariableFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variables.forEach((v) => {
      initial[v.name] = v.defaultValue || "";
    });
    return initial;
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  if (variables.length === 0) return null;

  const formatLabel = (name: string) =>
    name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <>
      <style>{CSS}</style>
      <form onSubmit={handleSubmit} className="var-form" ref={formRef}>
        <div className="var-form-header">
          <LucideVariable width={14} />
          <span>Fill in Variables</span>
        </div>
        <div className="var-form-fields">
          {variables.map((variable) => (
            <div key={variable.name} className="var-form-field">
              <label className="var-form-label" htmlFor={`var-${variable.name}`}>
                {formatLabel(variable.name)}
              </label>
              <input
                id={`var-${variable.name}`}
                className="var-form-input"
                type="text"
                value={values[variable.name] || ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [variable.name]: e.target.value,
                  }))
                }
                placeholder={
                  variable.description || `Enter ${formatLabel(variable.name)}`
                }
              />
            </div>
          ))}
        </div>
        <div className="var-form-actions">
          <Button type="submit" size="sm">
            Apply Variables
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            Skip
          </Button>
        </div>
      </form>
    </>
  );
}

const CSS = `
.var-form {
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding:       14px;
  max-height:    60dvh;
  overflow-y:    auto;
}
.var-form-header {
  display:       flex;
  align-items:   center;
  gap:           6px;
  font-size:     var(--text-sm);
  font-weight:   600;
  color:         var(--text-primary);
  margin-bottom: 12px;
}
.var-form-fields {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  margin-bottom:  12px;
}
.var-form-field {
  display:        flex;
  flex-direction: column;
  gap:            4px;
}
.var-form-label {
  font-size:   var(--text-xs);
  font-weight: 500;
  color:       var(--text-secondary);
}
.var-form-input {
  height:          36px;
  padding:         0 10px;
  background:      var(--bg-elevated);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-sm);
  color:           var(--text-primary);
  font-family:     var(--font-sans);
  font-size:       var(--text-sm);
  outline:         none;
  transition:      border-color var(--transition-fast);
}
.var-form-input::placeholder { color: var(--text-tertiary); }
.var-form-input:focus { border-color: var(--border-focus); }

.var-form-actions {
  display:     flex;
  align-items: center;
  gap:         8px;
}
`;