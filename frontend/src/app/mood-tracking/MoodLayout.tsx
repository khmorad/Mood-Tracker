// app/mood-tracking/MoodLayout.tsx
export default function MoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      {children}
    </div>
  );
}
