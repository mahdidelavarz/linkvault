interface SearchEmptyStateProps {
  hasQuery: boolean;
  hasFilters: boolean;
}

export default function SearchEmptyState({ hasQuery, hasFilters }: SearchEmptyStateProps) {
  if (!hasQuery && !hasFilters) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">🔍</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Start Searching
        </h3>
        <p className="text-gray-500">
          Type in the search box to find links, notes, and snippets across your vault.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <p className="text-6xl mb-4">🔍</p>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Results Found
      </h3>
      <p className="text-gray-500">
        Try adjusting your search terms or clearing some filters.
      </p>
    </div>
  );
}