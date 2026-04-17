import { Link, useLocation } from "wouter";
import { BookOpen, Home, MessageSquare, List, Activity } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/subjects", label: "Subjects", icon: BookOpen },
    { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight font-display mr-8">
            <BookOpen className="h-6 w-6" />
            CBSE Guide
          </div>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
