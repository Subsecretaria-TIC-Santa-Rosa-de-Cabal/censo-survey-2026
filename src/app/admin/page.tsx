import { verifySession } from "@/lib/auth/verify";

export default async function AdminPage() {
  const user = await verifySession();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-3xl font-bold">Bienvenido al panel administrativo</h1>
      <p className="text-muted-foreground">
        Has iniciado sesión correctamente.
      </p>
      {user.email && (
        <p className="text-sm text-muted-foreground">{user.email}</p>
      )}
    </div>
  );
}
