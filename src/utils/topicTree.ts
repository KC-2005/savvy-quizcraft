
import { Question, Topic, TopicNode, Difficulty } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * TopicTree - Hierarchical data structure for organizing questions by topic
 * Implements tree traversal algorithms (DFS and BFS)
 */
export class TopicTree {
  private root: TopicNode;

  constructor() {
    // Initialize the root node
    this.root = {
      id: 'root',
      name: 'All Topics',
      children: [],
      questions: []
    };
    
    // Create topic nodes for each main category
    const topics: Topic[] = [
      'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
      'Dynamic Programming', 'Sorting', 'Searching', 'Recursion', 'Greedy Algorithms'
    ];
    
    topics.forEach(topic => {
      this.addTopicNode(topic);
    });
  }

  /**
   * Add a new topic node to the tree
   * @param topic Topic name
   * @param parentId Optional parent ID (defaults to root)
   * @returns The created node
   */
  addTopicNode(topic: string, parentId: string = 'root'): TopicNode {
    const newNode: TopicNode = {
      id: uuidv4(),
      name: topic,
      children: [],
      questions: []
    };
    
    // Find the parent node
    const parent = this.findNodeById(parentId);
    if (parent) {
      parent.children.push(newNode);
    } else {
      console.error(`Parent node with ID ${parentId} not found`);
    }
    
    return newNode;
  }

  /**
   * Find a node by its ID using DFS
   * @param id Node ID to find
   * @param currentNode Starting node (defaults to root)
   * @returns The found node or null
   */
  findNodeById(id: string, currentNode: TopicNode = this.root): TopicNode | null {
    if (currentNode.id === id) {
      return currentNode;
    }
    
    // DFS to find the node
    for (const child of currentNode.children) {
      const found = this.findNodeById(id, child);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  /**
   * Find a node by its name using BFS
   * @param name Node name to find
   * @returns The found node or null
   */
  findNodeByName(name: string): TopicNode | null {
    const queue: TopicNode[] = [this.root];
    
    // BFS to find the node
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.name === name) {
        return current;
      }
      
      // Add children to the queue
      queue.push(...current.children);
    }
    
    return null;
  }

  /**
   * Add a question to a topic node
   * @param question Question to add
   * @param topicName Topic name
   * @returns Boolean indicating success
   */
  addQuestion(question: Question, topicName: string = question.topic): boolean {
    const topicNode = this.findNodeByName(topicName);
    
    if (topicNode) {
      // Check if question already exists
      const exists = topicNode.questions.some(q => q.id === question.id);
      if (!exists) {
        topicNode.questions.push(question);
        
        // Also add to the root for quick access to all questions
        this.root.questions.push(question);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get questions by topic using tree traversal
   * @param topicName Topic name
   * @returns Array of questions for this topic
   */
  getQuestionsByTopic(topicName: string): Question[] {
    const topicNode = this.findNodeByName(topicName);
    return topicNode ? [...topicNode.questions] : [];
  }

  /**
   * Get questions by difficulty across all topics
   * @param difficulty Difficulty level
   * @returns Array of questions with the specified difficulty
   */
  getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
    return this.root.questions.filter(q => q.difficulty === difficulty);
  }

  /**
   * Get all questions from the tree
   * @returns All questions
   */
  getAllQuestions(): Question[] {
    return [...this.root.questions];
  }

  /**
   * Remove a question by ID
   * @param id Question ID to remove
   * @returns Boolean indicating success
   */
  removeQuestion(id: string): boolean {
    let removed = false;
    
    // Remove from root
    const rootIndex = this.root.questions.findIndex(q => q.id === id);
    if (rootIndex !== -1) {
      this.root.questions.splice(rootIndex, 1);
      removed = true;
    }
    
    // Remove from topic node using DFS
    const removeFromNode = (node: TopicNode): void => {
      const index = node.questions.findIndex(q => q.id === id);
      if (index !== -1) {
        node.questions.splice(index, 1);
      }
      
      // Recursively check children
      node.children.forEach(child => removeFromNode(child));
    };
    
    removeFromNode(this.root);
    
    return removed;
  }

  /**
   * Get counts of questions by topic and difficulty
   * @returns Object with counts
   */
  getQuestionCounts(): { 
    total: number; 
    byTopic: Record<string, number>; 
    byDifficulty: Record<Difficulty, number>;
  } {
    const counts = {
      total: this.root.questions.length,
      byTopic: {} as Record<string, number>,
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } as Record<Difficulty, number>
    };

    // Count by difficulty
    this.root.questions.forEach(q => {
      counts.byDifficulty[q.difficulty]++;
    });

    // Count by topic using DFS
    const countTopicQuestions = (node: TopicNode): void => {
      if (node.id !== 'root') {
        counts.byTopic[node.name] = node.questions.length;
      }
      
      node.children.forEach(child => countTopicQuestions(child));
    };
    
    countTopicQuestions(this.root);

    return counts;
  }
}

// Create a singleton instance
export const topicTree = new TopicTree();

// Add sample questions to the tree
import { sampleQuestions } from './questionStore';
sampleQuestions.forEach(q => topicTree.addQuestion(q));
