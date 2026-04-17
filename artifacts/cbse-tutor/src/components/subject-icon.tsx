import { Calculator, Beaker, Globe, FlaskConical, Atom, Languages, FunctionSquare, LineChart, Book, BookOpen } from "lucide-react";

export function SubjectIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const iconMap: Record<string, React.ElementType> = {
    "mathematics": Calculator,
    "math": Calculator,
    "physics": Atom,
    "chemistry": FlaskConical,
    "biology": Beaker,
    "science": Globe,
    "english": Languages,
    "history": Book,
    "geography": Globe,
    "economics": LineChart,
    "computer_science": FunctionSquare
  };

  // Try to find a match, otherwise return default book
  const normalizedName = name.toLowerCase().replace(" ", "_");
  const Icon = iconMap[normalizedName] || BookOpen;

  return <Icon className={className} />;
}