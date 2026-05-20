import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState } from '../types/game';
import { defaultGameState } from '../lib/constants';
import { getCPS, checkAchievements } from '../lib/gameLogic';
import { loadGame, saveGame } from '../hooks/useSaveLoad';

// ── Action types ──────────────────────────────────────────────────
type Action =
  | { type: 'TICK' }
  | { type: 'CLICK_ORB' }
  | { type: 'BUY_PRODUCER';  id: string }
  | { type: 'SET_USERNAME';  name: string }
  | { type: 'SET_SETTING';   key: keyof GameState['settings']; value: boolean }
  | { type: 'ADD_CHILLS';    amount: number }
  | { type: 'ADD_DIAMONDS';  amount: number }
  | { type: 'SPEND_CHILLS';  amount: number }
  | { type: 'SPEND_DIAMONDS';amount: number }
  | { type: 'UNLOCK_ACH';    id: string }
  | { type: 'ADD_NFT';       nft: GameState['ownedNfts'][0] }
  | { type: 'UNLOCK_ARTEFACT'; id: string }
  | { type: 'UPGRADE_HQ';    id: string }
  | { type: 'SET_SHIELD';    expiry: number }
  | { type: 'LOAD';          state: GameState };

// ── Reducer ───────────────────────────────────────────────────────
import { producerCost } from '../lib/gameLogic';
import { PRODUCERS } from '../lib/constants';

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD':
      return action.state;

    case 'TICK': {
      const cps  = getCPS(state);
      const gain = cps / 10; // called 10x/sec
      return {
        ...state,
        chills:      state.chills      + gain,
        totalChills: state.totalChills + gain,
      };
    }

    case 'CLICK_ORB': {
      const cps      = getCPS(state);
      const clickVal = Math.max(1, cps * 0.01);
      return {
        ...state,
        chills:      state.chills      + clickVal,
        totalChills: state.totalChills + clickVal,
      };
    }

    case 'BUY_PRODUCER': {
      const def   = PRODUCERS.find(p => p.id === action.id);
      if (!def) return state;
      const owned = state.producers[action.id]?.count ?? 0;
      const cost  = producerCost(action.id, owned);
      if (state.chills < cost) return state;
      return {
        ...state,
        chills: state.chills - cost,
        producers: {
          ...state.producers,
          [action.id]: { count: owned + 1, unlocked: true },
        },
      };
    }

    case 'SET_USERNAME':
      return { ...state, username: action.name };

    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };

    case 'ADD_CHILLS':
      return { ...state, chills: state.chills + action.amount, totalChills: state.totalChills + action.amount };

    case 'ADD_DIAMONDS':
      return { ...state, diamonds: state.diamonds + action.amount };

    case 'SPEND_CHILLS':
      return state.chills >= action.amount
        ? { ...state, chills: state.chills - action.amount }
        : state;

    case 'SPEND_DIAMONDS':
      return state.diamonds >= action.amount
        ? { ...state, diamonds: state.diamonds - action.amount }
        : state;

    case 'UNLOCK_ACH':
      return { ...state, achievements: { ...state.achievements, [action.id]: true } };

    case 'ADD_NFT':
      return { ...state, ownedNfts: [...state.ownedNfts, action.nft] };

    case 'UNLOCK_ARTEFACT':
      return { ...state, artefacts: { ...state.artefacts, [action.id]: true } };

    case 'UPGRADE_HQ': {
      const room = state.hqRooms[action.id];
      if (!room) return state;
      return {
        ...state,
        hqRooms: {
          ...state.hqRooms,
          [action.id]: { ...room, level: room.level + 1 },
        },
      };
    }

    case 'SET_SHIELD':
      return { ...state, shieldExpiry: action.expiry };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────
interface GameCtx {
  state:    GameState;
  dispatch: React.Dispatch<Action>;
  cps:      number;
}

const GameContext = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultGameState());
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load save on mount
  useEffect(() => {
    const { state: loaded } = loadGame();
    dispatch({ type: 'LOAD', state: loaded });
  }, []);

  // Game tick — 10x per second
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(() => {
      saveGame(stateRef.current);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Save on tab hide
  useEffect(() => {
    const handler = () => {
      if (document.hidden) saveGame(stateRef.current);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Save on unmount
  useEffect(() => {
    return () => saveGame(stateRef.current);
  }, []);

  // Achievement checker runs after every state change
  useEffect(() => {
    const newly = checkAchievements(state);
    newly.forEach(id => dispatch({ type: 'UNLOCK_ACH', id }));
  }, [state.totalChills, state.ownedNfts.length, state.diamonds]);

  const cps = getCPS(state);

  return (
    <GameContext.Provider value={{ state, dispatch, cps }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
