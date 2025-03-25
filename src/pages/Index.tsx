
import React, { useState } from 'react';
import { ExamResult } from '@/types';
import Header from '@/components/Header';
import QuestionForm from '@/components/QuestionForm';
import ExamGenerator from '@/components/ExamGenerator';
import ExamOutput from '@/components/ExamOutput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Plus, Settings, TreeDeciduous, CircleArrowRight } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  
  const handleExamGenerated = (result: ExamResult) => {
    setExamResult(result);
    setActiveTab('exam');
  };
  
  const handleReset = () => {
    setExamResult(null);
    setActiveTab('generate');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <motion.main 
        className="flex-1 container max-w-4xl mx-auto px-4 pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="generate" disabled={false}>
              <Settings className="h-4 w-4 mr-2" />
              Generate Exam
            </TabsTrigger>
            <TabsTrigger value="add" disabled={false}>
              <Plus className="h-4 w-4 mr-2" />
              Add Questions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            <ExamGenerator onExamGenerated={handleExamGenerated} />
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4">
            <QuestionForm />
          </TabsContent>
          
          <TabsContent value="exam" className="space-y-4">
            <ExamOutput examResult={examResult} onReset={handleReset} />
          </TabsContent>
        </Tabs>
      </motion.main>
    </div>
  );
};

export default Index;
