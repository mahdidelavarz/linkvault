import Link from 'next/link';

interface StatCardProps {
  title: string;
  icon: string;
  total: number;
  subStats?: {
    label: string;
    value: number;
    icon: string;
  }[];
  href: string;
  color: string;
}

export default function StatCard({ title, icon, total, subStats, href, color }: StatCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          <span className={`text-3xl font-bold ${color}`}>{total}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        {subStats && subStats.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {subStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <span>{stat.icon}</span>
                  {stat.label}
                </span>
                <span className="font-medium text-gray-700">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}