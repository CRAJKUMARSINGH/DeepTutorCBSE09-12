import { Link, useParams } from "wouter";
import { useListChapters, useListSubjects } from "@workspace/api-client-react";
import { ChevronLeft, BookOpen, CheckCircle, CheckCircle2, ChevronRight, LayoutList, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/loading";
import { SubjectIcon } from "@/components/subject-icon";
import { useProgress } from "@/hooks/useProgress";

export default function SubjectDetail() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId || "0");

  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const { data: chapters, isLoading: isLoadingChapters, isError } = useListChapters(subjectId, {
    query: { enabled: !!subjectId }
  });
  const { completedIds, toggleComplete } = useProgress();

  const subject = subjects?.find(s => s.id === subjectId);

  if (isLoadingSubjects || isLoadingChapters) return <LoadingState text="Loading subject details..." />;
  if (isError || !chapters || !subject) return <div className="text-center p-12 text-destructive">Failed to load subject.</div>;

  const completedCount = chapters.filter(c => completedIds.has(c.id)).length;
  const progressPercent = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/subjects">
        <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Subjects
        </Button>
      </Link>

      <div className="bg-white rounded-3xl p-8 border shadow-sm relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none rounded-bl-[100px]"
          style={{ backgroundColor: subject.color || 'var(--primary)' }}
        />
        
        <div className="flex items-start gap-6 relative z-10">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: subject.color || 'hsl(var(--primary))' }}
          >
            <SubjectIcon name={subject.icon} className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">{subject.name}</h1>
              <Badge variant="outline" className="text-sm">Grade {subject.grade}</Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mb-4">
              {subject.description}
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <LayoutList className="h-4 w-4 text-primary" />
                {chapters.length} Chapters
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-secondary" />
                {chapters.reduce((acc, c) => acc + c.questionCount, 0)} Practice Questions
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Your progress</span>
                <span style={{ color: subject.color || 'hsl(var(--primary))' }}>
                  {completedCount} / {chapters.length} chapters
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: subject.color || 'hsl(var(--primary))'
                  }}
                />
              </div>
              {progressPercent === 100 && (
                <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Syllabus complete!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Syllabus</h2>
        
        <div className="grid gap-4">
          {chapters.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed text-muted-foreground">
              No chapters available for this subject yet.
            </div>
          ) : (
            chapters.map((chapter) => {
              const isCompleted = completedIds.has(chapter.id);
              return (
                <div key={chapter.id} className="relative group">
                  <Link href={`/chapters/${chapter.id}`}>
                    <Card
                      className={`hover-elevate cursor-pointer transition-all overflow-hidden border-l-4 ${isCompleted ? "bg-green-50/50 border-l-green-500" : ""}`}
                      style={!isCompleted ? { borderLeftColor: subject.color || 'hsl(var(--primary))' } : {}}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                          <div
                            className={`p-6 flex flex-col items-center justify-center sm:w-32 border-b sm:border-b-0 sm:border-r shrink-0 ${isCompleted ? "bg-green-100/60" : "bg-muted/30"}`}
                          >
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Chapter</span>
                            <span
                              className="text-3xl font-black"
                              style={!isCompleted ? { color: subject.color || 'hsl(var(--primary))' } : { color: '#16a34a' }}
                            >
                              {chapter.chapterNumber}
                            </span>
                          </div>
                          
                          <div className="p-6 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className={`text-xl font-bold group-hover:text-primary transition-colors ${isCompleted ? "text-green-800" : ""}`}>
                                  {chapter.title}
                                </h3>
                                {isCompleted && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm line-clamp-2 max-w-3xl">
                                {chapter.summary}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-6 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                              <div className="flex flex-col items-center sm:items-end text-sm">
                                <span className="font-semibold text-foreground">{chapter.questionCount}</span>
                                <span className="text-muted-foreground text-xs">Questions</span>
                              </div>
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isCompleted ? "bg-green-100 text-green-700" : "bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground"}`}>
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleComplete(chapter.id); }}
                    className={`absolute right-16 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all z-10
                      ${isCompleted
                        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                        : "bg-white text-muted-foreground border-muted hover:border-green-400 hover:text-green-700 opacity-0 group-hover:opacity-100"
                      }`}
                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    {isCompleted ? "Done" : "Mark done"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
