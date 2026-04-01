const STORAGE_KEY = 'user_created_courses';

export interface SavedCourse {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  coverImage: string;
  author: string;
  updatedAt: string;
  progress: number;
  steps: string[];
  completedSteps: number;
}

const TAG_COLORS = ['blue', 'sky', 'indigo', 'cyan'];

export const getSavedCourses = (): SavedCourse[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCourse[];
  } catch {
    return [];
  }
};

export const saveCourse = (title: string, tag?: string, customSteps?: string[]): SavedCourse => {
  const courses = getSavedCourses();
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
  const colorIdx = courses.length % TAG_COLORS.length;
  const steps = customSteps || ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'];

  const newCourse: SavedCourse = {
    id: `uc_${Date.now()}`,
    title,
    tag: tag || '材料快课制课',
    tagColor: TAG_COLORS[colorIdx],
    coverImage: `https://readdy.ai/api/search-image?query=professional%20corporate%20training%20course%20AI%20technology%20digital%20knowledge%20network%20abstract%20futuristic%20navy%20blue%20background%20glowing%20particles%20modern%20design%20premium%20educational&width=400&height=220&seq=nc${Date.now()}&orientation=landscape`,
    author: '时代光华·刘楚涵',
    updatedAt: dateStr,
    progress: 100,
    steps,
    completedSteps: steps.length,
  };

  const updated = [newCourse, ...courses];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newCourse;
};

export const updateCourseProgress = (id: string, completedSteps: number, progress: number) => {
  const courses = getSavedCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) return;
  courses[idx] = { ...courses[idx], completedSteps, progress };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};
