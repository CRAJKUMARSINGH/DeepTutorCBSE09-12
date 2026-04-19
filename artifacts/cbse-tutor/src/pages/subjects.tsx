import { useState } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { useListSubjects } from "@workspace/api-client-react";
import { Search, Filter, BookOpen, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LoadingState } from "@/components/loading";
import { SubjectIcon } from "@/components/subject-icon";

export default function Subjects() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialGrade = searchParams.get("grade") ? parseInt(searchParams.get("grade")!) : undefined;
  
  const [gradeFilter, setGradeFilter] = useState<string>(initialGrade ? initialGrade.toString() : "all");

  const { data: subjects, isLoading, isError } = useListSubjects(
    gradeFilter !== "all" ? { grade: parseInt(gradeFilter) } : undefined
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Curriculum
          </h1>
          <p className="text-muted-foreground">
            Browse CBSE subjects by grade. Dive into chapters and master the concepts.
          </p>
        </div>

        <div className="bg-white p-1 rounded-lg border shadow-sm">
          <ToggleGroup type="single" value={gradeFilter} onValueChange={(v) => v && setGradeFilter(v)}>
            <ToggleGroupItem value="all" className="px-4">All</ToggleGroupItem>
            <ToggleGroupItem value="9" className="px-4">Grade 9</ToggleGroupItem>
            <ToggleGroupItem value="10" className="px-4">Grade 10</ToggleGroupItem>
            <ToggleGroupItem value="11" className="px-4">Grade 11</ToggleGroupItem>
            <ToggleGroupItem value="12" className="px-4">Grade 12</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Loading subjects..." />
      ) : isError || !subjects ? (
        <div className="text-center p-12 text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
          Failed to load subjects. Please try again.
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-xl border border-dashed">
          <p className="text-lg text-muted-foreground">No subjects found for this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, i) => (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <Card className="h-full flex flex-col hover-elevate transition-all duration-300 cursor-pointer border-t-4" style={{ borderTopColor: subject.color || 'hsl(var(--primary))' }}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <SubjectIcon name={subject.icon} className="h-12 w-12" />
                    <Badge variant="secondary" className="font-semibold bg-secondary/10 text-secondary-foreground border-secondary/20">
                      Grade {subject.grade}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">{subject.description}</CardDescription>
                </CardHeader>
                <div className="flex-1" />
                <CardFooter className="pt-4 border-t bg-muted/10 flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {subject.chapterCount} Chapters
                  </div>
                  <span className="text-primary font-medium group-hover:underline">Explore</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}