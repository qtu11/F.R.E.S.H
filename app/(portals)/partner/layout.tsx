import { PartnerNavigation } from '@/components/PartnerNavigation';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <PartnerNavigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
