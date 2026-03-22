import ProtectedLayout from '@/components/ProtectedLayout';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
