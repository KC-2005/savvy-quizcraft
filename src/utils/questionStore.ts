
import { Question, Difficulty, Topic, TopicMap } from '../types';

/**
 * QuestionStore - implements a HashMap data structure for storing questions
 * - Outer hashmap: Topic -> Inner hashmap
 * - Inner hashmap: Difficulty -> Array of questions
 * 
 * This structure allows O(1) lookup time for questions by topic and difficulty
 */
export class QuestionStore {
  private store: TopicMap = {};
  private idSet: Set<string> = new Set();

  constructor() {
    // Initialize the store with empty arrays for each topic and difficulty
    const topics: Topic[] = [
      'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
      'Dynamic Programming', 'Sorting', 'Searching', 'Recursion', 'Greedy Algorithms'
    ];
    
    topics.forEach(topic => {
      this.store[topic] = {
        Easy: [],
        Medium: [],
        Hard: []
      };
    });
  }

  /**
   * Add a question to the store
   * @param question Question to add
   * @returns boolean indicating success
   */
  addQuestion(question: Question): boolean {
    // Check if question with this ID already exists
    if (this.idSet.has(question.id)) {
      console.error(`Question with ID ${question.id} already exists`);
      return false;
    }

    // Ensure topic exists in our store
    if (!this.store[question.topic]) {
      this.store[question.topic] = {
        Easy: [],
        Medium: [],
        Hard: []
      };
    }

    // Add question to the appropriate topic and difficulty
    this.store[question.topic][question.difficulty].push(question);
    this.idSet.add(question.id);
    return true;
  }

  /**
   * Get questions by topic and difficulty
   * @param topic Topic to filter by
   * @param difficulty Difficulty to filter by
   * @returns Array of questions matching criteria
   */
  getQuestions(topic: Topic, difficulty: Difficulty): Question[] {
    if (!this.store[topic]) {
      return [];
    }
    return [...this.store[topic][difficulty]];
  }

  /**
   * Get all questions for a specific topic
   * @param topic Topic to filter by
   * @returns Array of questions for the topic
   */
  getQuestionsByTopic(topic: Topic): Question[] {
    if (!this.store[topic]) {
      return [];
    }
    
    return [
      ...this.store[topic].Easy,
      ...this.store[topic].Medium,
      ...this.store[topic].Hard
    ];
  }

  /**
   * Get all questions for a specific difficulty
   * @param difficulty Difficulty to filter by
   * @returns Array of questions with specified difficulty
   */
  getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
    const result: Question[] = [];
    
    Object.keys(this.store).forEach(topic => {
      result.push(...this.store[topic as Topic][difficulty]);
    });
    
    return result;
  }

  /**
   * Get all questions in the store
   * @returns Array of all questions
   */
  getAllQuestions(): Question[] {
    const result: Question[] = [];
    
    Object.keys(this.store).forEach(topic => {
      result.push(
        ...this.store[topic as Topic].Easy,
        ...this.store[topic as Topic].Medium,
        ...this.store[topic as Topic].Hard
      );
    });
    
    return result;
  }

  /**
   * Remove a question by ID
   * @param id ID of question to remove
   * @returns boolean indicating success
   */
  removeQuestion(id: string): boolean {
    if (!this.idSet.has(id)) {
      return false;
    }

    let removed = false;
    
    // Find and remove the question
    Object.keys(this.store).forEach(topic => {
      const topicKey = topic as Topic;
      
      ['Easy', 'Medium', 'Hard'].forEach(diff => {
        const difficulty = diff as Difficulty;
        const questions = this.store[topicKey][difficulty];
        
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
          questions.splice(index, 1);
          this.idSet.delete(id);
          removed = true;
        }
      });
    });
    
    return removed;
  }

  /**
   * Get the count of questions by topic and difficulty
   * @returns Object with counts
   */
  getQuestionCounts(): { 
    total: number; 
    byTopic: Record<Topic, number>; 
    byDifficulty: Record<Difficulty, number>;
  } {
    const counts = {
      total: 0,
      byTopic: {} as Record<Topic, number>,
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } as Record<Difficulty, number>
    };

    Object.keys(this.store).forEach(topic => {
      const topicKey = topic as Topic;
      counts.byTopic[topicKey] = 0;

      ['Easy', 'Medium', 'Hard'].forEach(diff => {
        const difficulty = diff as Difficulty;
        const questions = this.store[topicKey][difficulty];
        
        counts.byTopic[topicKey] += questions.length;
        counts.byDifficulty[difficulty] += questions.length;
        counts.total += questions.length;
      });
    });

    return counts;
  }
}

