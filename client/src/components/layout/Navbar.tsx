import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Heart, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b-0 border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Heart className="text-white fill-white" size={20} />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              Orpha<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Link href={user.role === "orphanage" ? "/orphanage" : "/donor"}>
                  <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon size={18} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                    <LogOut size={18} />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button variant="primary">Start Helping</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
