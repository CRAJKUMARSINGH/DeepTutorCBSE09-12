import { 
  Calculator, 
  Beaker, 
  Globe, 
  FlaskConical, 
  Atom, 
  Languages, 
  FunctionSquare, 
  LineChart, 
  Book, 
  BookOpen,
  Zap,
  Dna,
  Landmark,
  Users,
  Cpu
} from "lucide-react";

const SUBJECT_CONFIG: Record<string, { icon: any; color: string }> = {
  math: { icon: Calculator, color: "from-blue-500 to-cyan-400" },
  mathematics: { icon: Calculator, color: "from-blue-500 to-cyan-400" },
  science: { icon: Beaker, color: "from-green-500 to-emerald-400" },
  physics: { icon: Zap, color: "from-purple-500 to-indigo-400" },
  chemistry: { icon: FlaskConical, color: "from-orange-500 to-amber-400" },
  biology: { icon: Dna, color: "from-pink-500 to-rose-400" },
  history: { icon: Landmark, color: "from-amber-600 to-yellow-500" },
  geography: { icon: Globe, color: "from-blue-600 to-indigo-500" },
  civics: { icon: Users, color: "from-teal-500 to-cyan-500" },
  economics: { icon: LineChart, color: "from-emerald-600 to-green-500" },
  english: { icon: Languages, color: "from-indigo-600 to-blue-500" },
  hindi: { icon: Languages, color: "from-red-600 to-orange-500" },
  computer: { icon: Cpu, color: "from-slate-700 to-slate-500" },
  computer_science: { icon: Cpu, color: "from-slate-700 to-slate-500" },
};

export function SubjectIcon({ name, className = "" }: { name: string; className?: string }) {
  const normalizedName = name.toLowerCase().replace(" ", "_");
  const config = SUBJECT_CONFIG[normalizedName] || {
    icon: BookOpen,
    color: "from-gray-500 to-slate-400",
  };

  const Icon = config.icon;

  return (
    <div className={`p-2 rounded-xl bg-gradient-to-br ${config.color} shadow-sm flex items-center justify-center ${className}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
  );
}