export const metadata = {
  title: 'YemenDub AI',
  description: 'AI dubbing for Yemeni dialects'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
