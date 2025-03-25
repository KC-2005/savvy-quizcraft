
import { Question, Difficulty, Topic, ExamConfig, ExamResult } from '../types';
import { questionStore } from './questionStore';

/**
 * QuestionSelector - implements algorithms for selecting questions
 * Uses weighted random selection and ensures diversity in topics and difficulties
 */
export class QuestionSelector {
  /**
   * Generate an exam based on configuration
   * @param config Exam configuration
   * @returns ExamResult object with selected questions
   */
  generateExam(config: ExamConfig): ExamResult {
    const selectedQuestions: Question[] = [];
    const { numQuestions, difficulties, topics } = config;
    
    // Get available questions that match the topics
    const availableQuestions = this.getAvailableQuestions(topics);
    
    // Calculate distribution of questions
    const distribution = this.calculateDistribution(
      numQuestions,
      difficulties,
      availableQuestions
    );

    // Select questions for each difficulty level
    for (const difficulty of ['Easy', 'Medium', 'Hard'] as Difficulty[]) {
      const count = distribution[difficulty];
      if (count <= 0) continue;
      
      // Get questions of this difficulty from available questions
      const questionsOfDifficulty = availableQuestions.filter(
        q => q.difficulty === difficulty
      );
      
      // If we don't have enough questions of this difficulty, use what we have
      const toSelect = Math.min(count, questionsOfDifficulty.length);
      
      // Use weighted random selection algorithm to select questions
      const selected = this.selectQuestionsWithDiversity(
        questionsOfDifficulty, 
        toSelect, 
        topics
      );
      
      selectedQuestions.push(...selected);
    }

    // Return the exam result
    return {
      questions: selectedQuestions,
      config,
      timestamp: Date.now()
    };
  }

  /**
   * Get available questions that match the specified topics
   * @param topics Array of topics to filter by
   * @returns Array of questions matching the topics
   */
  private getAvailableQuestions(topics: Topic[]): Question[] {
    if (topics.length === 0) {
      return questionStore.getAllQuestions();
    }
    
    const questions: Question[] = [];
    topics.forEach(topic => {
      questions.push(...questionStore.getQuestionsByTopic(topic));
    });
    
    return questions;
  }

  /**
   * Calculate distribution of questions based on difficulty preferences
   * @param totalQuestions Total number of questions to select
   * @param difficulties Difficulty distribution
   * @param availableQuestions Available questions
   * @returns Object with number of questions to select for each difficulty
   */
  private calculateDistribution(
    totalQuestions: number,
    difficulties: ExamConfig['difficulties'],
    availableQuestions: Question[]
  ): Record<Difficulty, number> {
    // Count questions of each difficulty
    const availableCounts = {
      Easy: availableQuestions.filter(q => q.difficulty === 'Easy').length,
      Medium: availableQuestions.filter(q => q.difficulty === 'Medium').length,
      Hard: availableQuestions.filter(q => q.difficulty === 'Hard').length
    };
    
    // Calculate the total weights from the config
    const totalWeight = difficulties.Easy + difficulties.Medium + difficulties.Hard;
    
    // Calculate desired distribution based on weights
    const desired = {
      Easy: Math.round((difficulties.Easy / totalWeight) * totalQuestions),
      Medium: Math.round((difficulties.Medium / totalWeight) * totalQuestions),
      Hard: Math.round((difficulties.Hard / totalWeight) * totalQuestions)
    };
    
    // Adjust distribution based on available questions
    let distribution = {
      Easy: Math.min(desired.Easy, availableCounts.Easy),
      Medium: Math.min(desired.Medium, availableCounts.Medium),
      Hard: Math.min(desired.Hard, availableCounts.Hard)
    };
    
    // Ensure we select exactly totalQuestions questions
    let total = distribution.Easy + distribution.Medium + distribution.Hard;
    
    // If we don't have enough questions, return what we have
    if (total < totalQuestions) {
      return distribution;
    }
    
    // If we have too many questions, reduce from highest difficulty first
    if (total > totalQuestions) {
      const excess = total - totalQuestions;
      const difficulties: Difficulty[] = ['Hard', 'Medium', 'Easy'];
      
      let remainingExcess = excess;
      for (const difficulty of difficulties) {
        const reduction = Math.min(distribution[difficulty], remainingExcess);
        distribution[difficulty] -= reduction;
        remainingExcess -= reduction;
        
        if (remainingExcess === 0) break;
      }
    }
    
    return distribution;
  }

  /**
   * Select questions with diversity across topics
   * @param questions Available questions
   * @param count Number of questions to select
   * @param topics Array of topics for diversity
   * @returns Selected questions array
   */
  private selectQuestionsWithDiversity(
    questions: Question[],
    count: number,
    topics: Topic[]
  ): Question[] {
    // If we don't have enough questions, return all available ones
    if (questions.length <= count) {
      return [...questions];
    }
    
    // Group questions by topic
    const questionsByTopic: Record<Topic, Question[]> = {} as Record<Topic, Question[]>;
    
    // Initialize with empty arrays
    topics.forEach(topic => {
      questionsByTopic[topic] = [];
    });
    
    // Fill with available questions
    questions.forEach(question => {
      if (questionsByTopic[question.topic]) {
        questionsByTopic[question.topic].push(question);
      }
    });
    
    const selected: Question[] = [];
    let remainingCount = count;
    
    // First pass: try to select from each topic proportionally
    const topicsWithQuestions = topics.filter(
      topic => questionsByTopic[topic].length > 0
    );
    
    if (topicsWithQuestions.length === 0) {
      return [];
    }
    
    // Calculate questions per topic (at least 1 per topic if possible)
    const basePerTopic = Math.floor(count / topicsWithQuestions.length);
    let remainder = count % topicsWithQuestions.length;
    
    // Select questions from each topic
    for (const topic of topicsWithQuestions) {
      const topicQuestions = questionsByTopic[topic];
      let topicCount = Math.min(basePerTopic, topicQuestions.length);
      
      // Distribute remainder if available
      if (remainder > 0 && topicQuestions.length > topicCount) {
        topicCount++;
        remainder--;
      }
      
      // Randomly select questions from this topic
      const selectedFromTopic = this.getRandomElements(topicQuestions, topicCount);
      selected.push(...selectedFromTopic);
      
      // Remove selected questions from available pool
      selectedFromTopic.forEach(q => {
        const index = topicQuestions.indexOf(q);
        if (index !== -1) {
          topicQuestions.splice(index, 1);
        }
      });
      
      remainingCount -= topicCount;
    }
    
    // Second pass: fill any remaining slots with random questions
    if (remainingCount > 0) {
      const remaining = questions.filter(q => !selected.includes(q));
      const additional = this.getRandomElements(remaining, remainingCount);
      selected.push(...additional);
    }
    
    return selected;
  }

  /**
   * Get random elements from an array
   * @param array Source array
   * @param count Number of elements to select
   * @returns Array of randomly selected elements
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    // Create a copy of the array
    const copy = [...array];
    const result: T[] = [];
    
    // Select 'count' random elements
    for (let i = 0; i < count && copy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * copy.length);
      result.push(copy[randomIndex]);
      copy.splice(randomIndex, 1);
    }
    
    return result;
  }
}

// Create a singleton instance
export const questionSelector = new QuestionSelector();
