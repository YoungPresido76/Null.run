import { SAVE_KEY } from '../lib/constants';
import { defaultGameState } from '../lib/constants';
import { calcOfflineChills } from '../lib/gameLogic';
import type { GameState } from '../types/game';

export function loadGame(): { state: GameState; offlineChills: number } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { state: defaultGameState(), offlineChills: 0 };

    const saved = JSON.parse(raw) as Partial<GameState>;
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
      return { state: defaultGameState(), offlineChills: 0 };
    }

    const defaults = defaultGameState();
    // Merge saved over defaults so new fields always exist.
    const merged: GameState = { ...defaults, ...saved };
    // Nested merges prevent partial or older saves from replacing whole collections.
    merged.settings  = { ...defaults.settings,  ...(saved.settings  ?? {}) };
    merged.producers = { ...defaults.producers, ...(saved.producers ?? {}) };
    merged.hqRooms   = { ...defaults.hqRooms,    ...(saved.hqRooms   ?? {}) };
    merged.upgrades = { ...defaults.upgrades, ...(saved.upgrades ?? {}) };
    merged.achievements = { ...defaults.achievements, ...(saved.achievements ?? {}) };
    merged.artefacts = { ...defaults.artefacts, ...(saved.artefacts ?? {}) };
    merged.ownedNfts = Array.isArray(saved.ownedNfts) ? saved.ownedNfts : defaults.ownedNfts;
    merged.stakes = Array.isArray(saved.stakes) ? saved.stakes : defaults.stakes;
    merged.diamondStakes = Array.isArray(saved.diamondStakes) ? saved.diamondStakes : defaults.diamondStakes;
    merged.lastSave = typeof saved.lastSave === 'number' && Number.isFinite(saved.lastSave)
      ? saved.lastSave
      : Date.now();

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
