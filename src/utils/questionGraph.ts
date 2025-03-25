
import { Question, QuestionGraph, Topic, Difficulty } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * QuestionGraphManager - Graph-based data structure for managing questions
 * Implements adjacency list representation and graph traversal algorithms
 */
export class QuestionGraphManager {
  private graph: QuestionGraph;

  constructor() {
    this.graph = {
      nodes: new Map<string, Question>(),
      edges: new Map<string, string[]>()
    };
  }

  /**
   * Add a question to the graph
   * @param question Question to add
   * @returns Boolean indicating success
   */
  addQuestion(question: Question): boolean {
    // Check if question already exists
    if (this.graph.nodes.has(question.id)) {
      return false;
    }
    
    // Add the question as a node
    this.graph.nodes.set(question.id, question);
    this.graph.edges.set(question.id, []);
    
    // Find related questions and create edges
    this.findAndCreateRelationships(question);
    
    return true;
  }

  /**
   * Find related questions and create graph edges
   * @param question Question to find relationships for
   */
  private findAndCreateRelationships(question: Question): void {
    // Get all questions with the same topic
    const sameTopicQuestions: string[] = [];
    
    this.graph.nodes.forEach((q, id) => {
      if (id !== question.id && q.topic === question.topic) {
        sameTopicQuestions.push(id);
      }
    });
    
    // Create edges for related questions (up to 3)
    const relatedQuestionsCount = Math.min(3, sameTopicQuestions.length);
    const selectedRelatedQuestions = this.getRandomElements(
      sameTopicQuestions, 
      relatedQuestionsCount
    );
    
    // Add edges in both directions (undirected graph)
    selectedRelatedQuestions.forEach(relatedId => {
      // Add edge from question to related
      const currentEdges = this.graph.edges.get(question.id) || [];
      if (!currentEdges.includes(relatedId)) {
        currentEdges.push(relatedId);
        this.graph.edges.set(question.id, currentEdges);
      }
      
      // Add edge from related to question
      const relatedEdges = this.graph.edges.get(relatedId) || [];
      if (!relatedEdges.includes(question.id)) {
        relatedEdges.push(question.id);
        this.graph.edges.set(relatedId, relatedEdges);
      }
    });
  }

  /**
   * Get all questions from the graph
   * @returns Array of all questions
   */
  getAllQuestions(): Question[] {
    return Array.from(this.graph.nodes.values());
  }

  /**
   * Get questions by topic
   * @param topic Topic to filter by
   * @returns Array of questions with specified topic
   */
  getQuestionsByTopic(topic: Topic): Question[] {
    const result: Question[] = [];
    
    this.graph.nodes.forEach(question => {
      if (question.topic === topic) {
        result.push(question);
      }
    });
    
    return result;
  }

  /**
   * Get questions by difficulty
   * @param difficulty Difficulty to filter by
   * @returns Array of questions with specified difficulty
   */
  getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
    const result: Question[] = [];
    
    this.graph.nodes.forEach(question => {
      if (question.difficulty === difficulty) {
        result.push(question);
      }
    });
    
    return result;
  }

  /**
   * Remove a question from the graph
   * @param id Question ID to remove
   * @returns Boolean indicating success
   */
  removeQuestion(id: string): boolean {
    if (!this.graph.nodes.has(id)) {
      return false;
    }
    
    // Remove the node
    this.graph.nodes.delete(id);
    
    // Remove all edges connected to this node
    this.graph.edges.delete(id);
    
    // Remove references to this node in other edges
    this.graph.edges.forEach((connectedIds, nodeId) => {
      const updatedConnections = connectedIds.filter(connectedId => connectedId !== id);
      this.graph.edges.set(nodeId, updatedConnections);
    });
    
    return true;
  }

  /**
   * Get related questions using BFS traversal
   * @param questionId Starting question ID
   * @param maxDepth Maximum depth to search
   * @returns Array of related questions
   */
  getRelatedQuestions(questionId: string, maxDepth: number = 2): Question[] {
    if (!this.graph.nodes.has(questionId)) {
      return [];
    }
    
    const visited = new Set<string>([questionId]);
    const result: Question[] = [];
    
    // BFS with depth tracking
    const queue: { id: string; depth: number }[] = [{ id: questionId, depth: 0 }];
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (depth > 0) { // Don't include the original question
        const question = this.graph.nodes.get(id);
        if (question) {
          result.push(question);
        }
      }
      
      // Stop at max depth
      if (depth >= maxDepth) {
        continue;
      }
      
      // Add neighbors to queue
      const neighbors = this.graph.edges.get(id) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, depth: depth + 1 });
        }
      }
    }
    
    return result;
  }

  /**
   * Get question counts
   * @returns Object with counts
   */
  getQuestionCounts(): { 
    total: number; 
    byTopic: Record<Topic, number>; 
    byDifficulty: Record<Difficulty, number>;
  } {
    const counts = {
      total: this.graph.nodes.size,
      byTopic: {} as Record<Topic, number>,
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } as Record<Difficulty, number>
    };
    
    const topics: Topic[] = [
      'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
      'Dynamic Programming', 'Sorting', 'Searching', 'Recursion', 'Greedy Algorithms'
    ];
    
    // Initialize topic counts
    topics.forEach(topic => {
      counts.byTopic[topic] = 0;
    });
    
    // Count questions
    this.graph.nodes.forEach(question => {
      counts.byTopic[question.topic]++;
      counts.byDifficulty[question.difficulty]++;
    });
    
    return counts;
  }

  /**
   * Get random elements from an array
   * @param array Source array
   * @param count Number of elements to select
   * @returns Array of randomly selected elements
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    const copy = [...array];
    const result: T[] = [];
    
    for (let i = 0; i < count && copy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * copy.length);
      result.push(copy[randomIndex]);
      copy.splice(randomIndex, 1);
    }
    
    return result;
  }
}

// Create a singleton instance
export const questionGraph = new QuestionGraphManager();

// Import sample questions
import { sampleQuestions } from './questionStore';

// Add sample questions to the graph
sampleQuestions.forEach(q => questionGraph.addQuestion(q));
