import { create } from 'zustand';
import type { CharacterStoreState, CharacterStoreActions } from './types';
import { mapWeatherToCharacter, pickRandomMessage } from '../lib/mapWeatherToCharacter';
import type { WeatherCondition, AnchorId } from '@shared/types';

type CharacterStore = CharacterStoreState & CharacterStoreActions;

const initialRuntime = {
  anchorId: 'center-hero' as AnchorId,
  isBubbleVisible: false,
  currentBubbleMessage: null,
  isBeingPetted: false,
  reactionCooldownUntil: null,
  lastAutoMoveAt: null,
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  // State
  currentCondition: 'sunny',
  presentation: mapWeatherToCharacter('sunny'),
  runtime: initialRuntime,

  // Actions
  setCondition: (condition: WeatherCondition) => {
    const presentation = mapWeatherToCharacter(condition);
    set({
      currentCondition: condition,
      presentation,
      runtime: {
        ...get().runtime,
        anchorId: 'center-hero',
      },
    });
  },

  showBubble: () => {
    const { presentation, runtime } = get();
    if (!presentation) return;

    const now = Date.now();
    if (runtime.reactionCooldownUntil && now < runtime.reactionCooldownUntil) return;

    const message = pickRandomMessage(presentation.bubbleMessages);
    set({
      runtime: {
        ...runtime,
        isBubbleVisible: true,
        currentBubbleMessage: message,
      },
    });
  },

  hideBubble: () =>
    set((state) => ({
      runtime: {
        ...state.runtime,
        isBubbleVisible: false,
        currentBubbleMessage: null,
      },
    })),

  setAnchor: (anchorId: AnchorId) =>
    set((state) => ({
      runtime: {
        ...state.runtime,
        anchorId,
        lastAutoMoveAt: Date.now(),
      },
    })),

  setIsPetting: (isPetting: boolean) =>
    set((state) => ({
      runtime: {
        ...state.runtime,
        isBeingPetted: isPetting,
      },
    })),

  setReactionCooldown: (until: number) =>
    set((state) => ({
      runtime: {
        ...state.runtime,
        reactionCooldownUntil: until,
      },
    })),
}));
