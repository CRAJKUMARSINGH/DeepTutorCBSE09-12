import { useState, useEffect, useRef } from "react";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation, 
  useGetOpenaiConversation,
  useDeleteOpenaiConversation 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Send, Bot, User, Trash2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default function Tutor() {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isLoadingList } = useListOpenaiConversations();
  const { data: activeConversation, isLoading: isLoadingChat } = useGetOpenaiConversation(
    activeConversationId as number,
    { query: { enabled: !!activeConversationId } }
  );

  const createChat = useCreateOpenaiConversation();
  const deleteChat = useDeleteOpenaiConversation();

  // Auto-select first conversation or create new
  useEffect(() => {
    if (conversations && !activeConversationId) {
      if (conversations.length > 0) {
        setActiveConversationId(conversations[0].id);
      } else if (!createChat.isPending) {
        handleNewChat();
      }
    }
  }, [conversations, activeConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, streamedResponse]);

  const handleNewChat = () => {
    createChat.mutate(
      { data: { title: "New Study Session" } },
      {
        onSuccess: (chat) => {
          queryClient.invalidateQueries({ queryKey: ["/api/openai/conversations"] });
          setActiveConversationId(chat.id);
        }
      }
    );
  };

  const handleDeleteChat = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/openai/conversations"] });
          if (activeConversationId === id) {
            setActiveConversationId(null);
          }
        }
      }
    );
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversationId || isStreaming) return;

    const messageText = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamedResponse("");

    // Optimistically update UI
    const tempUserMessage = {
      id: Date.now(),
      conversationId: activeConversationId,
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(
      [`/api/openai/conversations/${activeConversationId}`],
      (old: any) => old ? {
        ...old,
        messages: [...old.messages, tempUserMessage]
      } : old
    );

    try {
      const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${BASE_URL}/api/openai/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6);
            if (dataStr === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                accumulatedResponse += data.content;
                setStreamedResponse(accumulatedResponse);
              }
            } catch (e) {
              console.error("Error parsing SSE data", e);
            }
          }
        }
      }

      // After streaming finishes, refetch the conversation to get canonical DB messages
      queryClient.invalidateQueries({ queryKey: [`/api/openai/conversations/${activeConversationId}`] });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsStreaming(false);
      setStreamedResponse("");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-3xl overflow-hidden border shadow-sm bg-white animate-in fade-in duration-500">
      
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r bg-muted/10 flex flex-col hidden md:flex">
        <div className="p-4 border-b bg-white">
          <Button 
            className="w-full justify-start gap-2 shadow-sm" 
            onClick={handleNewChat}
            disabled={createChat.isPending}
          >
            {createChat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {isLoadingList ? (
              <div className="flex justify-center p-4 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : conversations?.map(chat => (
              <div
                key={chat.id}
                onClick={() => setActiveConversationId(chat.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeConversationId === chat.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`h-4 w-4 shrink-0 ${activeConversationId === chat.id ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
                  <div className="truncate text-sm font-medium">
                    {chat.title}
                    <div className={`text-xs truncate ${activeConversationId === chat.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(chat.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 opacity-0 group-hover:opacity-100 ${activeConversationId === chat.id ? "hover:bg-primary-foreground/20 text-primary-foreground" : "hover:bg-destructive/10 text-destructive"}`}
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground mb-1">
            <Sparkles className="h-3 w-3 text-primary" /> AI Tutor System
          </div>
          Trained specifically on CBSE curriculum guidelines (Grades 9-12).
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden border-b p-3 flex justify-between items-center bg-white">
          <span className="font-bold text-primary">Tutor Chat</span>
          <Button variant="outline" size="sm" onClick={handleNewChat}><Plus className="h-4 w-4 mr-2" /> New</Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
          {!activeConversationId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Bot className="h-16 w-16 text-primary/20 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Your CBSE AI Tutor</h2>
              <p className="text-muted-foreground max-w-md">
                Ask me any questions about your syllabus, request explanations for tough concepts, or ask for practice problems.
              </p>
            </div>
          ) : isLoadingChat ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              {activeConversation?.messages.map((msg, i) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className={`h-10 w-10 shrink-0 ${msg.role === "user" ? "bg-primary/10" : "bg-secondary/10"}`}>
                    {msg.role === "user" ? (
                      <User className="h-5 w-5 text-primary m-auto" />
                    ) : (
                      <Bot className="h-5 w-5 text-secondary m-auto" />
                    )}
                  </Avatar>
                  <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div 
                      className={`p-4 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-muted/40 text-foreground border rounded-tl-sm prose prose-sm max-w-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Streaming UI */}
              {isStreaming && (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0 bg-secondary/10">
                    <Bot className="h-5 w-5 text-secondary m-auto" />
                  </Avatar>
                  <div className="flex flex-col items-start max-w-[80%]">
                    <div className="p-4 rounded-2xl bg-muted/40 text-foreground border rounded-tl-sm prose prose-sm max-w-none">
                      {streamedResponse ? (
                        <div className="whitespace-pre-wrap leading-relaxed">{streamedResponse}<span className="animate-pulse">|</span></div>
                      ) : (
                        <div className="flex gap-1 h-6 items-center">
                          <div className="w-2 h-2 rounded-full bg-secondary/50 animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-secondary/50 animate-bounce delay-75" />
                          <div className="w-2 h-2 rounded-full bg-secondary/50 animate-bounce delay-150" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form 
            onSubmit={sendMessage}
            className="max-w-3xl mx-auto relative flex items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your tutor anything..."
              className="pr-14 py-6 text-base rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary shadow-inner"
              disabled={!activeConversationId || isStreaming}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 rounded-full h-10 w-10 shadow-sm"
              disabled={!input.trim() || !activeConversationId || isStreaming}
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </form>
          <div className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="h-3 w-3" /> AI can make mistakes. Verify important facts with your textbook.
          </div>
        </div>
      </div>
    </div>
  );
}