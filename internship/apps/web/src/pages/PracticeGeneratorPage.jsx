import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PracticeCard from '@/components/PracticeCard.jsx';

const PracticeGeneratorPage = () => {
  const practiceQuestions = [
    {
      question: 'Calculate the derivative of f(x) = 3x² + 2x - 5',
      difficulty: 'Easy'
    },
    {
      question: 'Solve the system of equations: 2x + y = 7 and x - y = 2',
      difficulty: 'Medium'
    },
    {
      question: 'Find the area under the curve y = x² from x = 0 to x = 3 using integration',
      difficulty: 'Hard'
    },
    {
      question: 'Determine if the function f(x) = |x| is differentiable at x = 0',
      difficulty: 'Medium'
    },
    {
      question: 'Prove that the sum of angles in a triangle equals 180 degrees',
      difficulty: 'Easy'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Practice generator - Problem Solver Hub</title>
        <meta name="description" content="Sharpen your skills with auto-generated practice problems across different difficulty levels." />
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold leading-tight md:text-4xl" style={{ letterSpacing: '-0.02em' }}>
                Practice problems
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Test your understanding with these auto-generated practice questions
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {practiceQuestions.map((question, index) => (
                <PracticeCard
                  key={index}
                  question={question.question}
                  difficulty={question.difficulty}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PracticeGeneratorPage;