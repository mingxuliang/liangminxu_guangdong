import type { MaterialSlide } from '@/services/dify/step4PptOutline';

/** 与阿里云市场 generate_ppt 的 outline 结构一致 */
export interface IslideOutlineItem {
  title: string;
  items: string[];
}

export interface IslideContentBlock {
  title: string;
  subtitle: string;
  items: IslideOutlineItem[];
}

export interface IslideSection {
  title: string;
  subtitle: string;
  contents: IslideContentBlock[];
}

export interface IslideOutlineRoot {
  title: string;
  subtitle: string;
  sections: IslideSection[];
}

/** 将第四步「逐页幻灯片」转为 iSlide 大纲（每页 → 一个 section） */
export function buildIslideOutlineFromMaterialSlides(
  courseTitle: string,
  slides: MaterialSlide[]
): IslideOutlineRoot {
  const sections: IslideSection[] = slides.map((slide) => {
    const items: IslideOutlineItem[] = [];

    for (const line of slide.contentLines) {
      const t = line.trim();
      if (t) items.push({ title: t, items: [] });
    }

    if (slide.subItems?.length) {
      for (const sub of slide.subItems) {
        const label = sub.label.trim();
        const lines = (sub.lines || [])
          .map((l) => l.replace(/^[\s·•]+/, '').trim())
          .filter(Boolean);
        items.push({ title: label, items: lines });
      }
    }

    if (items.length === 0) {
      items.push({ title: slide.title, items: [] });
    }

    return {
      title: slide.title,
      subtitle: '',
      contents: [
        {
          title: '本页内容',
          subtitle: '',
          items,
        },
      ],
    };
  });

  return {
    title: (courseTitle || '课程课件').trim(),
    subtitle: '',
    sections,
  };
}

/** 文档要求章节与内容块总量在合理范围；此处按页数粗校验 */
export function countOutlineNodes(outline: IslideOutlineRoot): number {
  let n = outline.sections.length;
  for (const sec of outline.sections) {
    for (const c of sec.contents) {
      n += c.items.length;
    }
  }
  return n;
}
