
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExamConfig, Topic, ExamResult } from '@/types';
import { questionStore } from '@/utils/questionStore';
import { questionSelector } from '@/utils/questionSelector';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Settings2, BarChart } from 'lucide-react';

interface ExamGeneratorProps {
  onExamGenerated: (exam: ExamResult) => void;
}

const ExamGenerator: React.FC<ExamGeneratorProps> = ({ onExamGenerated }) => {
  const { toast } = useToast();
  
  const [examConfig, setExamConfig] = useState<ExamConfig>({
    numQuestions: 10,
    difficulties: {
      Easy: 3,
      Medium: 5,
      Hard: 2,
    },
    topics: [],
  });
  
  const [selectedTopics, setSelectedTopics] = useState<Record<Topic, boolean>>({
    'Arrays': false,
    'Strings': false,
    'Linked Lists': false,
    'Trees': false,
    'Graphs': false,
    'Dynamic Programming': false,
    'Sorting': false,
    'Searching': false,
    'Recursion': false,
    'Greedy Algorithms': false,
  });
  
  const [questionCounts, setQuestionCounts] = useState({
    total: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
  });
  
  // Update question counts
  useEffect(() => {
    const counts = questionStore.getQuestionCounts();
    setQuestionCounts({
      total: counts.total,
      byDifficulty: counts.byDifficulty
    });
  }, []);
  
  // Update selected topics in config
  useEffect(() => {
    const topics = Object.entries(selectedTopics)
      .filter(([_, selected]) => selected)
      .map(([topic]) => topic as Topic);
    
    setExamConfig(prev => ({
      ...prev,
      topics
    }));
  }, [selectedTopics]);
  
  const handleNumQuestionsChange = (values: number[]) => {
    setExamConfig(prev => ({
      ...prev,
      numQuestions: values[0]
    }));
  };
  
  const handleDifficultyChange = (difficulty: keyof ExamConfig['difficulties'], values: number[]) => {
    setExamConfig(prev => ({
      ...prev,
      difficulties: {
        ...prev.difficulties,
        [difficulty]: values[0]
      }
    }));
  };
  
  const handleTopicChange = (topic: Topic, checked: boolean) => {
    setSelectedTopics(prev => ({
      ...prev,
      [topic]: checked
    }));
  };
  
  const handleSelectAllTopics = () => {
    const allSelected = Object.values(selectedTopics).every(selected => selected);
    
    const updatedTopics = {} as Record<Topic, boolean>;
    Object.keys(selectedTopics).forEach(topic => {
      updatedTopics[topic as Topic] = !allSelected;
    });
    
    setSelectedTopics(updatedTopics);
  };
  
  const totalDifficultyWeight = 
    examConfig.difficulties.Easy + 
    examConfig.difficulties.Medium + 
    examConfig.difficulties.Hard;
  
  const handleGenerate = () => {
    // Validate configuration
    if (examConfig.numQuestions <= 0) {
      toast({
        title: "Invalid Configuration",
        description: "Number of questions must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    if (totalDifficultyWeight <= 0) {
      toast({
        title: "Invalid Configuration",
        description: "At least one difficulty level must be selected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Generate exam
      const examResult = questionSelector.generateExam(examConfig);
      
      if (examResult.questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "No questions match your criteria. Add more questions or change your filters.",
          variant: "destructive"
        });
        return;
      }
      
      if (examResult.questions.length < examConfig.numQuestions) {
        toast({
          title: "Not Enough Questions",
          description: `Only ${examResult.questions.length} questions available. Add more questions to match your criteria.`,
          variant: "destructive"
        });
      }
      
      // Pass exam to parent component
      onExamGenerated(examResult);
      
      toast({
        title: "Exam Generated",
        description: `Generated ${examResult.questions.length} questions`
      });
    } catch (error) {
      console.error("Error generating exam:", error);
      toast({
        title: "Error",
        description: "Failed to generate exam. Please try again.",
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
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Configure Exam</CardTitle>
              <CardDescription>
                Set parameters for question selection
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="num-questions">Number of Questions: {examConfig.numQuestions}</Label>
              <span className="text-xs text-muted-foreground">
                {questionCounts.total} questions available
              </span>
            </div>
            <Slider
              id="num-questions"
              min={1}
              max={50}
              step={1}
              value={[examConfig.numQuestions]}
              onValueChange={handleNumQuestionsChange}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Difficulty Distribution</Label>
              <div className="flex items-center space-x-2">
                <BarChart className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Relative weights</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <Label htmlFor="easy-weight">Easy: {examConfig.difficulties.Easy}</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {questionCounts.byDifficulty.Easy} available
                  </span>
                </div>
                <Slider
                  id="easy-weight"
                  min={0}
                  max={10}
                  step={1}
                  value={[examConfig.difficulties.Easy]}
                  onValueChange={(values) => handleDifficultyChange('Easy', values)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <Label htmlFor="medium-weight">Medium: {examConfig.difficulties.Medium}</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {questionCounts.byDifficulty.Medium} available
                  </span>
                </div>
                <Slider
                  id="medium-weight"
                  min={0}
                  max={10}
                  step={1}
                  value={[examConfig.difficulties.Medium]}
                  onValueChange={(values) => handleDifficultyChange('Medium', values)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <Label htmlFor="hard-weight">Hard: {examConfig.difficulties.Hard}</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {questionCounts.byDifficulty.Hard} available
                  </span>
                </div>
                <Slider
                  id="hard-weight"
                  min={0}
                  max={10}
                  step={1}
                  value={[examConfig.difficulties.Hard]}
                  onValueChange={(values) => handleDifficultyChange('Hard', values)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Topics</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSelectAllTopics}
                className="h-7 text-xs"
              >
                {Object.values(selectedTopics).every(selected => selected)
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.keys(selectedTopics).map((topic) => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`topic-${topic}`}
                    checked={selectedTopics[topic as Topic]}
                    onCheckedChange={(checked) => 
                      handleTopicChange(topic as Topic, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`topic-${topic}`}
                    className="text-sm cursor-pointer"
                  >
                    {topic}
                  </Label>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {examConfig.topics.length === 0 
                ? "No topics selected (all topics will be included)" 
                : `${examConfig.topics.length} topics selected`}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerate} className="w-full sm:w-auto">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Generate Exam
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ExamGenerator;
