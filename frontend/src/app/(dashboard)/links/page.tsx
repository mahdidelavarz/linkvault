export default function LinksPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Links</h2>
        <p className="mt-1 text-sm text-gray-600">
          Your saved links will appear here
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-12">
          No links yet. Start by adding your first link!
        </p>
      </div>
    </div>
  );
}