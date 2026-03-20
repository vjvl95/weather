import { Image, ImageSourcePropType } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  useReducedMotion,
  useAnimatedReaction,
  runOnJS,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import type { MotionPreset, CharacterMood } from '@shared/types';
import { MOTION_PARAMS } from '@shared/config';
import { mulberry32 } from '@shared/lib';

const AnimatedImage = Animated.createAnimatedComponent(Image);

/** 드래그 이동 임계 거리 (px) — 이 이상 이동하면 드래그 모드 */
const DRAG_THRESHOLD = 40;

interface CharacterSpriteProps {
  image: ImageSourcePropType;
  motionPreset: MotionPreset;
  mood: CharacterMood;
  onTap: () => void;
  onPetStart: () => void;
  onPetEnd: () => void;
  /** 드래그로 위치 이동 시 호출 (절대 좌표 변화량) */
  onDragMove?: (dx: number, dy: number) => void;
  /** 드래그 종료 시 호출 */
  onDragEnd?: () => void;
  /** 그림자 연동: idle 부유 모션의 Y만 외부로 전달 */
  idleOffsetYOutput?: SharedValue<number>;
  /** 그림자 연동: scale 값 외부로 전달 */
  scaleOutput?: SharedValue<number>;
}

export function CharacterSprite({
  image,
  motionPreset,
  mood,
  onTap,
  onPetStart,
  onPetEnd,
  onDragMove,
  onDragEnd,
  idleOffsetYOutput,
  scaleOutput,
}: CharacterSpriteProps) {
  const reduceMotion = useReducedMotion();
  const params = MOTION_PARAMS[motionPreset];

  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const rotate = useSharedValue(0);
  const idleRotate = useSharedValue(0);
  const blinkEyeOpacity = useSharedValue(0);

  // idleOffsetY를 외부로 동기화 (그림자용)
  useAnimatedReaction(
    () => translateY.value,
    (val) => {
      if (idleOffsetYOutput) {
        idleOffsetYOutput.value = val;
      }
    },
  );

  // scale을 외부로 동기화 (그림자용)
  useAnimatedReaction(
    () => scale.value,
    (val) => {
      if (scaleOutput) {
        scaleOutput.value = val;
      }
    },
  );

  // idleFloat + idleRotate
  useEffect(() => {
    if (reduceMotion) {
      // Reduced Motion: JS 타이머로 느린 1회 시퀀스 반복 (withRepeat(-1) 금지)
      const slowDuration = params.floatDuration * 2;
      const runSlowIdle = () => {
        translateY.value = withSequence(
          withTiming(-params.floatAmplitude * 0.15, {
            duration: slowDuration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: slowDuration,
            easing: Easing.inOut(Easing.ease),
          }),
        );
      };
      runSlowIdle();
      const interval = setInterval(runSlowIdle, slowDuration * 2);
      return () => clearInterval(interval);
    }

    // 일반 모드: withRepeat 사용
    translateY.value = withRepeat(
      withSequence(
        withTiming(-params.floatAmplitude, {
          duration: params.floatDuration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: params.floatDuration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );

    idleRotate.value = withRepeat(
      withSequence(
        withTiming(params.rotateAmplitude, {
          duration: params.floatDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-params.rotateAmplitude, {
          duration: params.floatDuration,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, [reduceMotion, params, translateY, idleRotate]);

  // blink: 불규칙 간격 눈 깜빡임 (JS 타이머)
  useEffect(() => {
    const rng = mulberry32(Date.now());
    let timer: ReturnType<typeof setTimeout>;
    const doBlink = () => {
      blinkEyeOpacity.value = withSequence(
        withTiming(1, { duration: 75 }),
        withTiming(0, { duration: 75 }),
      );
      const nextDelay = 2000 + rng() * 4000;
      timer = setTimeout(doBlink, nextDelay);
    };
    timer = setTimeout(doBlink, 2000 + rng() * 4000);
    return () => clearTimeout(timer);
  }, [blinkEyeOpacity]);

  // 탭 제스처: mood 기반 리액션 분기
  const tapGesture = Gesture.Tap().onEnd(() => {
    if (mood === 'happy' || mood === 'excited') {
      // reactHappy: 밝은 바운스 (scale만, translateY 조작 금지 — idle 모션과 충돌)
      scale.value = withSequence(
        withSpring(1.2, { damping: 4, stiffness: 300 }),
        withSpring(1, { damping: 8 }),
      );
    } else if (mood === 'cozy' || mood === 'calm' || mood === 'sad') {
      // reactComfort: 부드러운 웅크림
      scaleY.value = withSequence(
        withTiming(0.92, { duration: 300 }),
        withSpring(1, { damping: 12 }),
      );
    } else {
      // 기본 tapBounce
      scale.value = withSequence(
        withSpring(1.15, { damping: 4, stiffness: 300 }),
        withSpring(1, { damping: 8, stiffness: 200 }),
      );
    }
    runOnJS(onTap)();
  });

  // 팬 제스처: 짧은 팬 = 쓰다듬기, 긴 팬(DRAG_THRESHOLD 이상) = 드래그 이동
  const MAX_PET_TILT_DEG = reduceMotion ? 2 : 15;
  const isDragging = useSharedValue(false);
  const lastTranslation = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onStart(() => {
      isDragging.value = false;
      lastTranslation.value = { x: 0, y: 0 };
      runOnJS(onPetStart)();
    })
    .onUpdate((e) => {
      'worklet';
      const distance = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);

      if (distance > DRAG_THRESHOLD) {
        // 드래그 모드: 위치 이동
        isDragging.value = true;
        rotate.value = 0; // 기울어짐 리셋
        const dx = e.translationX - lastTranslation.value.x;
        const dy = e.translationY - lastTranslation.value.y;
        lastTranslation.value = { x: e.translationX, y: e.translationY };
        if (onDragMove) {
          runOnJS(onDragMove)(dx, dy);
        }
      } else {
        // 쓰다듬기 모드: 기울어짐
        const raw = e.translationX * 0.1;
        rotate.value = Math.max(-MAX_PET_TILT_DEG, Math.min(MAX_PET_TILT_DEG, raw));
      }
    })
    .onEnd(() => {
      rotate.value = withSpring(0, { damping: 8 });
      if (isDragging.value && onDragEnd) {
        runOnJS(onDragEnd)();
      }
      runOnJS(onPetEnd)();
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { scaleY: scaleY.value },
      { rotate: `${rotate.value + idleRotate.value}deg` },
    ],
  }));

  const blinkOverlayStyle = useAnimatedStyle(() => ({
    opacity: blinkEyeOpacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[{ width: 200, height: 200 }, animatedStyle]}>
        <AnimatedImage
          source={image}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}
