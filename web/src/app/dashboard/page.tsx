import { redirect } from 'next/navigation';
import { stackServerApp } from '@/stack';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect('/handler/sign-in');
  }

  return <DashboardContent user={user} />;
}