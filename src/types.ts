export type Format = 'Single Track' | 'Freestyle' | 'EP' | 'Mixtape' | 'Album';

export interface Persona {
  id: string;
  name: string;
  vocalBlock: string;
  isCustom: boolean;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  cadence: string;
}

export interface Producer {
  id: string;
  name: string;
  tags: string;
}

export interface Track {
  id: string;
  trackNumber: number;
  title: string;
  projectTitle?: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  styleTag?: string;
  lyrics?: string;
  error?: string;
}

export interface SavedSong {
  id: string;
  title: string;
  personaName: string;
  producerName?: string;
  format: string;
  dateSaved: string;
  styleTag: string;
  lyrics: string;
}
