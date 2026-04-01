export const mockCourses = [
  {
    id: '1',
    title: '《最佳实践萃取》',
    tag: '材料快课制课',
    tagColor: 'blue',
    coverImage: 'https://readdy.ai/api/search-image?query=AI%20technology%20digital%20brain%20network%20visualization%20course%20material%20knowledge%20creation%20futuristic%20holographic%20interface%20dark%20navy%20blue%20background%20glowing%20lines%20particles%20data%20streams%20professional&width=400&height=220&seq=cv1&orientation=landscape',
    author: '时代光华·刘楚涵',
    updatedAt: '2025.9.18',
    progress: 45,
    steps: ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'],
    completedSteps: 2,
  },
  {
    id: '2',
    title: '《数字化课程智能提取与课程生成》',
    tag: '材料快课制课',
    tagColor: 'sky',
    coverImage: 'https://readdy.ai/api/search-image?query=futuristic%20digital%20course%20generation%20AI%20system%20data%20visualization%20abstract%20technology%20background%20glowing%20blue%20cyan%20electric%20neural%20network%20corporate%20training&width=400&height=220&seq=cv2&orientation=landscape',
    author: '时代光华·刘楚涵',
    updatedAt: '2025.9.18',
    progress: 70,
    steps: ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'],
    completedSteps: 3,
  },
  {
    id: '3',
    title: '《如何划分职业发展通道》',
    tag: '系列丛书开发',
    tagColor: 'indigo',
    coverImage: 'https://readdy.ai/api/search-image?query=professional%20career%20development%20path%20visualization%20modern%20corporate%20training%20material%20beautiful%20deep%20blue%20indigo%20gradient%20background%20glowing%20orbs%20abstract%20geometric%20design%20premium&width=400&height=220&seq=cv3&orientation=landscape',
    author: '时代光华·刘楚涵',
    updatedAt: '2025.9.18',
    progress: 20,
    steps: ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'],
    completedSteps: 1,
  },
  {
    id: '4',
    title: '《员工绩效管理与激励机制》',
    tag: '内训师课程开发',
    tagColor: 'cyan',
    coverImage: 'https://readdy.ai/api/search-image?query=performance%20management%20employee%20motivation%20corporate%20training%20visual%20abstract%20geometric%20shapes%20glowing%20cyan%20blue%20particles%20dark%20navy%20background%20modern%20digital%20art%20premium&width=400&height=220&seq=cv4&orientation=landscape',
    author: '时代光华·王建明',
    updatedAt: '2025.10.2',
    progress: 85,
    steps: ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'],
    completedSteps: 4,
  },
  {
    id: '5',
    title: '《销售技巧与客户关系管理》',
    tag: '自由心意剧课',
    tagColor: 'blue',
    coverImage: 'https://readdy.ai/api/search-image?query=sales%20skills%20customer%20relationship%20management%20training%20course%20stylish%20modern%20abstract%20blue%20background%20connected%20nodes%20network%20business%20professional%20sleek%20design%20digital&width=400&height=220&seq=cv5&orientation=landscape',
    author: '时代光华·李晓云',
    updatedAt: '2025.10.5',
    progress: 60,
    steps: ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'],
    completedSteps: 3,
  },
  {
    id: '6',
    title: '《组织文化建设与变革管理》',
    tag: 'PPT转视频课',
    tagColor: 'sky',
    coverImage: 'https://readdy.ai/api/search-image?query=organization%20culture%20change%20management%20transformation%20modern%20business%20training%20abstract%20flowing%20shapes%20bright%20blue%20sky%20colors%20minimalist%20design%20corporate%20digital%20premium&width=400&height=220&seq=cv6&orientation=landscape',
    author: '时代光华·陈志远',
    updatedAt: '2025.10.8',
    progress: 35,
    steps: ['生成大纲', '生成PPT', '生成讲稿', '合成视频', '生成试卷'],
    completedSteps: 2,
  },
];

export const quickActions = [
  { id: 'qa1', label: '材料快课制课', icon: 'ri-rocket-line', color: 'from-blue-500 to-blue-700' },
  { id: 'qa2', label: '自由心意剧课', icon: 'ri-magic-line', color: 'from-sky-400 to-sky-600' },
  { id: 'qa3', label: '好导师分享', icon: 'ri-user-star-line', color: 'from-indigo-400 to-indigo-600' },
  { id: 'qa4', label: 'PPT转视频课', icon: 'ri-slideshow-line', color: 'from-cyan-400 to-cyan-600' },
  { id: 'qa5', label: '半·条单开发', icon: 'ri-file-list-3-line', color: 'from-blue-400 to-blue-600' },
  { id: 'qa6', label: '系列丛书开发', icon: 'ri-book-open-line', color: 'from-sky-500 to-indigo-500' },
  { id: 'qa7', label: '案例事迹开发', icon: 'ri-article-line', color: 'from-cyan-500 to-blue-500' },
  { id: 'qa8', label: '内训师课程开发', icon: 'ri-presentation-line', color: 'from-indigo-500 to-blue-600' },
  { id: 'qa9', label: '面诶课程设计', icon: 'ri-discuss-line', color: 'from-blue-600 to-indigo-700' },
];

/** 侧栏主导航（与最初 UI 一致；无独立路由的项仅切换选中态） */
export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path?: '/micro-course' | '/ai-course';
};

export const navItems: NavItem[] = [
  { id: 'ai-design', label: 'AI课程制作', icon: 'ri-robot-2-line', path: '/ai-course' },
  { id: 'tips', label: 'AI微课开发', icon: 'ri-lightbulb-flash-line', path: '/micro-course' },
  { id: 'knowledge', label: '素材管理中心', icon: 'ri-video-line' },
  { id: 'tools', label: '系统管理', icon: 'ri-tools-line' },
];

export const courseFilterOptions = [
  '材料快课制课',
  '自由心意剧课',
  '好导师分享',
  'PPT转视频课',
  '系列丛书开发',
  '内训师课程开发',
  '面诶课程设计',
];
