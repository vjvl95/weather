import { Dimensions, View } from 'react-native';
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
import { AmbientEffects, RainOverlay } from './AmbientEffects';
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
  const { currentAnchorPosition, onInteraction, pauseAutoMove, resumeAutoMove } = useCharacterDirector();

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
  const spriteScale = useSharedValue(1);

  // 앵커 이동
  const anchorX = useSharedValue(currentAnchorPosition.x * SCREEN_W);
  const anchorY = useSharedValue(currentAnchorPosition.y * SCREEN_H);
  const moveCountRef = useRef(0);

  // 캐릭터 크기 절반 + 여유 마진
  const CHAR_HALF = 100;
  const MARGIN = 20;
  const clampX = (v: number) => Math.max(CHAR_HALF + MARGIN, Math.min(SCREEN_W - CHAR_HALF - MARGIN, v));
  const clampY = (v: number) => Math.max(CHAR_HALF + MARGIN, Math.min(SCREEN_H - CHAR_HALF - MARGIN, v));

  useEffect(() => {
    const easing = pickEasing(moveCountRef.current);
    moveCountRef.current += 1;
    anchorX.value = withTiming(clampX(currentAnchorPosition.x * SCREEN_W), {
      duration: AUTO_MOVE_CONFIG.moveDuration,
      easing,
    });
    anchorY.value = withTiming(clampY(currentAnchorPosition.y * SCREEN_H), {
      duration: AUTO_MOVE_CONFIG.moveDuration,
      easing,
    });
  }, [currentAnchorPosition, anchorX, anchorY]);

  const containerStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: anchorX.value - CHAR_HALF,
    top: anchorY.value - CHAR_HALF,
  }));

  const handleTap = () => {
    onCharacterTap();
  };

  // 드래그로 캐릭터 위치 이동
  const handleDragMove = (dx: number, dy: number) => {
    pauseAutoMove(); // 드래그 중 자동 이동 중지
    anchorX.value = clampX(anchorX.value + dx);
    anchorY.value = clampY(anchorY.value + dy);
  };

  // 드래그 종료 시 자동 이동 재개
  const handleDragEnd = () => {
    resumeAutoMove();
  };

  if (!presentation) return null;

  return (
    <WeatherBackground colors={presentation.backgroundColors}>
      {/* Layer 2: 앰비언트 이펙트 (물방울 등 — 캐릭터 뒤) */}
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

        {/* 캐릭터 본체 (그림자 위에 표시) */}
        {phase !== 'bg' && (
          <Animated.View entering={FadeIn.duration(400).delay(0)} style={{ zIndex: 1 }}>
            <CharacterSprite
              image={presentation.asset.image}
              motionPreset={presentation.motionPreset}
              mood={presentation.mood}
              onTap={handleTap}
              onPetStart={onPetStart}
              onPetEnd={onPetEnd}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              idleOffsetYOutput={idleOffsetY}
              scaleOutput={spriteScale}
            />
          </Animated.View>
        )}

        {/* 그림자 (캐릭터 아래에 표시) */}
        {phase !== 'bg' && (
          <View style={{ zIndex: 0 }}>
            <CharacterShadow idleOffsetY={idleOffsetY} spriteScale={spriteScale} />
          </View>
        )}
      </Animated.View>

      {/* 빗줄기 — 캐릭터 위에 렌더 (유리창 앞에 비가 내리는 느낌) */}
      <RainOverlay effectPreset={presentation.effectPreset} />
    </WeatherBackground>
  );
}
