
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Topic = 
  | 'Arrays' 
  | 'Strings' 
  | 'Linked Lists' 
  | 'Trees' 
  | 'Graphs' 
  | 'Dynamic Programming' 
  | 'Sorting' 
  | 'Searching' 
  | 'Recursion' 
  | 'Greedy Algorithms';

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  topic: Topic;
  options?: string[];
  answer?: string;
  explanation?: string;
}

export interface QuestionMap {
  [key: string]: Question[];
}

export interface TopicMap {
  [key: string]: {
    Easy: Question[];
    Medium: Question[];
    Hard: Question[];
  };
}

export interface ExamConfig {
  numQuestions: number;
  difficulties: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  topics: Topic[];
}

export interface ExamResult {
  questions: Question[];
  config: ExamConfig;
  timestamp: number;
}
