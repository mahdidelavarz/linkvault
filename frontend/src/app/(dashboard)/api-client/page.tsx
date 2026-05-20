'use client';

import { useState } from 'react';
import { 
  useCollections, 
  useEndpoints, 
  useCreateCollection, 
  useCreateEndpoint,
  useUpdateEndpoint,
  useDeleteEndpoint,
  useDeleteCollection,
  useTestEndpoint 
} from '@/hooks/useApiClient';
import { 
  ApiEndpoint, 
  ApiCollection, 
  HttpMethod, 
  HTTP_METHODS, 
  METHOD_COLORS 
} from '@/types/api';
import { useCategories } from '@/hooks/useCategories';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import TagSelector from '@/components/tags/TagSelector';

export default function ApiClientPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Request state
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState<'json' | 'raw' | 'form-data'>('json');
  
  // Save form state
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveCategoryId, setSaveCategoryId] = useState<number | undefined>();
  const [saveCollectionId, setSaveCollectionId] = useState<number | undefined>();
  const [saveTagIds, setSaveTagIds] = useState<number[]>([]);
  const [saveFavorite, setSaveFavorite] = useState(false);
  
  // Response state
  const [response, setResponse] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const { data: collections } = useCollections();
  const { data: categories } = useCategories();
  const { data: endpoints, refetch: refetchEndpoints } = useEndpoints({ 
    collectionId: selectedCollection || undefined 
  });
  
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const createEndpoint = useCreateEndpoint();
  const updateEndpoint = useUpdateEndpoint();
  const deleteEndpoint = useDeleteEndpoint();
  const testEndpoint = useTestEndpoint();

  const handleTest = async () => {
    try {
      let parsedHeaders: Record<string, string> = {};
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch {
          headers.split('\n').forEach(line => {
            const [key, ...values] = line.split(':');
            if (key && values.length) {
              parsedHeaders[key.trim()] = values.join(':').trim();
            }
          });
        }
      }

      const result = await testEndpoint.mutateAsync({
        method,
        url,
        headers: parsedHeaders,
        body: body || undefined,
        bodyType,
      });

      setResponse(result);
      setResponseTime(result.time);
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        body: JSON.stringify({ error: error.message }, null, 2),
        headers: {},
        size: 0,
      });
    }
  };

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setMethod(endpoint.method);
    setUrl(endpoint.url);
    setHeaders(
      endpoint.headers
        ?.filter(h => h.enabled !== false)
        .map(h => `${h.key}: ${h.value}`)
        .join('\n') || ''
    );
    setBody(endpoint.body || '');
    setBodyType((endpoint.bodyType as any) || 'json');
    setResponse(null);
  };

  const handleNewRequest = () => {
    setSelectedEndpoint(null);
    setMethod('GET');
    setUrl('');
    setHeaders('');
    setBody('');
    setBodyType('json');
    setResponse(null);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection.mutateAsync({ name: newCollectionName });
    setNewCollectionName('');
    setShowNewCollection(false);
  };

  const handleOpenSave = () => {
    if (selectedEndpoint) {
      // Editing existing
      setSaveTitle(selectedEndpoint.title);
      setSaveDescription(selectedEndpoint.description || '');
      setSaveCategoryId(selectedEndpoint.categoryId);
      setSaveCollectionId(selectedEndpoint.collectionId);
      setSaveTagIds(selectedEndpoint.tags?.map((t: any) => t.id) || []);
      setSaveFavorite(selectedEndpoint.isFavorite);
    } else {
      // New endpoint
      setSaveTitle('');
      setSaveDescription('');
      setSaveCategoryId(undefined);
      setSaveCollectionId(selectedCollection || undefined);
      setSaveTagIds([]);
      setSaveFavorite(false);
    }
    setShowSaveForm(true);
  };

  const handleSave = async () => {
    if (!saveTitle.trim() || !url.trim()) return;

    try {
      const parsedHeaders = headers
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [key, ...values] = line.split(':');
          return {
            key: key?.trim() || '',
            value: values.join(':').trim(),
            enabled: true,
          };
        })
        .filter(h => h.key);

      const endpointData = {
        title: saveTitle,
        url,
        method,
        description: saveDescription,
        headers: parsedHeaders,
        queryParams: [],
        body: body || undefined,
        bodyType: bodyType as any,
        authType: 'none' as const,
        collectionId: saveCollectionId || undefined,
        categoryId: saveCategoryId,
        isFavorite: saveFavorite,
        tagIds: saveTagIds,
      };

      if (selectedEndpoint) {
        await updateEndpoint.mutateAsync({ id: selectedEndpoint.id, ...endpointData });
      } else {
        await createEndpoint.mutateAsync(endpointData);
      }

      setShowSaveForm(false);
      refetchEndpoints();
    } catch (error) {
      console.error('Error saving endpoint:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEndpoint) return;
    if (window.confirm('Are you sure you want to delete this endpoint?')) {
      await deleteEndpoint.mutateAsync(selectedEndpoint.id);
      handleNewRequest();
      refetchEndpoints();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4">
      {/* Left Sidebar - Collections & Endpoints */}
      <div className="w-72 flex-shrink-0 bg-white rounded-lg shadow p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Collections</h3>
          <button
            onClick={() => setShowNewCollection(true)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + New
          </button>
        </div>

        {showNewCollection && (
          <div className="mb-3 flex gap-2">
            <Input
              label=""
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="text-sm"
            />
            <Button onClick={handleCreateCollection} isLoading={createCollection.isPending}>
              Add
            </Button>
          </div>
        )}

        {/* All Endpoints */}
        <button
          onClick={() => setSelectedCollection(null)}
          className={`w-full text-left px-3 py-2 rounded mb-1 text-sm ${
            !selectedCollection ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          📡 All Endpoints
        </button>

        {/* Collections */}
        {collections?.map(col => (
          <div key={col.id} className="group">
            <button
              onClick={() => setSelectedCollection(col.id)}
              className={`w-full text-left px-3 py-2 rounded mb-1 text-sm flex items-center justify-between ${
                selectedCollection === col.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>📁 {col.name}</span>
              <span className="text-xs text-gray-400">{col._count?.endpoints || 0}</span>
            </button>
          </div>
        ))}

        {/* Endpoints List */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Endpoints</h4>
            <button onClick={handleNewRequest} className="text-blue-600 text-sm">+ New</button>
          </div>
          {endpoints?.map(ep => (
            <button
              key={ep.id}
              onClick={() => handleSelectEndpoint(ep)}
              className={`w-full text-left px-2 py-2 rounded mb-1 text-sm group ${
                selectedEndpoint?.id === ep.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-xs text-white font-bold ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <span className="truncate text-gray-700 flex-1">{ep.title}</span>
                {ep.isFavorite && <span className="text-xs">⭐</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Request Builder */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Request Builder */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {selectedEndpoint ? selectedEndpoint.title : 'New Request'}
            </h3>
            <div className="flex gap-2">
              {/* Save Button */}
              <Button variant="outline" onClick={handleOpenSave}>
                💾 {selectedEndpoint ? 'Update' : 'Save'}
              </Button>
              {/* Delete Button (only for saved endpoints) */}
              {selectedEndpoint && (
                <Button variant="secondary" onClick={handleDelete}>
                  🗑️
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm font-bold bg-white"
            >
              {HTTP_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <Button onClick={handleTest} isLoading={testEndpoint.isPending}>
              🚀 Send
            </Button>
          </div>

          {/* Headers */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headers
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
              placeholder='Content-Type: application/json&#10;Authorization: Bearer token123'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>

          {/* Body */}
          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Body</label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value as any)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="json">JSON</option>
                  <option value="raw">Raw</option>
                  <option value="form-data">Form Data</option>
                </select>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder='{"key": "value"}'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Response Viewer */}
        {response && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">Response</h3>
                <span className={`px-2 py-0.5 rounded text-xs text-white font-bold ${
                  response.status < 300 ? 'bg-green-500' : 
                  response.status < 400 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {response.status} {response.statusText}
                </span>
                {responseTime !== null && (
                  <span className="text-xs text-gray-500">{responseTime}ms</span>
                )}
                {response.size > 0 && (
                  <span className="text-xs text-gray-500">
                    {(response.size / 1024).toFixed(2)} KB
                  </span>
                )}
              </div>
            </div>

            {/* Response Body */}
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
              </pre>
            </div>

            {/* Response Headers */}
            {response.headers && Object.keys(response.headers).length > 0 && (
              <details className="mt-3">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  Response Headers ({Object.keys(response.headers).length})
                </summary>
                <div className="mt-2 bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="text-xs font-mono py-0.5">
                      <span className="text-blue-600">{key}</span>: <span className="text-gray-700">{value as string}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Empty State */}
        {!response && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-6xl mb-4">🌐</p>
              <p className="text-lg">Select an endpoint or build a new request</p>
              <p className="text-sm mt-1">Press 🚀 Send to test your API</p>
            </div>
          </div>
        )}
      </div>

      {/* Save Form Modal */}
      <Modal isOpen={showSaveForm} onClose={() => setShowSaveForm(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedEndpoint ? 'Update Endpoint' : 'Save Endpoint'}
          </h3>

          <Input
            label="Title *"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="e.g., Get User Profile"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What does this endpoint do?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection
            </label>
            <select
              value={saveCollectionId || ''}
              onChange={(e) => setSaveCollectionId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">No Collection</option>
              {collections?.map(col => (
                <option key={col.id} value={col.id}>📁 {col.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={saveCategoryId || ''}
              onChange={(e) => setSaveCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">No Category</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
              ))}
            </select>
          </div>

          <TagSelector
            selectedTagIds={saveTagIds}
            onChange={setSaveTagIds}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={saveFavorite}
              onChange={(e) => setSaveFavorite(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Mark as favorite</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowSaveForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={createEndpoint.isPending || updateEndpoint.isPending}>
              {selectedEndpoint ? 'Update' : 'Save Endpoint'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}