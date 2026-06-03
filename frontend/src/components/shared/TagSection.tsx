import Badge from "@/components/ui/Badge";
import { LucideFolder } from "@/Icons/Icons";

interface Tag { id: number; name: string; }
interface Category { id: number; name: string; }

interface TagSectionProps {
  tags?: Tag[];
  category?: Category | null;
  className?: string;
}

/**
 * Flex-wrap row of Badge components for tags + category.
 * Used in LinkCard, SnippetCard, PromptCard, InfraCard.
 */
export default function TagSection({ tags, category, className = "" }: TagSectionProps) {
  const hasTags = tags && tags.length > 0;
  if (!category && !hasTags) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className={`ts-wrap ${className}`.trim()}>
        {category && (
          <Badge variant="cyan" icon={LucideFolder} size="sm">
            {category.name}
          </Badge>
        )}
        {tags?.map((tag) => (
          <Badge key={tag.id} variant="default" size="sm">
            {tag.name}
          </Badge>
        ))}
      </div>
    </>
  );
}

const CSS = `
.ts-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
`;
