"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { getInitialSolution, getRefinedSolution, saveFeedback } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Bot, BrainCircuit, Loader2, Send, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { SolutionSteps } from "./solution-steps";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isRefined?: boolean;
  feedbackGiven?: boolean;
  isMathQuestion?: boolean;
};

type RefinableState = {
  question: string;
  solution: string;
  messageId: string;
};

function FeedbackForm({ 
  message, 
  onSubmit 
}: { 
  message: Message, 
  onSubmit: (feedback: string, rating: 'good' | 'bad', messageId: string) => void 
}) {
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRating = (newRating: 'good' | 'bad') => {
    setRating(newRating);
    startTransition(async () => {
      await saveFeedback(conversation.find(m => m.role === 'user')?.content || '', message.content, newRating, null);
      if (newRating === 'good') {
        toast({ title: "Feedback received!", description: "Thank you for helping us improve." });
        onSubmit('', 'good', message.id);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || rating !== 'bad') return;
    startTransition(async () => {
      await saveFeedback(conversation.find(m => m.role === 'user')?.content || '', message.content, 'bad', text);
      onSubmit(text, 'bad', message.id);
    });
  };

  const conversation = useConversation();

  return (
    <div className="mt-4 p-4 border rounded-lg bg-background">
      <h4 className="text-sm font-semibold mb-2 text-foreground">Was this solution helpful?</h4>
      <div className="flex gap-2 mb-2">
        <Button 
          variant={rating === 'good' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => handleRating('good')}
          disabled={isPending}
          className={cn("h-8 gap-1", rating === 'good' && 'bg-green-600 hover:bg-green-700 text-primary-foreground border-green-600')}
        >
          <ThumbsUp className="h-4 w-4" /> Good
        </Button>
        <Button 
          variant={rating === 'bad' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => handleRating('bad')}
          disabled={isPending}
          className={cn("h-8 gap-1", rating === 'bad' && 'bg-red-600 hover:bg-red-700 text-primary-foreground border-red-600')}
        >
          <ThumbsDown className="h-4 w-4" /> Bad
        </Button>
      </div>
      {rating === 'bad' && (
        <form onSubmit={handleSubmit} className="space-y-2 mt-4">
          <Textarea 
            placeholder="Please tell us what could be improved..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm"
            disabled={isPending}
          />
          <Button type="submit" size="sm" disabled={!text.trim() || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Feedback
          </Button>
        </form>
      )}
    </div>
  );
}

const ConversationContext = React.createContext<Message[]>([]);
const useConversation = () => React.useContext(ConversationContext);

export function MathSolver() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewport.current) {
      scrollViewport.current.scrollTo({ top: scrollViewport.current.scrollHeight, behavior: "smooth" });
    }
  }, [conversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setConversation((prev) => [...prev, userMessage]);
    const currentQuestion = input;
    setInput("");

    startTransition(async () => {
      const result = await getInitialSolution(currentQuestion);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        setConversation(prev => prev.slice(0, -1)); // remove user message on error
      } else if (result.solution) {
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = { id: assistantMessageId, role: "assistant", content: result.solution, isMathQuestion: result.isMathQuestion };
        setConversation((prev) => [...prev, assistantMessage]);
      }
    });
  };
  
  const handleFeedbackSubmit = (feedback: string, rating: 'good' | 'bad', messageId: string) => {
      const targetMessage = conversation.find(msg => msg.id === messageId);
      if(!targetMessage) return;

      const currentRefinable: RefinableState = {
        question: conversation.find(msg => msg.role === 'user' && msg.id < messageId)?.content || '',
        solution: targetMessage.content,
        messageId: messageId,
      }

      const updateConversationWithFeedback = (updatedContent?: string) => {
        setConversation(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, content: updatedContent || msg.content, feedbackGiven: true, isRefined: !!updatedContent } : msg
        ));
      }

      if (rating === 'good') {
        updateConversationWithFeedback();
        return;
      }
      
      startTransition(async () => {
        if (!currentRefinable.question) {
            toast({ title: 'Error', description: "Could not find the original question for this solution.", variant: 'destructive' });
            return;
        }

        const result = await getRefinedSolution(currentRefinable.question, currentRefinable.solution, feedback);
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else if (result.solution) {
            toast({ title: "Solution Updated", description: "The solution has been refined based on your feedback." });
            updateConversationWithFeedback(result.solution);
        }
      });
  };

  return (
    <ConversationContext.Provider value={conversation}>
      <div className="container mx-auto max-w-4xl h-full flex flex-col py-4">
        <div className={cn("flex-1 flex flex-col justify-center", conversation.length > 0 && 'hidden')}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <BrainCircuit className="h-8 w-8 text-primary"/> Welcome to MathMind AI!
              </CardTitle>
              <CardDescription>
                I am your personal math tutor. Ask me any math question, and I'll provide a step-by-step solution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">For example: <strong className="text-foreground">How do I solve 2x^2 + 5x - 3 = 0?</strong></p>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className={cn("flex-1 mb-4", conversation.length === 0 && 'hidden')} viewportRef={scrollViewport}>
          <div className="space-y-6 pr-4">
            {conversation.map((message) => (
              <div key={message.id} className={cn("flex items-start gap-4", message.role === "user" && "justify-end")}>
                {message.role === "assistant" && (
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-xl rounded-lg p-4", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border")}>
                  {message.role === 'user' ? (
                    <p>{message.content}</p>
                  ) : (
                    <>
                      {message.isRefined && <p className="text-sm font-semibold text-accent-foreground mb-2 p-2 bg-accent/20 rounded-md">This solution has been refined based on your feedback.</p>}
                      
                      {message.isMathQuestion ? (
                        <SolutionSteps solution={message.content} />
                      ) : (
                        <p>{message.content}</p>
                      )}

                      {!message.feedbackGiven && !isPending && message.isMathQuestion && (
                          <FeedbackForm message={message} onSubmit={handleFeedbackSubmit} />
                      )}
                    </>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar>
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && conversation[conversation.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                  </Avatar>
                  <div className="max-w-xl rounded-lg p-4 bg-card border flex items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="sticky bottom-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-background border rounded-lg shadow-sm">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a math question..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              disabled={isPending}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isPending}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </ConversationContext.Provider>
  );
}
