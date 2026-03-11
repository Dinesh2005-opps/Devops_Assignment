import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast({ title: "Welcome back!", variant: "default" });
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side Image - Unsplash orphanage/children helping image */}
      {/* landing page hero scenic child looking happy */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
          alt="Children smiling"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-md">
          <Heart className="w-12 h-12 text-accent mb-6 fill-accent" />
          <h2 className="text-4xl font-display font-bold mb-4">Together we can make a difference.</h2>
          <p className="text-white/80 text-lg">Join thousands of donors bringing smiles to children's faces every day.</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-8">
              <Heart size={24} className="fill-primary" /> Hope Bridge
            </Link>
            <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Log in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoggingIn}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
