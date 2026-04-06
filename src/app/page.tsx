import { auth, signOut } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-4 rounded-xl border p-8">
        <h1 className="text-2xl font-semibold">Hola, {session.user.name ?? session.user.email}</h1>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">ID:</span> {session.user.id}</p>
          <p><span className="font-medium text-foreground">Email:</span> {session.user.email}</p>
          <p><span className="font-medium text-foreground">Nombre:</span> {session.user.name ?? "—"}</p>
          <p><span className="font-medium text-foreground">Username:</span> {session.user.username ?? "—"}</p>
          <p><span className="font-medium text-foreground">Tipo:</span> {session.user.userType === "creator" ? "Creador" : "Fan"}</p>
        </div>

        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/sign-in" })
          }}
        >
          <button
            type="submit"
            className="mt-4 rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
