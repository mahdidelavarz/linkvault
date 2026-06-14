"use client";

import { useAdminOverview, type AdminUserOverview } from "@/features/admin/hooks/useAdminOverview";
import { LucideShield, LucideUser } from "@/Icons/Icons";

const COLUMNS: { key: keyof AdminUserOverview; label: string }[] = [
  { key: "linksCount", label: "Links" },
  { key: "notesCount", label: "Notes" },
  { key: "snippetsCount", label: "Snippets" },
  { key: "promptsCount", label: "Prompts" },
  { key: "apiCollectionsCount", label: "API Client" },
  { key: "infrastructureCount", label: "Infrastructure" },
  { key: "projectsCount", label: "Projects" },
];

export default function AdminPage() {
  const { data, isLoading, error } = useAdminOverview();

  return (
    <div className="admin-page">
      <style>{CSS}</style>

      <div className="admin-header">
        <div className="admin-header-icon">
          <LucideShield width={20} />
        </div>
        <div>
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">Overview of all users and their content</p>
        </div>
      </div>

      {error ? (
        <div className="admin-card admin-denied">
          <p>Access denied.</p>
        </div>
      ) : isLoading ? (
        <div className="admin-card">
          <p className="admin-muted">Loading…</p>
        </div>
      ) : (
        <>
          <div className="admin-summary">
            <div className="admin-summary-icon">
              <LucideUser width={20} />
            </div>
            <div>
              <span className="admin-summary-value">{data?.totalUsers ?? 0}</span>
              <span className="admin-summary-label">Total users</span>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  {COLUMNS.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-username">{user.username}</span>
                        {user.email && <span className="admin-email">{user.email}</span>}
                      </div>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    {COLUMNS.map((col) => (
                      <td key={col.key}>{user[col.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const CSS = `
.admin-page {
  display:        flex;
  flex-direction: column;
  gap:            16px;
  padding:        24px;
  overflow-y:     auto;
  flex:           1;
}

.admin-header {
  display:     flex;
  align-items: center;
  gap:         12px;
}
.admin-header-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  background:      var(--accent-muted);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-lg);
  color:           var(--cyan-400);
  flex-shrink:     0;
}
.admin-title    { font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); }
.admin-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); margin-top: 2px; }

.admin-card {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       20px;
}
.admin-muted  { color: var(--text-tertiary); }
.admin-denied { color: var(--text-secondary); }

.admin-summary {
  display:       flex;
  align-items:   center;
  gap:           14px;
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       16px 20px;
  width:         fit-content;
}
.admin-summary-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  background:      var(--accent-muted);
  border-radius:   var(--radius-lg);
  color:           var(--cyan-400);
}
.admin-summary-value { display: block; font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); }
.admin-summary-label { display: block; font-size: var(--text-xs); color: var(--text-tertiary); }

.admin-table-wrap {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow-x:    auto;
}
.admin-table {
  width:           100%;
  border-collapse: collapse;
  font-size:       var(--text-sm);
}
.admin-table th, .admin-table td {
  padding:    10px 14px;
  text-align: left;
  white-space: nowrap;
}
.admin-table th {
  color:           var(--text-tertiary);
  font-weight:     600;
  font-size:       var(--text-xs);
  text-transform:  uppercase;
  letter-spacing:  0.05em;
  border-bottom:   1px solid var(--border-default);
}
.admin-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid var(--border-subtle);
}
.admin-user-cell { display: flex; flex-direction: column; }
.admin-username  { color: var(--text-primary); font-weight: 500; }
.admin-email     { color: var(--text-tertiary); font-size: var(--text-xs); }
`;
