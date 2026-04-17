import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { useGetChapter, useListPracticeQuestions } from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight, CheckCircle, HelpCircle, ArrowRight, Check, X, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LoadingState } from "@/components/loading";

export default function Practice() {
  const params = useParams();
  const chapterId = parseInt(params.chapterId || "0");
  
  const [difficulty, setDifficulty] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  const { data: chapter, isLoading: isChapterLoading } = useGetChapter(chapterId, {
    query: { enabled: !!chapterId }
  });

  const { data: questions, isLoading: isQuestionsLoading } = useListPracticeQuestions(
    chapterId, 
    difficulty !== "all" ? { difficulty: difficulty as any } : undefined,
    { query: { enabled: !!chapterId } }
  );

  // Reset state when difficulty changes
  useEffect(() => {
    setCurrentIndex(0);
    setRevealed({});
    setSelectedOptions({});
  }, [difficulty]);

  if (isChapterLoading || isQuestionsLoading) return <LoadingState text="Preparing your practice session..." />;
  if (!chapter || !questions) return <div className="text-center p-12 text-destructive">Failed to load practice questions.</div>;

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;

  const handleNext = () => !isLast && setCurrentIndex(prev => prev + 1);
  const handlePrev = () => !isFirst && setCurrentIndex(prev => prev - 1);

  const handleReveal = () => {
    setRevealed(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleOptionSelect = (opt: string) => {
    if (revealed[currentQuestion?.id]) return;
    setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: opt }));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href={`/chapters/${chapter.id}`}>
            <Button variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Chapter
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Practice Session</h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Chapter {chapter.chapterNumber}: {chapter.title}
          </p>
        </div>

        <div className="bg-white p-1 rounded-lg border shadow-sm shrink-0">
          <ToggleGroup type="single" value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
            <ToggleGroupItem value="all" className="px-3">All</ToggleGroupItem>
            <ToggleGroupItem value="easy" className="px-3 text-green-600">Easy</ToggleGroupItem>
            <ToggleGroupItem value="medium" className="px-3 text-yellow-600">Medium</ToggleGroupItem>
            <ToggleGroupItem value="hard" className="px-3 text-red-600">Hard</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
            <HelpCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg">No questions found for this difficulty level.</p>
            <Button variant="outline" className="mt-6" onClick={() => setDifficulty("all")}>
              View All Questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((q, i) => (
                <div 
                  key={q.id} 
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i === currentIndex 
                      ? 'bg-primary' 
                      : revealed[q.id] 
                        ? 'bg-primary/30' 
                        : 'bg-muted'
                  }`} 
                />
              ))}
            </div>
          </div>

          <Card className="bg-white shadow-md border-0 ring-1 ring-border relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${getDifficultyColor(currentQuestion.difficulty).split(' ')[0]}`} />
            
            <CardHeader className="pb-4 pt-8 px-8">
              <div className="flex justify-between items-start mb-6">
                <Badge variant="outline" className={`capitalize ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground">
                  {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                </Badge>
              </div>
              <CardTitle className="text-xl md:text-2xl leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8 space-y-6">
              {currentQuestion.type === 'mcq' && currentQuestion.options && (
                <div className="grid gap-3 mt-4">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = selectedOptions[currentQuestion.id] === opt;
                    const isRevealed = revealed[currentQuestion.id];
                    const isCorrect = opt === currentQuestion.answer;
                    
                    let btnClass = "justify-start h-auto py-4 px-6 text-left font-normal text-base whitespace-normal break-words border-2 ";
                    
                    if (isRevealed) {
                      if (isCorrect) {
                        btnClass += "border-green-500 bg-green-50 text-green-900";
                      } else if (isSelected && !isCorrect) {
                        btnClass += "border-red-500 bg-red-50 text-red-900";
                      } else {
                        btnClass += "border-muted bg-muted/20 opacity-50";
                      }
                    } else if (isSelected) {
                      btnClass += "border-primary bg-primary/5 text-primary";
                    } else {
                      btnClass += "border-muted bg-white hover:border-primary/50 hover:bg-muted/10";
                    }

                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={btnClass}
                        onClick={() => handleOptionSelect(opt)}
                        disabled={isRevealed}
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-start gap-4">
                            <span className="font-bold text-muted-foreground w-6 shrink-0 mt-0.5">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isRevealed && isCorrect && <Check className="h-5 w-5 text-green-600 shrink-0" />}
                          {isRevealed && isSelected && !isCorrect && <X className="h-5 w-5 text-red-600 shrink-0" />}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {revealed[currentQuestion.id] ? (
                <div className="mt-8 bg-muted/30 p-6 rounded-2xl border animate-in fade-in zoom-in-95 duration-300">
                  <h4 className="font-bold text-primary flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5" /> 
                    {currentQuestion.type === 'mcq' ? 'Explanation' : 'Answer & Explanation'}
                  </h4>
                  
                  {currentQuestion.type !== 'mcq' && (
                    <div className="mb-4 p-4 bg-white rounded-xl border font-medium text-lg">
                      {currentQuestion.answer}
                    </div>
                  )}
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              ) : (
                <div className="pt-6 flex justify-center">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-12"
                    onClick={handleReveal}
                    disabled={currentQuestion.type === 'mcq' && !selectedOptions[currentQuestion.id]}
                  >
                    Reveal Answer
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="bg-muted/10 border-t p-4 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrev} 
                disabled={isFirst}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button 
                variant={isLast ? "secondary" : "default"}
                onClick={handleNext} 
                disabled={isLast}
                className="gap-2"
              >
                {isLast ? 'Finish Practice' : 'Next Question'} <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}