// Create a singleton instance
export const questionStore = new QuestionStore();

// Sample questions for initial data
const sampleQuestions: Question[] = [
  {
    id: "1",
    text: "What is the time complexity of a binary search algorithm?",
    difficulty: "Easy",
    topic: "Searching",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    answer: "O(log n)",
    explanation: "Binary search repeatedly divides the search space in half, resulting in logarithmic time complexity."
  },
  {
    id: "2",
    text: "Describe the differences between a linked list and an array.",
    difficulty: "Easy",
    topic: "Arrays",
    answer: "Arrays have fixed size and contiguous memory, allow random access in O(1), but insertions can be O(n). Linked lists have dynamic size with non-contiguous memory, insertions are O(1) at known positions, but access is O(n)."
  },
  {
    id: "3",
    text: "Implement a function to detect a cycle in a linked list.",
    difficulty: "Medium",
    topic: "Linked Lists",
    answer: "Use Floyd's Cycle-Finding Algorithm (tortoise and hare) with two pointers moving at different speeds."
  },
  {
    id: "4",
    text: "Explain the concept of dynamic programming and provide an example.",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    answer: "Dynamic programming breaks down complex problems into simpler subproblems, solving each subproblem once and storing results for future use. Examples include the Fibonacci sequence, knapsack problem, and longest common subsequence."
  },
  {
    id: "5",
    text: "Implement an algorithm to find the shortest path in a weighted graph.",
    difficulty: "Hard",
    topic: "Graphs",
    answer: "Use Dijkstra's algorithm for graphs with non-negative weights, or Bellman-Ford for graphs that may contain negative weights."
  },
  {
    id: "6",
    text: "Compare and contrast the time complexity of different sorting algorithms.",
    difficulty: "Medium",
    topic: "Sorting",
    answer: "Quick Sort: Average O(n log n), worst O(n²). Merge Sort: O(n log n) always. Bubble Sort: O(n²). Heap Sort: O(n log n). Insertion Sort: Average O(n²), best O(n)."
  },
  {
    id: "7",
    text: "Explain the difference between a tree and a graph data structure.",
    difficulty: "Easy",
    topic: "Trees",
    answer: "A tree is a connected, acyclic graph with one path between any two vertices. A graph is a collection of nodes connected by edges that can contain cycles and multiple paths between nodes."
  },
  {
    id: "8",
    text: "Solve the N-Queens problem using backtracking.",
    difficulty: "Hard",
    topic: "Recursion",
    answer: "Use recursive backtracking to place queens one by one in different columns, and check for conflicts in rows, columns, and diagonals before placement."
  },
  {
    id: "9",
    text: "What is the difference between a greedy algorithm and dynamic programming?",
    difficulty: "Medium",
    topic: "Greedy Algorithms",
    answer: "Greedy algorithms make locally optimal choices at each step to find a global optimum, while dynamic programming breaks problems into subproblems and builds up solutions by combining subproblem solutions. Greedy algorithms don't guarantee optimal solutions for all problems."
  },
  {
    id: "10",
    text: "Implement an algorithm to find all permutations of a string.",
    difficulty: "Hard",
    topic: "Strings",
    answer: "Use recursive backtracking, swapping characters to generate all permutations. This can also be done iteratively using an algorithm like Heap's algorithm."
  }
];

// Add sample questions to the store
sampleQuestions.forEach(q => questionStore.addQuestion(q));
