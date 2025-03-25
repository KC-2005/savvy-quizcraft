
import React, { useState } from 'react';
import { ExamResult, Difficulty } from '@/types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Printer, RotateCcw, ExternalLink } from 'lucide-react';

interface ExamOutputProps {
  examResult: ExamResult | null;
  onReset: () => void;
}

const ExamOutput: React.FC<ExamOutputProps> = ({ examResult, onReset }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  
  if (!examResult) return null;
  
  const { questions, config, timestamp } = examResult;
  
  const difficultyColors: Record<Difficulty, string> = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // Create exam content for download
    let content = `# Generated Exam\n`;
    content += `Date: ${formatDate(timestamp)}\n`;
    content += `Questions: ${questions.length}\n\n`;
    
    // Add questions
    questions.forEach((q, i) => {
      content += `## Question ${i + 1} (${q.difficulty} - ${q.topic})\n`;
      content += `${q.text}\n\n`;
      
      if (q.options && q.options.length > 0) {
        content += `Options:\n`;
        q.options.forEach((option, j) => {
          content += `${String.fromCharCode(65 + j)}. ${option}\n`;
        });
        content += '\n';
      }
      
      content += `Answer: ${q.answer}\n`;
      
      if (q.explanation) {
        content += `Explanation: ${q.explanation}\n`;
      }
      
      content += `\n---\n\n`;
    });
    
    // Create download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-${new Date(timestamp).toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto mb-8"
    >
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Generated Exam</CardTitle>
              <CardDescription>
                {formatDate(timestamp)} • {questions.length} questions
              </CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <FileDown className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-6">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="pb-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Question {index + 1}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`chip ${difficultyColors[question.difficulty]}`}>
                        {question.difficulty}
                      </span>
                      <span className="chip bg-secondary text-secondary-foreground">
                        {question.topic}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-base">{question.text}</p>
                  
                  {question.options && question.options.length > 0 && (
                    <div className="mt-2 pl-4 space-y-1">
                      {question.options.map((option, i) => (
                        <div key={i} className="flex items-start">
                          <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {showAnswers && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 pl-4 pt-2 border-t border-border/50"
                      >
                        <p className="font-medium">Answer:</p>
                        <p className="text-sm">{question.answer}</p>
                        
                        {question.explanation && (
                          <div className="mt-2">
                            <p className="font-medium">Explanation:</p>
                            <p className="text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {index < questions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
          <Button 
            variant="outline" 
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Generate New Exam
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ExamOutput;
