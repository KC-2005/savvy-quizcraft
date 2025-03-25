
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Question, Difficulty, Topic } from '@/types';
import { questionStore } from '@/utils/questionStore';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

const topics: Topic[] = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
  'Dynamic Programming', 'Sorting', 'Searching', 'Recursion', 'Greedy Algorithms'
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const QuestionForm = () => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  
  const [question, setQuestion] = useState<Partial<Question>>({
    text: '',
    difficulty: 'Medium',
    topic: 'Arrays',
    answer: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!question.text || !question.topic || !question.difficulty || !question.answer) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create complete question object
    const newQuestion: Question = {
      id: uuidv4(),
      text: question.text!,
      difficulty: question.difficulty as Difficulty,
      topic: question.topic as Topic,
      answer: question.answer,
      options: question.options?.split('\n').filter(o => o.trim() !== ''),
      explanation: question.explanation,
    };
    
    // Add question to store
    const success = questionStore.addQuestion(newQuestion);
    
    if (success) {
      toast({
        title: "Question Added",
        description: "Your question has been added to the database."
      });
      
      // Reset form
      setQuestion({
        text: '',
        difficulty: 'Medium',
        topic: 'Arrays',
        answer: '',
        options: '',
        explanation: '',
      });
      
      // Collapse form
      setExpanded(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to add question. It might be a duplicate.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Add New Question</CardTitle>
              <CardDescription>
                Contribute to the question database
              </CardDescription>
            </div>
            <PlusCircle className={`h-6 w-6 transition-transform ${expanded ? 'rotate-45' : ''}`} />
          </div>
        </CardHeader>
        
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Question Text</Label>
                  <Textarea
                    id="text"
                    name="text"
                    placeholder="Enter the question text..."
                    value={question.text}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                      value={question.topic}
                      onValueChange={(value) => handleSelectChange('topic', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={question.difficulty}
                      onValueChange={(value) => handleSelectChange('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="options">Options (one per line, for multiple choice)</Label>
                  <Textarea
                    id="options"
                    name="options"
                    placeholder="Enter options one per line (optional)..."
                    value={question.options}
                    onChange={handleInputChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    name="answer"
                    placeholder="Enter the correct answer..."
                    value={question.answer}
                    onChange={handleInputChange}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (optional)</Label>
                  <Textarea
                    id="explanation"
                    name="explanation"
                    placeholder="Enter explanation for the answer..."
                    value={question.explanation}
                    onChange={handleInputChange}
                    className="min-h-[80px]"
                  />
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setExpanded(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit}>
                Add Question
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default QuestionForm;
