import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface SolutionStepsProps {
  solution: string;
}

export function SolutionSteps({ solution }: SolutionStepsProps) {
  let steps: string[] = [];
  let finalAnswer = '';

  const finalAnswerMarker = 'Final Answer:';
  const finalAnswerIndex = solution.indexOf(finalAnswerMarker);
  
  let stepsPart = solution;
  if (finalAnswerIndex !== -1) {
    stepsPart = solution.substring(0, finalAnswerIndex).trim();
    finalAnswer = solution.substring(finalAnswerIndex + finalAnswerMarker.length).trim();
  }
  
  // Split by "Step X:"
  if (stepsPart.includes('Step 1:')) {
    stepsPart.split(/\n?(?=Step \d+:)/).forEach(s => {
      if(s.trim()) steps.push(s.trim());
    });
  } else if (stepsPart.match(/^\s*1\./m)) { // Split by "1."
     stepsPart.split(/\n(?=\d+\.)/).forEach(s => {
      if(s.trim()) steps.push(s.trim());
     });
  } else {
    steps.push(stepsPart);
  }

  if (steps.length === 0 && !finalAnswer) {
    // Fallback for plain text
    return (
      <div className="text-sm space-y-2">
        <p>{solution}</p>
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        // Extract title (Step X: ...) and content
        const lines = step.split('\n');
        const titleLine = lines[0];
        const content = lines.slice(1).join('\n').trim();

        const titleMatch = titleLine.match(/^(?:Step \d+:|(?:\d+\.))\s*(.*)/);
        const title = titleMatch ? titleMatch[1] : titleLine;

        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-full bg-primary text-primary-foreground font-headline font-bold">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px flex-grow bg-border" />
              )}
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <p className="font-bold text-foreground font-headline leading-tight">
                {title}
              </p>
              {content && <p className="text-muted-foreground text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
               />}
            </div>
          </div>
        );
      })}

      {finalAnswer && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-full bg-accent text-accent-foreground font-headline font-bold">
                <Star className="h-5 w-5"/>
              </div>
          </div>
          <div className="flex-1 space-y-1 pt-1">
              <p className="font-bold text-foreground font-headline leading-tight">
                Final Answer
              </p>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: finalAnswer.replace(/\n/g, '<br />') }}
               />
            </div>
        </div>
      )}
    </div>
  );
}
