export interface LoanExample {
  title: string;
  scenario: string;
  loanAmount: string;
  loanType: string;
  borrowerProfile: string;
  keyLearningPoints: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  status: "locked" | "available" | "in-progress" | "completed";
  topics: string[];
  loanExamples: LoanExample[];
}

export interface CourseData {
  modules: Module[];
  totalProgress: number;
  completedModules: number;
  totalModules: number;
}

// Empty course data - ready for real content management
export const courseData: CourseData = {
  totalProgress: 0,
  completedModules: 0,
  totalModules: 0,
  modules: []
};

// Empty stats data - ready for real progress tracking
export const statsData = [
  {
    title: "Modules Completed",
    value: 0,
    description: "out of 0 modules",
    trend: { value: 0, isPositive: true }
  },
  {
    title: "Learning Time",
    value: "0hrs",
    description: "total time invested",
    trend: { value: 0, isPositive: true }
  },
  {
    title: "Current Streak",
    value: "0 days",
    description: "consecutive learning",
    trend: { value: 0, isPositive: true }
  },
  {
    title: "Progress Score",
    value: "0%",
    description: "average quiz score",
    trend: { value: 0, isPositive: true }
  }
];