import ProtectedLayout from '@/components/ProtectedLayout';

export default function UploadRootLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
