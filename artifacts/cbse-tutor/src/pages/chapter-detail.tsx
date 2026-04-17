import { Link, useParams } from "wouter";
import { useGetChapter } from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight, BookOpen, MessageSquare, BrainCircuit, Target, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "@/hooks/useProgress";

export default function ChapterDetail() {
  const params = useParams();
  const chapterId = parseInt(params.chapterId || "0");

  const { data: chapter, isLoading, isError } = useGetChapter(chapterId, {
    query: { enabled: !!chapterId }
  });

  const { completedIds, toggleComplete, isMarkingComplete, isUnmarking } = useProgress();
  const isCompleted = completedIds.has(chapterId);
  const isToggling = isMarkingComplete || isUnmarking;

  if (isLoading) return <LoadingState text="Loading chapter..." />;
  if (isError || !chapter) return <div className="text-center p-12 text-destructive">Failed to load chapter.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <Link href={`/subjects/${chapter.subjectId}`}>
        <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Subject
        </Button>
      </Link>

      <div className="bg-white rounded-3xl p-8 md:p-10 border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 text-sm py-1">
              Chapter {chapter.chapterNumber}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{chapter.title}</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant={isCompleted ? "default" : "outline"}
              className={`w-full sm:w-auto gap-2 transition-all ${isCompleted ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "border-green-600 text-green-700 hover:bg-green-50"}`}
              onClick={() => toggleComplete(chapterId)}
              disabled={isToggling}
            >
              {isCompleted ? (
                <><CheckCircle2 className="h-4 w-4" /> Completed</>
              ) : (
                <><Circle className="h-4 w-4" /> Mark Complete</>
              )}
            </Button>
            <Link href="/tutor">
              <Button variant="secondary" className="w-full sm:w-auto gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <MessageSquare className="h-4 w-4" /> Ask AI Tutor
              </Button>
            </Link>
            <Link href={`/practice/${chapter.id}`}>
              <Button className="w-full sm:w-auto gap-2">
                <Target className="h-4 w-4" /> Practice ({chapter.questionCount})
              </Button>
            </Link>
          </div>
        </div>

        {isCompleted && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-700 font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            You have marked this chapter as complete. Great work!
          </div>
        )}

        <div className="prose prose-blue max-w-none">
          <div className="bg-muted/30 p-6 rounded-2xl text-lg leading-relaxed text-foreground border border-muted">
            <h3 className="flex items-center gap-2 text-xl font-bold mt-0 mb-4 text-primary">
              <BookOpen className="h-5 w-5" /> Summary
            </h3>
            <p className="mb-0">{chapter.summary}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <BrainCircuit className="h-7 w-7 text-secondary" />
          <h2 className="text-2xl font-bold tracking-tight">Key Concepts</h2>
        </div>
        
        {chapter.keyConcepts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-dashed text-muted-foreground">
            No key concepts available yet.
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4" defaultValue={chapter.keyConcepts.map(c => `concept-${c.id}`)}>
            {chapter.keyConcepts.map((concept, idx) => (
              <AccordionItem 
                key={concept.id} 
                value={`concept-${concept.id}`}
                className="bg-white border rounded-xl overflow-hidden shadow-sm data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/20 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-lg font-semibold">{concept.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <Separator className="mb-4" />
                  <div className="pl-12 text-muted-foreground leading-relaxed text-[1.05rem]">
                    {concept.explanation}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left mt-12">
        <div>
          <h3 className="text-xl font-bold mb-2">Ready to test your knowledge?</h3>
          <p className="text-muted-foreground">Practice questions are tailored to this chapter's concepts.</p>
        </div>
        <Link href={`/practice/${chapter.id}`}>
          <Button size="lg" className="gap-2 w-full md:w-auto shadow-md">
            Start Practice <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
