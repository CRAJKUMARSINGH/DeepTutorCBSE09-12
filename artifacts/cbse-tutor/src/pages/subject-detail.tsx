import { Link, useParams } from "wouter";
import { useListChapters, useListSubjects } from "@workspace/api-client-react";
import { ChevronLeft, BookOpen, FileText, CheckCircle, ChevronRight, LayoutList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading";
import { SubjectIcon } from "@/components/subject-icon";

export default function SubjectDetail() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId || "0");

  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const { data: chapters, isLoading: isLoadingChapters, isError } = useListChapters(subjectId, {
    query: { enabled: !!subjectId }
  });

  const subject = subjects?.find(s => s.id === subjectId);

  if (isLoadingSubjects || isLoadingChapters) return <LoadingState text="Loading subject details..." />;
  if (isError || !chapters || !subject) return <div className="text-center p-12 text-destructive">Failed to load subject.</div>;

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
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">{subject.name}</h1>
              <Badge variant="outline" className="text-sm">Grade {subject.grade}</Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mb-4">
              {subject.description}
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <LayoutList className="h-4 w-4 text-primary" />
                {chapters.length} Chapters
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-secondary" />
                {chapters.reduce((acc, c) => acc + c.questionCount, 0)} Practice Questions
              </span>
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
            chapters.map((chapter, index) => (
              <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
                <Card className="hover-elevate cursor-pointer transition-all group overflow-hidden border-l-4" style={{ borderLeftColor: subject.color || 'hsl(var(--primary))' }}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                      <div className="bg-muted/30 p-6 flex flex-col items-center justify-center sm:w-32 border-b sm:border-b-0 sm:border-r shrink-0">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Chapter</span>
                        <span className="text-3xl font-black" style={{ color: subject.color || 'hsl(var(--primary))' }}>
                          {chapter.chapterNumber}
                        </span>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {chapter.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 max-w-3xl">
                            {chapter.summary}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-6 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                          <div className="flex flex-col items-center sm:items-end text-sm">
                            <span className="font-semibold text-foreground">{chapter.questionCount}</span>
                            <span className="text-muted-foreground text-xs">Questions</span>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}