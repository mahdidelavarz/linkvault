"use client";

import { useState } from "react";
import {
  useInfrastructures,
  useCreateInfrastructure,
  useUpdateInfrastructure,
  useDeleteInfrastructure,
  useToggleInfraFavorite,
} from "@/hooks/useInfrastructure";
import { useCategories } from "@/hooks/useCategories";
import {
  Infrastructure,
  InfraType,
  INFRA_TYPES,
  CreateInfraDto,
} from "@/types/infrastructure";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import TagSelector from "@/components/tags/TagSelector";

export default function InfrastructurePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Infrastructure | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateInfraDto>({
    title: "",
    infraType: "env",
    description: "",
    content: "",
    isFavorite: false,
    categoryId: undefined,
    tagIds: [],
    metadata: {},
  });

  const { data: categories } = useCategories();
  const { data: items, isLoading } = useInfrastructures({
    search: searchTerm || undefined,
    infraType: selectedType || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
    isFavorite: showFavorites || undefined,
  });

  const createItem = useCreateInfrastructure();
  const updateItem = useUpdateInfrastructure();
  const deleteItem = useDeleteInfrastructure();
  const toggleFavorite = useToggleInfraFavorite();

  const handleEdit = (item: Infrastructure) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      infraType: item.infraType,
      description: item.description || "",
      content: item.content,
      isFavorite: item.isFavorite,
      categoryId: item.categoryId,
      tagIds: item.tags?.map((t: any) => t.id) || [],
      metadata: item.metadata || {},
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...formData });
      } else {
        await createItem.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData({
      title: "",
      infraType: "env",
      description: "",
      content: "",
      isFavorite: false,
      categoryId: undefined,
      tagIds: [],
      metadata: {},
    });
  };

  const handleCopy = async (content: string, id: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedCategory("");
    setShowFavorites(false);
  };

  const hasFilters =
    searchTerm || selectedType || selectedCategory || showFavorites;

  const getContentPreview = (item: Infrastructure) => {
    const preview = item.content.substring(0, 100);
    if (item.infraType === "env") {
      return item.content.split("\n").slice(0, 3).join("\n");
    }
    return preview + (item.content.length > 100 ? "..." : "");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Infrastructure</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage environment variables, servers, Docker configs, and
              deployments
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>+ New Config</Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(INFRA_TYPES).map(([key, { label, icon }]) => (
                <option key={key} value={key}>
                  {icon} {label}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  📁 {cat.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="w-4 h-4"
              />
              ⭐ Favorites
            </label>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Copy Notification */}
      {copiedId && (
        <div className="fixed top-4 right-4 z-50">
          <Alert type="success" message="📋 Copied to clipboard!" />
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const typeInfo = INFRA_TYPES[item.infraType];
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeInfo.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.title}
                      </h3>
                      <span
                        className={`text-xs text-white px-1.5 py-0.5 rounded-full ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite.mutate(item.id)}
                    className="text-lg"
                  >
                    {item.isFavorite ? "⭐" : "☆"}
                  </button>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-600 mb-2">
                    {item.description}
                  </p>
                )}

                <div className="bg-gray-900 text-gray-100 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {getContentPreview(item)}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {item.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      📁 {item.category.name}
                    </span>
                  )}
                  {item.tags?.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      🏷️ {tag.name}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-gray-400">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs text-gray-600 hover:text-gray-700"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete?"))
                          deleteItem.mutate(item.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-5xl mb-4">🏗️</p>
          <p className="text-gray-500 text-lg">No configurations found</p>
          {!hasFilters && (
            <Button onClick={() => setIsFormOpen(true)} className="mt-4">
              Add Your First Config
            </Button>
          )}
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={handleClose} size="large">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingItem ? "Edit Configuration" : "New Configuration"}
          </h3>

          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., Production Environment"
            required
          />

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(INFRA_TYPES).map(
                ([key, { label, icon, color }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        infraType: key as InfraType,
                      }))
                    }
                    className={`p-2 rounded-lg text-xs font-medium transition-all border-2 ${
                      formData.infraType === key
                        ? `${color} text-white border-transparent`
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-lg mb-1">{icon}</span>
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">No Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    📁 {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Server-specific fields */}
            {formData.infraType === "server" && (
              <Input
                label="Host"
                value={formData.metadata?.host || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, host: e.target.value },
                  }))
                }
                placeholder="192.168.1.100"
              />
            )}
          </div>

          {formData.infraType === "server" && (
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Port"
                value={formData.metadata?.port?.toString() || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      port: parseInt(e.target.value) || undefined,
                    },
                  }))
                }
                placeholder="22"
              />
              <Input
                label="Username"
                value={formData.metadata?.username || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, username: e.target.value },
                  }))
                }
                placeholder="root"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auth Type
                </label>
                <select
                  value={formData.metadata?.authType || "password"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        authType: e.target.value as
                          | "password"
                          | "key"
                          | "key-passphrase",
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="password">Password</option>
                  <option value="key">SSH Key</option>
                  <option value="key-passphrase">SSH Key + Passphrase</option>
                </select>
              </div>
            </div>
          )}

          {/* ENV-specific fields */}
          {formData.infraType === "env" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <select
                value={formData.metadata?.environment || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      environment: e.target.value as
                        | "development"
                        | "staging"
                        | "production"
                        | "testing",
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select environment</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          )}

          <TagSelector
            selectedTagIds={formData.tagIds || []}
            onChange={(tagIds) => setFormData((prev) => ({ ...prev, tagIds }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="What is this configuration for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.infraType === "env"
                ? "Environment Variables"
                : formData.infraType === "docker"
                  ? "Docker Configuration"
                  : formData.infraType === "deployment"
                    ? "Deployment Notes"
                    : "Content"}{" "}
              *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder={
                formData.infraType === "env"
                  ? "DATABASE_URL=postgresql://localhost:5432/mydb\nAPI_KEY=your-api-key\nNODE_ENV=production"
                  : formData.infraType === "docker"
                    ? 'version: "3.8"\nservices:\n  app:\n    image: myapp:latest\n    ports:\n      - "3000:3000"'
                    : formData.infraType === "server"
                      ? "ssh user@host -p port"
                      : "Enter configuration content..."
              }
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFavorite}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isFavorite: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Mark as favorite</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createItem.isPending || updateItem.isPending}
            >
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
