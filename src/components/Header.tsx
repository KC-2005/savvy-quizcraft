
import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const Header = () => {
  return (
    <motion.header 
      className="w-full px-6 py-4 mb-8 flex items-center justify-between glass"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Brain className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h1 className="text-2xl font-medium">ExamGenius</h1>
          <p className="text-xs text-muted-foreground">AI-Powered DSA Exam Generator</p>
        </motion.div>
      </div>
      
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span className="text-sm font-medium text-muted-foreground">
          Powered by advanced algorithms
        </span>
      </motion.div>
    </motion.header>
  );
};

export default Header;
