import { SAVE_KEY } from '../lib/constants';
import { defaultGameState } from '../lib/constants';
import { calcOfflineChills } from '../lib/gameLogic';
import type { GameState } from '../types/game';

export function loadGame(): { state: GameState; offlineChills: number } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { state: defaultGameState(), offlineChills: 0 };

    const saved = JSON.parse(raw) as Partial<GameState>;
    // Merge saved over defaults so new fields always exist
    const merged: GameState = { ...defaultGameState(), ...saved };
    // Nested merges
    merged.settings  = { ...defaultGameState().settings,  ...(saved.settings  ?? {}) };
    merged.producers = { ...defaultGameState().producers,  ...(saved.producers ?? {}) };
    merged.hqRooms   = { ...defaultGameState().hqRooms,    ...(saved.hqRooms   ?? {}) };

    const offlineChills = calcOfflineChills(merged);
    if (offlineChills > 0 && merged.settings.offlineProgress) {
      merged.chills      += offlineChills;
      merged.totalChills += offlineChills;
    }

    return { state: merged, offlineChills };
  } catch {
    return { state: defaultGameState(), offlineChills: 0 };
  }
}

export function saveGame(state: GameState): void {
  try {
    const toSave: GameState = { ...state, lastSave: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function wipeSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
