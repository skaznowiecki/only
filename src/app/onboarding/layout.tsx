export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 px-4 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
