import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useMemo } from 'react';
import type { EffectPreset } from '@shared/types';
import { mulberry32 } from '@shared/lib';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AmbientEffectsProps {
  effectPreset: EffectPreset;
}

interface Particle {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export function AmbientEffects({ effectPreset }: AmbientEffectsProps) {
  const reduceMotion = useReducedMotion();

  switch (effectPreset) {
    case 'rain-fall':
      return <RainEffect count={reduceMotion ? 5 : 20} />;
    case 'snow-fall':
      return <SnowEffect count={reduceMotion ? 5 : 15} />;
    case 'night-stars':
      return <StarEffect count={reduceMotion ? 3 : 10} />;
    case 'sun-glow':
    case 'cloud-drift':
      return null;
    default:
      return null;
  }
}

// --- 비 효과 ---

function RainDrop({ startX, delay, duration }: { startX: number; delay: number; duration: number }) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (reduceMotion) {
      const slowDuration = duration * 2;
      const runOnce = () => {
        translateY.value = -20;
        translateY.value = withDelay(
          delay,
          withTiming(SCREEN_HEIGHT + 20, { duration: slowDuration, easing: Easing.linear }),
        );
      };
      runOnce();
      const interval = setInterval(runOnce, slowDuration + delay);
      return () => clearInterval(interval);
    }

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 20, { duration, easing: Easing.linear }),
        -1,
      ),
    );
  }, [reduceMotion, delay, duration, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          width: 1.5,
          height: 18,
          backgroundColor: 'rgba(174,194,224,0.5)',
          borderRadius: 1,
        },
        style,
      ]}
    />
  );
}

function RainEffect({ count }: { count: number }) {
  const particles = useMemo(() =>
    generateParticles(count, { durationMin: 800, durationMax: 1200 }),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <RainDrop key={p.id} startX={p.startX} delay={p.delay} duration={p.duration} />
      ))}
    </View>
  );
}

// --- 눈 효과 ---

function Snowflake({ startX, delay, duration, size }: {
  startX: number; delay: number; duration: number; size: number;
}) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      const slowDuration = duration * 2;
      const runOnce = () => {
        translateY.value = -20;
        translateX.value = 0;
        translateY.value = withDelay(
          delay,
          withTiming(SCREEN_HEIGHT + 20, { duration: slowDuration, easing: Easing.linear }),
        );
      };
      runOnce();
      const interval = setInterval(runOnce, slowDuration + delay);
      return () => clearInterval(interval);
    }

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 20, { duration, easing: Easing.linear }),
        -1,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [reduceMotion, delay, duration, translateY, translateX]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          width: size,
          height: size,
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

function SnowEffect({ count }: { count: number }) {
  const particles = useMemo(() =>
    generateParticles(count, { durationMin: 3000, durationMax: 5000, sizeMin: 4, sizeMax: 8 }),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Snowflake key={p.id} startX={p.startX} delay={p.delay} duration={p.duration} size={p.size} />
      ))}
    </View>
  );
}

// --- 별 효과 ---

function Star({ startX, startY, delay, size }: {
  startX: number; startY: number; delay: number; size: number;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (reduceMotion) {
      const slowDuration = 4000;
      const runOnce = () => {
        opacity.value = withTiming(1, { duration: slowDuration, easing: Easing.inOut(Easing.ease) });
        setTimeout(() => {
          opacity.value = withTiming(0.3, { duration: slowDuration, easing: Easing.inOut(Easing.ease) });
        }, slowDuration);
      };
      runOnce();
      const interval = setInterval(runOnce, slowDuration * 2);
      return () => clearInterval(interval);
    }

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [reduceMotion, delay, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: startY,
          width: size,
          height: size,
          backgroundColor: 'rgba(255,255,240,0.9)',
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

function StarEffect({ count }: { count: number }) {
  const rng = mulberry32(42);
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: rng() * SCREEN_WIDTH,
      startY: rng() * SCREEN_HEIGHT * 0.5,
      delay: rng() * 3000,
      size: 2 + rng() * 3,
    })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s) => (
        <Star key={s.id} startX={s.startX} startY={s.startY} delay={s.delay} size={s.size} />
      ))}
    </View>
  );
}

// --- 유틸 ---

function generateParticles(
  count: number,
  opts: { durationMin: number; durationMax: number; sizeMin?: number; sizeMax?: number },
): Particle[] {
  const rng = mulberry32(123);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: rng() * SCREEN_WIDTH,
    delay: rng() * 2000,
    duration: opts.durationMin + rng() * (opts.durationMax - opts.durationMin),
    size: (opts.sizeMin ?? 4) + rng() * ((opts.sizeMax ?? 8) - (opts.sizeMin ?? 4)),
    opacity: 0.3 + rng() * 0.5,
  }));
}
