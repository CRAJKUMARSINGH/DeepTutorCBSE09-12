import { Link } from "wouter";
import { useGetDashboard } from "@workspace/api-client-react";
import { BookOpen, FileText, CheckCircle, ArrowRight, BookMarked, Activity, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading";
import { SubjectIcon } from "@/components/subject-icon";

export default function Home() {
  const { data: dashboard, isLoading, isError } = useGetDashboard();

  if (isLoading) return <LoadingState text="Loading your dashboard..." />;
  if (isError || !dashboard) return <div className="text-center p-12 text-destructive">Failed to load dashboard. Please try again.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-3">Welcome back!</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your CBSE study companion is ready. Pick up where you left off or start a new chapter today. We're here to help you master the concepts.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <Card className="bg-white hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Practice Questions</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
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
            {dashboard.recentChapters.map((chapter) => (
              <Card key={chapter.id} className="flex flex-col hover-elevate transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      Ch {chapter.chapterNumber}
                    </Badge>
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
                    <Button variant="secondary" size="sm" className="gap-1">
                      Study <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold tracking-tight">By Grade</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboard.gradeSummaries.map((summary) => (
            <Link key={summary.grade} href={`/subjects?grade=${summary.grade}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group hover-elevate">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold text-primary">{summary.grade}</span>
                  </div>
                  <CardTitle>Grade {summary.grade}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  <div>{summary.subjectCount} Subjects</div>
                  <div>{summary.totalChapters} Chapters</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}