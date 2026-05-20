"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "🏷️" },
  { name: "Links", href: "/links", icon: "🔗" },
  { name: "Notes", href: "/notes", icon: "📝" },
  { name: "Snippets", href: "/snippets", icon: "💻" },
  { name: "Prompts", href: "/prompts", icon: "💬" },
  { name: "Categories", href: "/categories", icon: "📁" },
  { name: "Tags", href: "/tags", icon: "🏷️" },
  { name: 'API Client', href: '/api-client', icon: '🌐' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
      <nav className="mt-5 px-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
