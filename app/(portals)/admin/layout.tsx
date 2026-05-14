import { AdminNavigation } from '@/components/AdminNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // We'll skip the actual auth wrapper for this prototype for simplicity,
  // but normally we'd check session here.
  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-300 pb-20 md:pb-0 md:pl-64 selection:bg-emerald-500/30">
      <AdminNavigation />
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
