export interface DisplayZone {
  id: string;
  title: string;
  content: string;
  style: 'card-glass' | 'card-bordered' | 'card-solid' | 'card-floating';
}

export interface Page1Config {
  bgType: 'color' | 'image' | 'video';
  bgColor: string;
  bgMediaUrl: string;
  audioUrl: string;
  title: string;
  titleColor: string;
  titleSize: string;
  titleEffect: 'none' | 'neon' | 'glow' | '3d';
  titleVibe: 'none' | 'vibe-subtle' | 'vibe-intense' | 'vibe-pulse' | 'vibe-bounce';
  subtitle: string;
  qrTargetUrl: string;
  qrSize: number;
  qrColor: string;
  qrBg: string;
  qrVibe: 'none' | 'vibe-subtle' | 'vibe-intense' | 'vibe-pulse' | 'vibe-bounce';
  buttonText: string;
  buttonLink: string;
  buttonBg: string;
  buttonColor: string;
  buttonVibe: 'none' | 'vibe-subtle' | 'vibe-intense' | 'vibe-pulse' | 'vibe-bounce';
}

export interface Page2Config {
  bgType: 'color' | 'image' | 'video';
  bgColor: string;
  bgMediaUrl: string;
  audioUrl: string;
  title: string;
  titleColor: string;
  titleSize: string;
  titleEffect: 'none' | 'neon' | 'glow' | '3d';
  titleVibe: 'none' | 'vibe-subtle' | 'vibe-intense' | 'vibe-pulse' | 'vibe-bounce';
  displayZones: DisplayZone[];
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_name: string;
  message: string;
  is_private: boolean;
  recipient_name?: string;
  created_at: string;
}