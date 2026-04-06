import { auth, signOut } from "@/lib/auth"

export default async function Home() {
  const session = await auth()
  const user = session!.user

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-4 rounded-xl border p-8">
        <h1 className="text-2xl font-semibold">Hola, {user.name ?? user.email}</h1>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">ID:</span> {user.id}</p>
          <p><span className="font-medium text-foreground">Email:</span> {user.email}</p>
          <p><span className="font-medium text-foreground">Nombre:</span> {user.name ?? "—"}</p>
          <p><span className="font-medium text-foreground">Username:</span> {user.username ?? "—"}</p>
          <p><span className="font-medium text-foreground">Tipo:</span> {user.userType === "creator" ? "Creador" : "Fan"}</p>
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
