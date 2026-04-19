import React from "react";
import { Link, useParams } from "wouter";
import { useGetChapter } from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight, BookOpen, MessageSquare, BrainCircuit, Target, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useProgress } from "@/hooks/useProgress";
import { Video, Image as ImageIcon, Sparkles, BookOpen as BookOpenIcon } from "lucide-react";
import { GeoGebraRenderer } from "@/components/geogebra-renderer";
import { ManimRenderer } from "@/components/manim-renderer";

export default function ChapterDetail() {
  const params = useParams();
  const chapterId = parseInt(params.chapterId || "0");

  const { data: chapter, isLoading, isError } = useGetChapter(chapterId, {
    query: { enabled: !!chapterId } as any
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
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-sm py-1">
                Chapter {chapter.chapterNumber}
              </Badge>
              {chapter.subjectId === 5 /* Assumed Hindi subjectId from seed script */ && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 text-sm py-1 hindi-text">
                  हिन्दी
                </Badge>
              )}
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${chapter.subjectId === 5 ? 'hindi-text' : ''}`}>{chapter.title}</h1>
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
            <Link href={`/?chapter=${encodeURIComponent(chapter.title)}&grade=${chapter.grade ?? ""}&subject=${encodeURIComponent(chapter.subjectName ?? "")}`}>
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/50 rounded-xl h-12">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="lesson" className="rounded-lg data-[state=active]:shadow-sm">Lesson Study</TabsTrigger>
            <TabsTrigger value="visuals" className="rounded-lg data-[state=active]:shadow-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" /> Visuals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-300">
            <div className="prose prose-blue max-w-none">
              <div className="bg-muted/30 p-6 rounded-2xl text-lg leading-relaxed text-foreground border border-muted">
                <h3 className="flex items-center gap-2 text-xl font-bold mt-0 mb-4 text-primary">
                  <BookOpen className="h-5 w-5" /> Summary
                </h3>
                <p className="mb-0">{chapter.summary}</p>
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
                <div className="grid gap-4">
                  {chapter.keyConcepts.map((concept, idx) => (
                    <Card key={concept.id} className="overflow-hidden border shadow-sm hover:border-primary/30 transition-colors">
                      <CardHeader className="bg-muted/10 pb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {idx + 1}
                          </div>
                          <CardTitle className="text-lg">{concept.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 text-muted-foreground leading-relaxed">
                        {concept.explanation}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lesson" className="animate-in fade-in duration-300">
            {chapter.lessonStudy ? (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-muted shadow-sm">
                <MarkdownRenderer content={chapter.lessonStudy} />
              </div>
            ) : (
              <div className="text-center p-20 bg-muted/10 rounded-3xl border border-dashed flex flex-col items-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground">Detailed Lesson Study coming soon</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">We are preparing original NCERT lesson studies for this chapter.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="visuals" className="animate-in fade-in duration-300">
            {(!chapter.visuals || chapter.visuals.length === 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center opacity-60">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold">Interactive GeoGebra</h3>
                  <p className="text-muted-foreground text-sm mt-2">Dynamic geometric constructions and graphs coming soon.</p>
                </Card>
                <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center opacity-60">
                  <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                    <Video className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold">Manim Animations</h3>
                  <p className="text-muted-foreground text-sm mt-2">Mathematical visualizations powered by Python animations.</p>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {chapter.visuals.map((visual, idx) => (
                  <React.Fragment key={`${visual.id}-${idx}`}>
                    {visual.type === "geogebra" && (
                      <GeoGebraRenderer id={visual.id} title={visual.title} />
                    )}
                    {visual.type === "manim" && (
                      <ManimRenderer url={visual.id} title={visual.title} thumbnail={visual.thumbnail} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-secondary/5 rounded-3xl p-8 border border-secondary/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left mt-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Need help with this chapter?</h3>
          <p className="text-muted-foreground">Ask DeepTutor to explain concepts, generate revision notes, or quiz you.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <Link href={`/?chapter=${encodeURIComponent(chapter.title)}&subject=${encodeURIComponent(chapter.subjectName ?? "")}`}>
            <Button variant="outline" className="gap-2 border-secondary text-secondary hover:bg-secondary/10">
              <MessageSquare className="h-4 w-4" /> Explain this chapter
            </Button>
          </Link>
          <Link href={`/?chapter=${encodeURIComponent(chapter.title)}&subject=${encodeURIComponent(chapter.subjectName ?? "")}&q=${encodeURIComponent("Give me revision notes for this chapter")}`}>
            <Button variant="outline" className="gap-2 border-secondary text-secondary hover:bg-secondary/10">
              <Sparkles className="h-4 w-4" /> Revision notes
            </Button>
          </Link>
          <Link href={`/?chapter=${encodeURIComponent(chapter.title)}&subject=${encodeURIComponent(chapter.subjectName ?? "")}&q=${encodeURIComponent("Quiz me on this chapter with 5 MCQs")}`}>
            <Button variant="secondary" className="gap-2">
              <BrainCircuit className="h-4 w-4" /> Quiz me
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left mt-4">
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
