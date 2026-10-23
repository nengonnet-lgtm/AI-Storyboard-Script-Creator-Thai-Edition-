export interface AppState {
  step: number;
  images: string[];
  storySynopsis: string;
  generatedContents: string[];
  selectedContent: string;
  location: string;
  customLocation: string;
  languageStyle: string;
  storytellingStyle: string;
  cta: string;
  artStyle: string;
  storyboardType: string;
  customStoryboardFrames: string;
  promptType: string;
  generatedPrompts: ScenePrompt[];
  captions: CaptionOption[];
}

export interface ScenePrompt {
  sceneNumber: number;
  imagePrompt: string;
  videoPrompt: string;
  dialogue: string;
}

export interface CaptionOption {
  type: string;
  content: string;
}

export const ART_STYLES = [
  { label: 'สไตล์สมจริง (Realistic)', value: 'Realistic photo style, 8k resolution, cinematic lighting, highly detailed, photorealistic, sharp focus, photography' },
  { label: '3D น่ารัก (Cute 3D)', value: '3D Pixar-style, cute character design, soft lighting, smooth textures, vibrant colors, clay render' },
  { label: 'คาวาอี้ (Kawai)', value: 'Kawaii aesthetic, pastel color palette, soft outlines, adorable character design, chibi style, sparkles and hearts, clean vector art, high resolution, cute and heartwarming' },
  { label: 'อนิเมะสดใส (Ghibli Style)', value: 'Studio Ghibli style, lush backgrounds, beautiful scenery, emotional, detailed' }
];

export const LOCATIONS = [
  { label: 'Cozy Living Room', description: 'อบอุ่น, แสงนุ่ม, บรรยากาศพักผ่อน, แสง Daylight' },
  { label: 'Modern Kitchen', description: 'สะอาด, สว่าง, อุปกรณ์ครัวมินิมอล, แสง Daylight' },
  { label: 'Minimalist Cafe', description: 'โทนขาว-ไม้, แสงธรรมชาติจากหน้าต่าง, บรรยากาศเกาหลี' },
  { label: 'Luxury Bedroom', description: 'ดูแพง, ผ้าปูที่นอนพรีเมียม, แสงสลัวยามเช้า' },
  { label: 'พิมพ์ระบุเอง', description: 'ระบุสถานที่ตามต้องการ' }
];

export const LANGUAGE_STYLES = [
  { label: 'วัยรุ่นตัวแม่', description: 'Teen/Pop Culture - ธรรมชาติ, ไม่ยัดเยียด' },
  { label: 'วัยทำงาน', description: 'Professional/Friendly - น่าเชื่อถือ, สุภาพ, เป็นกันเอง' },
  { label: 'แม่ค้าไลฟ์สด', description: 'Hard Sell พลังงานสูง เน้นความเรียล' },
  { label: 'แม่ค้าออนไลน์สายลุย', description: 'เสียงดัง พลังเยอะ พูดตรง เหมือนเพื่อนคุยกัน' }
];

export const STORYTELLING_STYLES = [
  { label: 'UGC (User Generated Content)', description: 'เน้นความเรียลเป็นกันเอง พลังงานสูง' },
  { label: 'Vlog Lifestyle', description: 'เล่าเรื่องผ่านกิจวัตรประจำวัน ดูแพงแต่เข้าถึงง่าย' },
  { label: 'Educational (ให้ความรู้)', description: 'สุภาพน่าเชื่อถือ เจาะลึกเรื่องสารสกัด ประโยชน์' }
];

export const CTA_OPTIONS = [
  { label: 'Entertain (สร้าง Awareness)', description: 'คอนเทนต์สนุกสนาน กระตุ้นอารมณ์' },
  { label: 'Inspire (กระตุ้นยอดขายด้วยอารมณ์)', description: 'รีวิวจาก Influencer หรือ Case Study' },
  { label: 'Educate (สร้างความเชื่อถือ)', description: 'การให้ความรู้ (How-to) หรือเคล็ดลับ (Tips)' },
  { label: 'Convince (ปิดการขาย)', description: 'คอนเทนต์ขายตรง ชูจุดเด่น และมีข้อเสนอพิเศษ' }
];

export const STORYBOARD_TYPES = [
  { label: '4 Frame META-PROMPT', value: '4' },
  { label: '9 Frame META-PROMPT', value: '9' },
  { label: 'พิมพ์ระบุเอง', value: 'custom' }
];

export const PROMPT_TO_STORYBOARD_OPTIONS = [
  { label: 'รวม VISUAL DNA และ Image Prompt', value: 'visual_image' },
  { label: 'รวม VISUAL DNA, Voice DNA และ Video Prompt', value: 'visual_voice_video' },
  { label: 'รวมทุกอย่าง (Visual, Voice, Image, Video, Captions)', value: 'all_in_one' }
];
