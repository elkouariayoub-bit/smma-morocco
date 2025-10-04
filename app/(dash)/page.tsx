import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Server-side redirect to the default dashboard subpage
  redirect('/composer');
}
