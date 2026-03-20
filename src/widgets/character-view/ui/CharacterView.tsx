import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { memo, useEffect, useRef, useState } from 'react';
import { useCharacterState, useCharacterDirector, useCharacterStore } from '@features/character';
import { pickEasing } from '@shared/lib/animations';
import { AUTO_MOVE_CONFIG } from '@shared/config';
import { WeatherBackground } from './WeatherBackground';
import { AmbientEffects } from './AmbientEffects';
import { CharacterShadow } from './CharacterShadow';
import { CharacterSprite } from './CharacterSprite';
import { SpeechBubble } from './SpeechBubble';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MemoizedAmbientEffects = memo(AmbientEffects);
const MemoizedSpeechBubble = memo(SpeechBubble);

/**
 * 캐릭터 전체 화면 위젯
 *
 * V1 레이어 구조 (Phase 4 — 최종):
 * 1. WeatherBackgroundLayer
 * 2. AmbientEffectLayer
 * 3. AnchorContainer (앵커 이동)
 *    3a. DialogueLayer
 *    3b. CharacterSpriteLayer (idle + 제스처)
 *    3c. CharacterShadowLayer (idleOffsetY)
 */
export function CharacterView() {
  const {
    presentation,
    runtime,
    onCharacterTap,
    onPetStart,
    onPetEnd,
    hideBubble,
  } = useCharacterState();

  const { showBubble } = useCharacterStore();
  const { currentAnchorPosition, onInteraction } = useCharacterDirector();

  // 진입 시퀀스: 배경 → 캐릭터 → idle → 말풍선
  const [phase, setPhase] = useState<'bg' | 'character' | 'idle' | 'ready'>('bg');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('character'), 300),
      setTimeout(() => setPhase('idle'), 800),
      setTimeout(() => {
        setPhase('ready');
        showBubble();
      }, 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showBubble]);

  // 그림자 연동
  const idleOffsetY = useSharedValue(0);

  // 앵커 이동
  const anchorX = useSharedValue(currentAnchorPosition.x * SCREEN_W);
  const anchorY = useSharedValue(currentAnchorPosition.y * SCREEN_H);
  const moveCountRef = useRef(0);

  useEffect(() => {
    const easing = pickEasing(moveCountRef.current);
    moveCountRef.current += 1;
    anchorX.value = withTiming(currentAnchorPosition.x * SCREEN_W, {
      duration: AUTO_MOVE_CONFIG.moveDuration,
      easing,
    });
    anchorY.value = withTiming(currentAnchorPosition.y * SCREEN_H, {
      duration: AUTO_MOVE_CONFIG.moveDuration,
      easing,
    });
  }, [currentAnchorPosition, anchorX, anchorY]);

  const containerStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    transform: [
      { translateX: anchorX.value - SCREEN_W / 2 },
      { translateY: anchorY.value - SCREEN_H / 2 },
    ],
  }));

  const handleTap = () => {
    onInteraction();
    onCharacterTap();
  };

  if (!presentation) return null;

  return (
    <WeatherBackground colors={presentation.backgroundColors}>
      {/* Layer 2: 앰비언트 이펙트 */}
      <MemoizedAmbientEffects effectPreset={presentation.effectPreset} />

      {/* 앵커 컨테이너 */}
      <Animated.View style={containerStyle} className="items-center justify-center">
        {/* 말풍선 */}
        {phase !== 'bg' && (
          <MemoizedSpeechBubble
            message={runtime.currentBubbleMessage}
            visible={runtime.isBubbleVisible}
            onAutoHide={hideBubble}
          />
        )}

        {/* 캐릭터 본체 — phase가 'character' 이상이면 표시 */}
        {phase !== 'bg' && (
          <Animated.View entering={FadeIn.duration(400).delay(0)}>
            <CharacterSprite
              image={presentation.asset.image}
              motionPreset={presentation.motionPreset}
              mood={presentation.mood}
              onTap={handleTap}
              onPetStart={onPetStart}
              onPetEnd={onPetEnd}
              idleOffsetYOutput={idleOffsetY}
            />
          </Animated.View>
        )}

        {/* 그림자 */}
        {phase !== 'bg' && (
          <CharacterShadow idleOffsetY={idleOffsetY} />
        )}
      </Animated.View>
    </WeatherBackground>
  );
}
