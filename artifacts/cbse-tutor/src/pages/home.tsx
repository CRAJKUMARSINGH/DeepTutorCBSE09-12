import { Link } from "wouter";
import { useGetDashboard } from "@workspace/api-client-react";
import { BookOpen, FileText, CheckCircle2, ArrowRight, BookMarked, Activity, ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading";
import { useProgress } from "@/hooks/useProgress";

const GRADE_COLORS: Record<number, string> = {
  9: "#3b82f6",
  10: "#10b981",
  11: "#8b5cf6",
  12: "#f59e0b",
};

export default function Home() {
  const { data: dashboard, isLoading, isError } = useGetDashboard();
  const { completedIds } = useProgress();

  if (isLoading) return <LoadingState text="Loading your dashboard..." />;
  if (isError || !dashboard) return <div className="text-center p-12 text-destructive">Failed to load dashboard. Please try again.</div>;

  const completedCount = completedIds.size;
  const overallPercent = dashboard.totalChapters > 0
    ? Math.round((completedCount / dashboard.totalChapters) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-3">Welcome back!</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your CBSE study companion is ready. Pick up where you left off or start a new chapter today.
        </p>
        {completedCount > 0 && (
          <div className="mt-5 space-y-2 max-w-sm">
            <div className="flex justify-between text-sm font-semibold text-primary">
              <span>{completedCount} of {dashboard.totalChapters} chapters complete</span>
              <span>{overallPercent}%</span>
            </div>
            <div className="w-full bg-primary/15 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-primary transition-all duration-700"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            {overallPercent === 100 && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-yellow-600 mt-1">
                <Trophy className="h-4 w-4" /> Full syllabus complete — outstanding!
              </p>
            )}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-white hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{dashboard.totalSubjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-white hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Chapters</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{dashboard.totalChapters}</div>
          </CardContent>
        </Card>
        <Card className="bg-white hover-elevate border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chapters Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Practice Questions</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{dashboard.totalQuestions}</div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Recent Chapters
          </h2>
          <Link href="/subjects">
            <Button variant="ghost" className="gap-2 text-primary">
              View all subjects <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {dashboard.recentChapters.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <BookMarked className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>No recent chapters found. Start exploring your subjects!</p>
              <Link href="/subjects" className="mt-4">
                <Button>Browse Subjects</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.recentChapters.map((chapter) => {
              const isCompleted = completedIds.has(chapter.id);
              return (
                <Card
                  key={chapter.id}
                  className={`flex flex-col hover-elevate transition-all duration-300 ${isCompleted ? "border-green-200 bg-green-50/40" : ""}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant="outline"
                        className={isCompleted
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-primary/5 text-primary border-primary/20"
                        }
                      >
                        Ch {chapter.chapterNumber}
                      </Badge>
                      {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <CardTitle className="line-clamp-1">{chapter.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">{chapter.summary}</p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-muted/10 flex justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {chapter.questionCount} Questions
                    </span>
                    <Link href={`/chapters/${chapter.id}`}>
                      <Button variant={isCompleted ? "outline" : "secondary"} size="sm" className="gap-1">
                        {isCompleted ? "Review" : "Study"} <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold tracking-tight">Browse by Grade</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboard.gradeSummaries.map((summary) => {
            const color = GRADE_COLORS[summary.grade] ?? "#3b82f6";
            return (
              <Link key={summary.grade} href={`/subjects?grade=${summary.grade}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group hover-elevate">
                  <CardHeader className="text-center pb-2">
                    <div
                      className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <span className="text-xl font-bold" style={{ color }}>{summary.grade}</span>
                    </div>
                    <CardTitle>Grade {summary.grade}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-muted-foreground">
                    <div>{summary.subjectCount} Subjects</div>
                    <div>{summary.totalChapters} Chapters</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
