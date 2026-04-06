export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Only</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contenido exclusivo de tus creadores favoritos
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
