import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useUserProgress = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState({
    totalSolved: 0,
    accuracy: 0,
    streak: 0,
    topicsCovered: 0,
    recentActivity: [],
    weeklyActivity: Array(7).fill(0)
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch all user progress records
      const records = await pb.collection('userProgress').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-timestamp',
        $autoCancel: false
      });

      // Calculate total solved
      const solvedRecords = records.filter(r => r.solved);
      const totalSolved = solvedRecords.length;

      // Calculate accuracy
      const totalAccuracy = solvedRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0);
      const accuracy = totalSolved > 0 ? Math.round(totalAccuracy / totalSolved) : 0;

      // Fetch related problems for recent activity and topics
      const recentActivity = [];
      const topics = new Set();
      
      // Get the last 5 solved problems
      const recentSolved = solvedRecords.slice(0, 5);
      
      for (const record of recentSolved) {
        try {
          const problem = await pb.collection('problems').getOne(record.problemId, { $autoCancel: false });
          recentActivity.push({
            ...record,
            problemTitle: problem.title,
            topic: problem.topic,
            difficulty: problem.difficulty
          });
          topics.add(problem.topic);
        } catch (e) {
          console.error("Error fetching problem details", e);
        }
      }

      // Calculate streak (consecutive days)
      let streak = 0;
      if (solvedRecords.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentDate = new Date(today);
        let hasActivityToday = false;
        
        // Check if there's activity today
        const latestActivityDate = new Date(solvedRecords[0].timestamp);
        latestActivityDate.setHours(0, 0, 0, 0);
        
        if (latestActivityDate.getTime() === today.getTime()) {
          hasActivityToday = true;
          streak = 1;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (latestActivityDate.getTime() === today.getTime() - 86400000) {
          // Last activity was yesterday, streak is still alive
          streak = 1;
          currentDate.setDate(currentDate.getDate() - 2);
        }

        // Count backwards
        if (streak > 0) {
          const uniqueDates = new Set(solvedRecords.map(r => {
            const d = new Date(r.timestamp);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          }));

          while (uniqueDates.has(currentDate.getTime())) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          }
        }
      }

      // Calculate weekly activity (last 7 days)
      const weeklyActivity = Array(7).fill(0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      solvedRecords.forEach(record => {
        const recordDate = new Date(record.timestamp);
        recordDate.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - recordDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
          // Index 6 is today, 0 is 6 days ago
          weeklyActivity[6 - diffDays]++;
        }
      });

      setProgress({
        totalSolved,
        accuracy,
        streak,
        topicsCovered: topics.size || 0, // Fallback if we couldn't fetch all topics
        recentActivity,
        weeklyActivity
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const recordProblemSolved = async (problemId, accuracyScore) => {
    if (!isAuthenticated || !currentUser) return null;

    try {
      const record = await pb.collection('userProgress').create({
        userId: currentUser.id,
        problemId: problemId,
        solved: true,
        accuracy: accuracyScore,
        timestamp: new Date().toISOString()
      }, { $autoCancel: false });
      
      // Refresh progress
      await fetchProgress();
      return record;
    } catch (error) {
      console.error("Error recording progress:", error);
      throw error;
    }
  };

  return {
    progress,
    isLoading,
    recordProblemSolved,
    refreshProgress: fetchProgress
  };
};