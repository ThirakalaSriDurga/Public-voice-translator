
export enum InteractionState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  RESPONDING = 'RESPONDING',
  ERROR = 'ERROR'
}

export enum AppMode {
  KIOSK = 'KIOSK',
  CONVERSATION = 'CONVERSATION'
}

export interface KioskLocation {
  id: string;
  name: string;
  type: 'Station' | 'Hospital' | 'Airport' | 'Tourist Point';
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  phone?: string;
  coords: [number, number];
  rating?: number;
  type: 'medical' | 'police' | 'restaurant';
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  translatedText?: string;
  intent?: 'EMERGENCY' | 'DIRECTIONS' | 'INFORMATION' | 'GENERAL';
}

export interface EmergencyInfo extends Place {
  title: string;
  icon: string;
  description: string;
}
