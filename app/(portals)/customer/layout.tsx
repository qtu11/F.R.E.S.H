import { CustomerNavigation } from '@/components/CustomerNavigation';
import { PageTransition } from '@/components/PageTransition';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20 pt-14 md:pt-0 md:pb-0 md:pl-64">
      <CustomerNavigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
