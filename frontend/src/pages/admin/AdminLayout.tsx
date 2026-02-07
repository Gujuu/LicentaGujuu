import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/menu", label: "Menu" },
  { to: "/admin/wines", label: "Wines" },
  { to: "/admin/reservations", label: "Reservations" },
  { to: "/admin/messages", label: "Messages" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream-dark">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-display text-lg">Dei Frati Admin</div>
            <Separator orientation="vertical" className="h-6" />
            <nav className="hidden md:flex items-center gap-2">
              {nav.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Button
                    key={item.to}
                    variant={active ? "olive" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to={item.to}>{item.label}</Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-muted-foreground">{user?.email}</div>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
