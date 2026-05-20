"use client";

import { useState } from "react";
import {
  Prompt,
  PROMPT_TYPES,
  AI_PLATFORMS,
  PromptVariable,
  AIPlatform,
} from "@/types/prompt";
import {
  useTogglePromptFavorite,
  useDeletePrompt,
  useIncrementPromptUsage,
} from "@/hooks/usePrompt";
import {
  extractVariables,
  replaceVariables,
  copyToClipboard,
  sendToAI,
} from "@/lib/promptUtils";
import VariableForm from "./VariableForm";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
}

export default function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const [showVariables, setShowVariables] = useState(false);
  const [filledContent, setFilledContent] = useState(prompt.content);
  const [copied, setCopied] = useState(false);
  const [sentToAI, setSentToAI] = useState<AIPlatform | null>(null);

  const toggleFavorite = useTogglePromptFavorite();
  const deletePrompt = useDeletePrompt();
  const incrementUsage = useIncrementPromptUsage();

  const variables = extractVariables(prompt.content);
  const promptType = PROMPT_TYPES[prompt.promptType];
  const aiPlatform = prompt.targetAI ? AI_PLATFORMS[prompt.targetAI] : null;

  const handleCopy = async () => {
    const success = await copyToClipboard(filledContent);
    if (success) {
      setCopied(true);
      incrementUsage.mutate(prompt.id);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendToAI = (platform: AIPlatform) => {
    const success = sendToAI(filledContent, platform);
    if (success) {
      setSentToAI(platform);
      incrementUsage.mutate(prompt.id);
      setTimeout(() => setSentToAI(null), 3000);
    }
  };

  const handleVariablesFilled = (values: Record<string, string>) => {
    const replaced = replaceVariables(prompt.content, values);
    setFilledContent(replaced);
    setShowVariables(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      deletePrompt.mutate(prompt.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{promptType?.icon || "✨"}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {prompt.title}
            </h3>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">{promptType?.label}</span>
              {aiPlatform && (
                <span
                  className={`text-xs text-white px-2 py-0.5 rounded-full ${aiPlatform.color}`}
                >
                  {aiPlatform.icon} {aiPlatform.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite.mutate(prompt.id)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          {prompt.isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Description */}
      {prompt.description && (
        <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
      )}

      {/* Content Preview */}
      <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-3 max-h-40 overflow-y-auto">
        <pre className="text-xs font-mono whitespace-pre-wrap">
          {filledContent}
        </pre>
      </div>

      {/* Variables Indicator */}
      {variables.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowVariables(!showVariables)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            🔧 {variables.length} variable{variables.length > 1 ? "s" : ""} (
            {variables.map((v) => v.name).join(", ")})
          </button>
        </div>
      )}

      {/* Variable Form */}
      {showVariables && (
        <div className="mb-3">
          <VariableForm
            variables={variables}
            onSubmit={handleVariablesFilled}
            onCancel={() => setShowVariables(false)}
          />
        </div>
      )}

      {/* Tags & Category */}
      <div className="flex flex-wrap gap-2 mb-3">
        {prompt.category && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            📁 {prompt.category.name}
          </span>
        )}
        {prompt.tags?.map((tag: any) => (
          <span
            key={tag.id}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
          >
            🏷️ {tag.name}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-gray-400 mb-3">
        <span>Used: {prompt.usageCount}x</span>
        {prompt.lastUsedAt && (
          <span>
            Last used: {new Date(prompt.lastUsedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Alerts */}
      {copied && (
        <div className="mb-3">
          <Alert type="success" message="Copied to clipboard!" />
        </div>
      )}
      {sentToAI && (
        <div className="mb-3">
          <Alert
            type="info"
            message={`Opening ${AI_PLATFORMS[sentToAI].name}... Prompt copied to clipboard!`}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t">
        <Button variant="outline" onClick={handleCopy}>
          📋 Copy
        </Button>

        {/* Send to AI buttons */}
        {aiPlatform && prompt.targetAI && (
          <Button
            variant="outline"
            onClick={() => handleSendToAI(prompt.targetAI as AIPlatform)}
          >
            🚀 Send to {aiPlatform.name}
          </Button>
        )}

        {/* Quick send to common AIs */}
        {!aiPlatform && (
          <div className="flex gap-1">
            <button
              onClick={() => handleSendToAI("chatgpt")}
              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
              title="Send to ChatGPT"
            >
              🤖
            </button>
            <button
              onClick={() => handleSendToAI("deepseek")}
              className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs hover:bg-teal-200"
              title="Send to DeepSeek"
            >
              🐋
            </button>
            <button
              onClick={() => handleSendToAI("claude")}
              className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs hover:bg-orange-200"
              title="Send to Claude"
            >
              🧠
            </button>
            <button
              onClick={() => handleSendToAI("gemini")}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
              title="Send to Gemini"
            >
              💎
            </button>
          </div>
        )}

        <div className="flex-1" />

        <Button variant="outline" onClick={() => onEdit(prompt)}>
          ✏️ Edit
        </Button>
        <Button variant="secondary" onClick={handleDelete}>
          🗑️
        </Button>
      </div>
    </div>
  );
}
