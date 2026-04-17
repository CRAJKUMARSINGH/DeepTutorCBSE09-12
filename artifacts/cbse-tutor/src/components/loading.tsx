import { Loader2 } from "lucide-react";

export function LoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in duration-500">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">{text}</p>
    </div>
  );
}