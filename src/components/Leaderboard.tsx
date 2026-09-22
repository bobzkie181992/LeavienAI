import React from 'react';
import ClassLeaderboard from './ClassLeaderboard';
import { UserProfile } from '../types';

interface LeaderboardProps {
  currentUser?: UserProfile;
  onNavigateToPractice?: () => void;
  onOpenBlitzArena?: () => void;
  onOpenDailyQuests?: () => void;
}

export default function Leaderboard(props: LeaderboardProps) {
  return <ClassLeaderboard {...props} />;
}

export { ClassLeaderboard };
