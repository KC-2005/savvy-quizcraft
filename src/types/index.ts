
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

// Tree data structure for topic categorization
export interface TopicNode {
  id: string;
  name: string;
  children: TopicNode[];
  questions: Question[];
}

// Graph data structure for related questions
export interface QuestionGraph {
  nodes: Map<string, Question>;
  edges: Map<string, string[]>; // Maps question ID to related question IDs
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
