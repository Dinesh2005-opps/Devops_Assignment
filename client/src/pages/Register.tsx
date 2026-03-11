import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User, MapPin, Phone, Building2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Register() {
  const { register, isRegistering } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Extract role from URL query param if present
  const [role, setRole] = useState<'donor' | 'orphanage'>('donor');
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    if (roleParam === 'orphanage') setRole('orphanage');
  }, [location]);

  const [formData, setFormData] = useState({
    email: "", password: "", name: "", location: "", contactNumber: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ ...formData, role });
      toast({ title: "Account created successfully!", variant: "default" });
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-full flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full space-y-8 bg-card p-8 sm:p-12 rounded-3xl shadow-2xl border border-border/50">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-6">
              <Heart size={24} className="fill-primary" /> Orpha.
            </Link>
            <h1 className="text-3xl font-display font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">Join our community to make a difference.</p>
          </div>

          <div className="flex p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                role === 'donor' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              I'm a Donor
            </button>
            <button
              type="button"
              onClick={() => setRole('orphanage')}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                role === 'orphanage' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              I'm an Orphanage
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={role === 'donor' ? "Full Name" : "Orphanage Name"}
              name="name" required
              placeholder={role === 'donor' ? "John Doe" : "Hope Orphanage"}
              icon={role === 'donor' ? <User size={18} /> : <Building2 size={18} />}
              value={formData.name} onChange={handleChange}
            />
            <Input
              label="Email Address"
              name="email" type="email" required
              placeholder="you@example.com"
              icon={<Mail size={18} />}
              value={formData.email} onChange={handleChange}
            />
            <Input
              label="Password"
              name="password" type="password" required
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={formData.password} onChange={handleChange}
            />

            {role === 'orphanage' && (
              <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                <Input
                  label="Location / Address"
                  name="location" required
                  placeholder="City, Country"
                  icon={<MapPin size={18} />}
                  value={formData.location} onChange={handleChange}
                />
                <Input
                  label="Contact Number"
                  name="contactNumber" required
                  placeholder="+1 (555) 000-0000"
                  icon={<Phone size={18} />}
                  value={formData.contactNumber} onChange={handleChange}
                />
              </div>
            )}
            
            <Button type="submit" variant="primary" className="w-full pt-2" isLoading={isRegistering}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
