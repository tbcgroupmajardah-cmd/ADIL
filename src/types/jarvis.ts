export type SuitMode = 'standard' | 'combat' | 'stealth' | 'overdrive' | 'sentry';

export interface TelemetryData {
  suit: string;
  powerLevel: number;
  powerDrawGJ: number;
  coreTempK: number;
  altitudeFt: number;
  speedMach: number;
  nanotechMesh: number;
  repulsorCharge: number;
  unibeamStatus: 'READY' | 'CHARGING' | 'DISCHARGED' | 'LOCKED';
  inertialDampeners: 'ACTIVE' | 'CALIBRATING' | 'OFFLINE';
  satelliteLink: string;
}

export interface SubsystemStatus {
  id: string;
  name: string;
  status: 'nominal' | 'warning' | 'alert' | 'charging';
  integrity: number;
  powerAllocated: number; // percentage
  description: string;
}

export interface Protocol {
  id: 'house_party' | 'veronica' | 'clean_slate' | 'stealth_ops' | 'combat_overdrive';
  name: string;
  code: string;
  description: string;
  status: 'standby' | 'armed' | 'active' | 'cooldown';
  requiresConfirm: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  sender: 'JARVIS' | 'STARK' | 'SYSTEM';
  text: string;
  type: 'info' | 'voice' | 'alert' | 'protocol';
}

export interface ThreatTarget {
  id: string;
  label: string;
  distanceKm: number;
  bearingDeg: number;
  altitudeM: number;
  threatLevel: 'friendly' | 'unknown' | 'hostile';
  locked: boolean;
}

export interface VoiceCommandDef {
  phrase: string;
  keywords: string[];
  description: string;
  category: 'Tactical' | 'Armor' | 'Protocols' | 'System';
  action: (args?: string) => void;
}
