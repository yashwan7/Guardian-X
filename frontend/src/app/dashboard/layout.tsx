import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import DashboardProvider from '@/components/dashboard/DashboardProvider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Fallback in dev/offline mode
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-[#030605] overflow-hidden text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar user={user} />
          <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gradient-to-b from-[#060c09] via-[#040806] to-[#030504] bg-cyber-dots">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}