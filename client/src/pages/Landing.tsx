import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Heart, Globe2, ShieldCheck, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            <Heart size={16} className="fill-primary" />
            <span>Connecting hearts with needs</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight">
            Support Orphanages <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Near You.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Hope Bridge connects generous donors directly with orphanages in need. 
            Whether it's essential supplies or monetary support, your contribution 
            makes an immediate, transparent impact.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/register?role=donor">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-lg gap-2 group">
                I want to help
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register?role=orphanage">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg bg-white/50 backdrop-blur-sm">
                I represent an orphanage
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left"
        >
          {[
            { icon: <Globe2 size={32} />, title: "Find Local Needs", desc: "Discover orphanages in your area and see exactly what they need right now." },
            { icon: <Heart size={32} />, title: "Direct Impact", desc: "Donate specific items or funds directly to the orphanage, cutting out the middleman." },
            { icon: <ShieldCheck size={32} />, title: "Transparent Updates", desc: "Track your donation status and see when needs are marked as fulfilled." },
          ].map((feature, i) => (
            <div key={i} className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
