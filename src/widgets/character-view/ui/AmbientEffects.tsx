import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Ellipse, Defs, RadialGradient, Stop, ClipPath } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
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
      return <RainDroplets count={reduceMotion ? 15 : 60} />;
    case 'snow-fall':
      return <SnowEffect count={reduceMotion ? 10 : 35} />;
    case 'night-stars':
      return <StarEffect count={reduceMotion ? 15 : 60} />;
    case 'cloud-drift':
      return <CloudEffect count={reduceMotion ? 5 : 12} />;
    case 'sun-glow':
      return (
        <>
          <FloatingPetals count={reduceMotion ? 12 : 40} />
          <FloatingButterflies count={reduceMotion ? 3 : 8} />
        </>
      );
    default:
      return null;
  }
}

/** 빗줄기 오버레이 — 캐릭터 위에 렌더해야 자연스러움 */
export function RainOverlay({ effectPreset }: AmbientEffectsProps) {
  const reduceMotion = useReducedMotion();
  if (effectPreset !== 'rain-fall') return null;
  return null; // 빗줄기 임시 비활성화
}

// --- 비 효과 ---

function RainDrop({ startX, delay, duration }: { startX: number; delay: number; duration: number }) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      const slowDuration = duration * 2;
      const runOnce = () => {
        translateY.value = 0;
        translateY.value = withDelay(
          delay,
          withTiming(SCREEN_HEIGHT, { duration: slowDuration, easing: Easing.linear }),
        );
      };
      runOnce();
      const interval = setInterval(runOnce, slowDuration + delay);
      return () => clearInterval(interval);
    }

    const runDrop = () => {
      translateY.value = 0;
      translateY.value = withDelay(
        delay,
        withTiming(SCREEN_HEIGHT, { duration, easing: Easing.linear }),
      );
    };
    runDrop();
    const interval = setInterval(runDrop, duration + delay);
    return () => clearInterval(interval);
  }, [reduceMotion, delay, duration, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -30,
          left: startX,
          width: 12,
          height: 28,
        },
        style,
      ]}
    >
      <Svg width={12} height={28} viewBox="0 0 12 28">
        {/* 빗줄기 본체 — 위가 덜 뾰족하고 통통 */}
        <Path
          d="M4 0 Q2.5 7 2 14 Q1.5 21 3 28 L9 28 Q10.5 21 10 14 Q9.5 7 8 0 Z"
          fill="none"
        />
        {/* 외곽 테두리 */}
        <Path
          d="M4 0 Q2.5 7 2 14 Q1.5 21 3 28 L9 28 Q10.5 21 10 14 Q9.5 7 8 0 Z"
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.5"
        />
        {/* 안쪽 굴절 링 */}
        <Path
          d="M4 0 Q2.5 7 2 14 Q1.5 21 3 28 L9 28 Q10.5 21 10 14 Q9.5 7 8 0 Z"
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1.5"
        />
        {/* 하이라이트 */}
        <Path
          d="M4.5 1 Q3.5 7 3 14 Q2.5 21 3.5 27"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.4"
        />
      </Svg>
    </Animated.View>
  );
}

function RainEffect({ count }: { count: number }) {
  const particles = useMemo(() =>
    generateParticles(count, { durationMin: 3500, durationMax: 5500 }),
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

// --- 액정 물방울 효과 ---

/**
 * 불규칙한 블롭 외곽선 Path 템플릿 (viewBox 54x56 기준)
 * 유리 위 물방울은 완벽한 원이 아니라 표면장력에 의해 불규칙한 형태
 */
const BLOB_PATHS = [
  // 거의 원형 — 작은 물방울은 표면장력으로 거의 동그랗게
  'M27 9 C37 9 45 17 45 28 C45 39 37 47 27 47 C17 47 9 39 9 28 C9 17 17 9 27 9 Z',
  // 살짝 찌그러진 원 — 한쪽이 미세하게 볼록
  'M26 9 C37 8 46 17 45 29 C44 40 36 48 26 47 C16 46 8 38 9 27 C10 16 15 10 26 9 Z',
  // 옆으로 약간 넓은 타원
  'M27 12 C38 11 47 19 46 28 C45 38 37 45 27 45 C17 45 9 38 8 28 C7 19 16 11 27 12 Z',
  // 세로로 약간 긴 타원
  'M27 8 C35 8 42 17 42 28 C42 40 35 49 27 49 C19 49 12 40 12 28 C12 17 19 8 27 8 Z',
  // 불규칙 블롭 — 유기적으로 울퉁불퉁
  'M25 10 C33 8 43 14 45 25 C47 36 40 46 29 47 C18 48 9 40 8 29 C7 18 17 12 25 10 Z',
  // 한쪽 눌린 듯한 형태
  'M28 10 C38 9 46 18 44 30 C42 42 34 47 26 47 C18 47 10 40 10 28 C10 16 18 11 28 10 Z',
  // 위가 살짝만 좁은 자연스러운 방울 — 과장 없이
  'M27 10 C35 9 43 17 43 27 C43 37 37 47 27 48 C18 47 11 37 11 27 C11 17 19 9 27 10 Z',
  // 약간 기울어진 불규칙 형태
  'M24 11 C34 8 45 16 46 28 C47 40 38 48 27 47 C16 46 7 37 8 26 C9 15 14 14 24 11 Z',
];

function Droplet({ x, y, size, delay, shapeIndex, rotation }: {
  x: number; y: number; size: number; delay: number;
  shapeIndex: number; rotation: number;
}) {
  const opacity = useSharedValue(0);
  const driftY = useSharedValue(0);
  const driftX = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fadeIn = 1000 + (delay % 1000);
    const showDuration = reduceMotion ? 15000 : 5000 + (delay % 4000);
    const fadeOut = 1000 + (delay % 1000);
    const initialDelay = delay;
    const totalCycle = fadeIn + showDuration + fadeOut;

    const runOnce = () => {
      opacity.value = 0;
      driftY.value = 0;
      driftX.value = 0;
      opacity.value = withDelay(0, withTiming(0.8 + (size / 36) * 0.2, {
        duration: fadeIn,
        easing: Easing.out(Easing.ease),
      }));
      // 흘러내리는 느낌
      driftY.value = withDelay(0, withTiming(15 + size * 0.15, {
        duration: showDuration + fadeIn,
        easing: Easing.inOut(Easing.ease),
      }));
      // 좌우 흔들림
      driftX.value = withDelay(0, withTiming(-8 + size * 0.3, {
        duration: showDuration + fadeIn,
        easing: Easing.inOut(Easing.ease),
      }));
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: fadeOut, easing: Easing.in(Easing.ease) });
      }, fadeIn + showDuration);
    };
    let interval: ReturnType<typeof setInterval>;
    const startTimer = setTimeout(() => {
      runOnce();
      interval = setInterval(runOnce, totalCycle);
    }, initialDelay);
    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [delay, opacity, driftY, driftX, reduceMotion, size]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: driftY.value },
      { translateX: driftX.value },
    ],
  }));

  const blobPath = BLOB_PATHS[shapeIndex % BLOB_PATHS.length];
  const svgSize = size + 4;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: svgSize,
          height: svgSize,
          transform: [{ rotate: `${rotation}deg` }],
        },
        style,
      ]}
    >
      <Svg width={svgSize} height={svgSize} viewBox="0 0 54 56">
        {/* 외곽 굴절 테두리 — 물방울의 핵심 */}
        <Path
          d={blobPath}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1.5"
        />
        {/* 안쪽 굴절 링 */}
        <Path
          d={blobPath}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="3"
        />

        {/* 하단 caustic — 빛 집광 */}
        <Path
          d="M16 36 Q27 43 38 36"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
        />

        {/* 스펙큘러 하이라이트 */}
        <Circle cx="19" cy="17" r="2.5" fill="rgba(255,255,255,0.6)" />
        <Circle cx="20" cy="16" r="1" fill="rgba(255,255,255,0.9)" />
      </Svg>
    </Animated.View>
  );
}

function RainDroplets({ count }: { count: number }) {
  const rng = useMemo(() => mulberry32(555), []);
  const droplets = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rng() * SCREEN_WIDTH * 0.92,
      y: rng() * SCREEN_HEIGHT * 0.9,
      size: 25 + rng() * 18,
      delay: rng() * 8000,
      shapeIndex: Math.floor(rng() * BLOB_PATHS.length),
      rotation: rng() * 360,   // 같은 모양도 회전시켜 다르게 보이게
    })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {droplets.map((d) => (
        <Droplet key={d.id} x={d.x} y={d.y} size={d.size} delay={d.delay} shapeIndex={d.shapeIndex} rotation={d.rotation} />
      ))}
    </View>
  );
}

// --- 눈 효과 ---

/** 눈송이 SVG 패턴 — 6갈래 결정 구조 */
const SNOWFLAKE_PATHS = [
  // 기본 6갈래 결정
  'M25 5 L25 45 M10 15 L40 35 M40 15 L10 35 M25 12 L20 8 M25 12 L30 8 M25 38 L20 42 M25 38 L30 42 M14 18 L10 14 M14 18 L12 23 M36 18 L40 14 M36 18 L38 23 M14 32 L10 36 M14 32 L12 27 M36 32 L40 36 M36 32 L38 27',
  // 더 섬세한 가지
  'M25 3 L25 47 M8 13 L42 37 M42 13 L8 37 M25 10 L21 5 M25 10 L29 5 M25 40 L21 45 M25 40 L29 45 M13 17 L8 13 M37 17 L42 13 M13 33 L8 37 M37 33 L42 37 M18 25 L13 25 M32 25 L37 25',
  // 심플한 별 모양
  'M25 5 L25 45 M10 15 L40 35 M40 15 L10 35 M25 15 L22 10 M25 15 L28 10 M25 35 L22 40 M25 35 L28 40',
];

function Snowflake({ startX, delay, duration, size, shapeIdx }: {
  startX: number; delay: number; duration: number; size: number; shapeIdx: number;
}) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    if (reduceMotion) {
      const slowDuration = duration * 2;
      const runOnce = () => {
        translateY.value = 0;
        translateX.value = 0;
        translateY.value = withDelay(delay, withTiming(SCREEN_HEIGHT, { duration: slowDuration, easing: Easing.linear }));
      };
      runOnce();
      const interval = setInterval(runOnce, slowDuration + delay);
      return () => clearInterval(interval);
    }

    // 떨어지기
    const runDrop = () => {
      translateY.value = 0;
      translateX.value = 0;
      rot.value = 0;
      opacity.value = 0.7 + (size / 20) * 0.3;

      translateY.value = withDelay(delay, withTiming(SCREEN_HEIGHT, { duration, easing: Easing.linear }));

      // 좌우 흔들림
      translateX.value = withDelay(delay, withRepeat(
        withTiming(15 + size, { duration: duration / 3, easing: Easing.inOut(Easing.ease) }),
        -1, true,
      ));

      // 회전
      rot.value = withDelay(delay, withTiming(360, { duration: duration * 0.8, easing: Easing.linear }));

      // 하단 근처에서 서서히 사라짐
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: duration * 0.2 });
      }, delay + duration * 0.75);
    };
    runDrop();
    const interval = setInterval(runDrop, duration + delay);
    return () => clearInterval(interval);
  }, [reduceMotion, delay, duration, translateY, translateX, rot, opacity, size]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const svgSize = size + 4;
  const snowPath = SNOWFLAKE_PATHS[shapeIdx % SNOWFLAKE_PATHS.length];

  return (
    <Animated.View
      style={[
        { position: 'absolute', top: -size, left: startX, width: svgSize, height: svgSize },
        style,
      ]}
    >
      <Svg width={svgSize} height={svgSize} viewBox="0 0 50 50">
        <Defs>
          <RadialGradient id={`snow-${startX}-${delay}`} cx="45%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <Stop offset="60%" stopColor="rgba(230,240,255,0.7)" />
            <Stop offset="100%" stopColor="rgba(210,225,245,0.3)" />
          </RadialGradient>
        </Defs>
        {/* 눈송이 본체 — 부드러운 원형 글로우 */}
        <Circle cx="25" cy="25" r="18" fill={`url(#snow-${startX}-${delay})`} />
        {/* 결정 가지 */}
        <Path
          d={snowPath}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* 빛 반사 */}
        <Circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.4)" />
        <Circle cx="19" cy="19" r="1.5" fill="rgba(255,255,255,0.7)" />
      </Svg>
    </Animated.View>
  );
}

function SnowEffect({ count }: { count: number }) {
  const rng = useMemo(() => mulberry32(999), []);
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: rng() * SCREEN_WIDTH * 0.95,
      delay: rng() * 4000,
      duration: 5000 + rng() * 5000,
      size: 12 + rng() * 20,
      shapeIdx: Math.floor(rng() * SNOWFLAKE_PATHS.length),
    })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Snowflake key={p.id} startX={p.startX} delay={p.delay} duration={p.duration} size={p.size} shapeIdx={p.shapeIdx} />
      ))}
    </View>
  );
}

// --- 밤하늘 효과 (별 + 달) ---

/** 통통한 별 ★ — 둥근 꼭짓점 */
const STAR_SHAPES = [
  // 통통한 5각 별
  'M25 4 Q27 4 29 17 Q30 17 43 17 Q43 19 33 27 Q33 28 37 41 Q35 41 25 33 Q15 41 13 41 Q17 28 17 27 Q7 19 7 17 Q20 17 21 17 Q23 4 25 4 Z',
  // 약간 다른 비율
  'M25 5 Q27 5 30 18 Q31 18 42 18 Q42 20 32 27 Q33 28 36 40 Q34 40 25 32 Q16 40 14 40 Q18 28 18 27 Q8 20 8 18 Q19 18 20 18 Q23 5 25 5 Z',
  // 살짝 기울어진
  'M26 4 Q28 5 30 17 Q31 17 44 18 Q43 20 33 27 Q34 29 37 41 Q35 41 25 33 Q14 40 13 40 Q16 28 16 26 Q6 18 7 17 Q20 17 21 16 Q24 4 26 4 Z',
];

/** 별 색상 팔레트 */
const STAR_COLORS = [
  { light: 'rgba(255,255,180,1)', mid: 'rgba(255,230,80,0.95)', dark: 'rgba(230,190,30,0.9)', edge: 'rgba(200,160,10,0.85)', stroke: 'rgba(180,140,0,0.3)' },       // 노란
  { light: 'rgba(200,220,255,1)', mid: 'rgba(150,190,255,0.95)', dark: 'rgba(100,150,230,0.9)', edge: 'rgba(70,120,200,0.85)', stroke: 'rgba(50,90,170,0.3)' },       // 파란
  { light: 'rgba(255,200,220,1)', mid: 'rgba(255,150,180,0.95)', dark: 'rgba(230,100,140,0.9)', edge: 'rgba(200,70,110,0.85)', stroke: 'rgba(170,50,80,0.3)' },       // 분홍
  { light: 'rgba(220,255,220,1)', mid: 'rgba(170,240,170,0.95)', dark: 'rgba(120,210,120,0.9)', edge: 'rgba(80,180,80,0.85)', stroke: 'rgba(50,140,50,0.3)' },        // 초록
  { light: 'rgba(255,220,180,1)', mid: 'rgba(255,190,120,0.95)', dark: 'rgba(240,160,70,0.9)', edge: 'rgba(220,130,30,0.85)', stroke: 'rgba(190,100,10,0.3)' },       // 주황
  { light: 'rgba(230,200,255,1)', mid: 'rgba(200,160,255,0.95)', dark: 'rgba(170,120,240,0.9)', edge: 'rgba(140,90,210,0.85)', stroke: 'rgba(110,60,180,0.3)' },      // 보라
  { light: 'rgba(255,255,255,1)', mid: 'rgba(230,240,255,0.95)', dark: 'rgba(210,220,240,0.9)', edge: 'rgba(190,200,220,0.85)', stroke: 'rgba(160,170,190,0.3)' },    // 흰색
];

function Star({ x, y, delay, size, shapeIdx, twinkleSpeed, colorIdx, rotation }: {
  x: number; y: number; delay: number; size: number;
  shapeIdx: number; twinkleSpeed: number; colorIdx: number; rotation: number;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const driftX = useSharedValue(0);
  const driftY = useSharedValue(0);

  useEffect(() => {
    const fadeIn = 2500 + (delay % 1500);
    const showDuration = reduceMotion ? 15000 : 8000 + (delay % 4000);
    const fadeOut = 2500 + (delay % 1500);
    const totalCycle = fadeIn + showDuration + fadeOut;
    const initialDelay = delay;

    const runTwinkle = () => {
      opacity.value = 0;
      scale.value = 0.8;
      driftX.value = 0;
      driftY.value = 0;

      // 천천히 나타남
      opacity.value = withTiming(0.7 + (size / 40) * 0.3, {
        duration: fadeIn,
        easing: Easing.inOut(Easing.ease),
      });
      scale.value = withTiming(1.05, {
        duration: fadeIn,
        easing: Easing.out(Easing.ease),
      });

      // 떠다니는 움직임 (좌우/상하 약 40px)
      driftX.value = withTiming(-20 + (delay % 40), {
        duration: totalCycle,
        easing: Easing.inOut(Easing.ease),
      });
      driftY.value = withTiming(-20 + (delay % 40), {
        duration: totalCycle,
        easing: Easing.inOut(Easing.ease),
      });

      // 천천히 사라짐
      setTimeout(() => {
        opacity.value = withTiming(0, {
          duration: fadeOut,
          easing: Easing.inOut(Easing.ease),
        });
        scale.value = withTiming(0.8, {
          duration: fadeOut,
          easing: Easing.in(Easing.ease),
        });
      }, fadeIn + showDuration);
    };

    let interval: ReturnType<typeof setInterval>;
    const startTimer = setTimeout(() => {
      runTwinkle();
      interval = setInterval(runTwinkle, totalCycle);
    }, initialDelay);
    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [reduceMotion, delay, opacity, scale, driftX, driftY, size]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation}deg` },
      { translateX: driftX.value },
      { translateY: driftY.value },
    ],
  }));

  const svgSize = size + 2;
  const starPath = STAR_SHAPES[shapeIdx % STAR_SHAPES.length];
  const color = STAR_COLORS[colorIdx % STAR_COLORS.length];

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: svgSize, height: svgSize },
        style,
      ]}
    >
      <Svg width={svgSize} height={svgSize} viewBox="0 0 50 50">
        <Defs>
          {/* 별 본체 그라데이션 — 3D 통통한 느낌 */}
          <RadialGradient id={`star-body-${x}-${y}`} cx="40%" cy="35%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color.light} />
            <Stop offset="40%" stopColor={color.mid} />
            <Stop offset="80%" stopColor={color.dark} />
            <Stop offset="100%" stopColor={color.edge} />
          </RadialGradient>
          {/* 글로우 */}
          <RadialGradient id={`star-glow-${x}-${y}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="rgba(255,240,150,0.4)" />
            <Stop offset="50%" stopColor="rgba(255,230,100,0.15)" />
            <Stop offset="100%" stopColor="rgba(255,220,80,0.0)" />
          </RadialGradient>
        </Defs>
        {/* 별 본체 — 통통한 노란 별 */}
        <Path
          d={starPath}
          fill={`url(#star-body-${x}-${y})`}
        />
        {/* 입체감 — 하단 어두운 테두리 */}
        <Path
          d={starPath}
          fill="none"
          stroke={color.stroke}
          strokeWidth="0.8"
        />
        {/* 상단 하이라이트 — 빛 반사 */}
        <Circle cx="22" cy="18" r="4" fill="rgba(255,255,220,0.5)" />
        <Circle cx="21" cy="17" r="1.5" fill="rgba(255,255,255,0.7)" />
      </Svg>
    </Animated.View>
  );
}

/** 달 — crescent=true이면 초승달 */
function Moon({ x, y, size, bgColor, crescent }: { x: number; y: number; size: number; bgColor: string; crescent?: boolean }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: size * 1.5, height: size * 1.5 },
        style,
      ]}
    >
      <Svg width={size * 1.5} height={size * 1.5} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={`moon-glow-${x}`} cx="40%" cy="45%" rx="60%" ry="60%">
            <Stop offset="0%" stopColor="rgba(255,255,210,0.2)" />
            <Stop offset="50%" stopColor="rgba(255,255,200,0.06)" />
            <Stop offset="100%" stopColor="rgba(255,255,180,0.0)" />
          </RadialGradient>
        </Defs>
        {/* 달 글로우 */}
        <Circle cx="45" cy="50" r="45" fill={`url(#moon-glow-${x})`} />
        {/* 달 본체 (밝은 원) */}
        <Circle cx="45" cy="50" r="25" fill="rgba(255,255,220,0.9)" />
        {/* 달 표면 질감 */}
        <Circle cx="50" cy="42" r="3" fill="rgba(230,230,190,0.3)" />
        <Circle cx="55" cy="55" r="2" fill="rgba(230,230,190,0.25)" />
        <Circle cx="42" cy="58" r="2.5" fill="rgba(230,230,190,0.2)" />
        {/* 초승달일 때만: 큰 원을 왼쪽에서 겹쳐서 오른쪽 가장자리만 남김 */}
        {crescent && <Circle cx="55" cy="50" r="23" fill={bgColor} />}
      </Svg>
    </Animated.View>
  );
}

/** 초승달 — 완전 별도 컴포넌트 */
function CrescentMoon({ x, y, size, bgColor }: { x: number; y: number; size: number; bgColor: string }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const s = size * 1.5;

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: s, height: s },
        style,
      ]}
    >
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="crescent-glow" cx="35%" cy="45%" rx="60%" ry="60%">
            <Stop offset="0%" stopColor="rgba(255,255,210,0.15)" />
            <Stop offset="50%" stopColor="rgba(255,255,200,0.05)" />
            <Stop offset="100%" stopColor="rgba(255,255,180,0.0)" />
          </RadialGradient>
        </Defs>
        {/* 글로우 */}
        <Circle cx="45" cy="50" r="40" fill="url(#crescent-glow)" />
        {/* 달 밝은 원 */}
        <Circle cx="45" cy="50" r="22" fill="rgba(255,255,220,0.9)" />
        {/* 배경색 원으로 대부분 덮기 — 왼쪽 얇은 초승달만 남김 */}
        <Circle cx="52" cy="50" r="20" fill={bgColor} />
      </Svg>
    </Animated.View>
  );
}

function StarEffect({ count }: { count: number }) {
  const rng = useMemo(() => mulberry32(42), []);
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rng() * SCREEN_WIDTH * 0.95,
      y: rng() * SCREEN_HEIGHT * 0.9,
      delay: rng() * 3000,
      size: 12 + rng() * 28,
      shapeIdx: Math.floor(rng() * STAR_SHAPES.length),
      colorIdx: Math.floor(rng() * STAR_COLORS.length),
      rotation: Math.floor(rng() * 360),
      twinkleSpeed: 2000 + rng() * 4000,
    })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 초승달 — 우상단 */}
      {/* 오른쪽 위 — 보름달 */}
      <Moon x={SCREEN_WIDTH * 0.65} y={SCREEN_HEIGHT * 0.06} size={70} bgColor="#141430" />
      {/* 별들 */}
      {stars.map((s) => (
        <Star
          key={s.id}
          x={s.x}
          y={s.y}
          delay={s.delay}
          size={s.size}
          shapeIdx={s.shapeIdx}
          colorIdx={s.colorIdx}
          rotation={s.rotation}
          twinkleSpeed={s.twinkleSpeed}
        />
      ))}
    </View>
  );
}

// --- 맑음: 햇살 광선 (God Rays) ---

function SunRays() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-5);

  useEffect(() => {
    // 천천히 나타남
    opacity.value = withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) });

    if (!reduceMotion) {
      // 미세하게 흔들리는 광선
      const runSway = () => {
        rotate.value = withTiming(5, { duration: 8000, easing: Easing.inOut(Easing.ease) });
        setTimeout(() => {
          rotate.value = withTiming(-5, { duration: 8000, easing: Easing.inOut(Easing.ease) });
        }, 8000);
      };
      runSway();
      const interval = setInterval(runSway, 16000);
      return () => clearInterval(interval);
    }
  }, [opacity, rotate, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const W = SCREEN_WIDTH;
  const H = SCREEN_HEIGHT;
  // 태양 위치: 우상단 화면 밖
  const sunX = W * 1.1;
  const sunY = -H * 0.1;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', overflow: 'hidden' }, style]}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 빛줄기 5개 — 우상단에서 대각선으로 넓게 퍼짐 */}
        <Path
          d={`M${W} 0 L${W * 0.2} ${H * 0.85} L${W * 0.35} ${H * 0.9} L${W} ${H * 0.08} Z`}
          fill="rgba(255,250,200,0.12)"
        />
        <Path
          d={`M${W * 0.9} 0 L${W * 0.05} ${H * 0.75} L${W * 0.18} ${H * 0.82} L${W} 0 Z`}
          fill="rgba(255,250,200,0.08)"
        />
        <Path
          d={`M${W} ${H * 0.1} L${W * 0.35} ${H * 0.95} L${W * 0.5} ${H} L${W} ${H * 0.25} Z`}
          fill="rgba(255,250,200,0.1)"
        />
        <Path
          d={`M${W * 0.8} 0 L${W * -0.05} ${H * 0.6} L${W * 0.08} ${H * 0.68} L${W * 0.88} 0 Z`}
          fill="rgba(255,250,200,0.06)"
        />
        <Path
          d={`M${W} ${H * 0.2} L${W * 0.5} ${H} L${W * 0.62} ${H} L${W} ${H * 0.35} Z`}
          fill="rgba(255,250,200,0.07)"
        />
      </Svg>
    </Animated.View>
  );
}

// --- 맑음: 꽃잎/나비 ---

/** 꽃잎 SVG 패턴 */
const PETAL_SHAPES = [
  // 벚꽃 꽃잎
  'M15 5 Q20 0 25 5 Q30 12 25 25 Q20 30 15 25 Q10 12 15 5 Z',
  // 둥근 꽃잎
  'M15 3 Q22 0 27 8 Q30 18 22 28 Q15 32 10 25 Q5 15 15 3 Z',
  // 나뭇잎
  'M12 5 Q20 0 28 8 Q32 18 25 28 Q18 30 12 22 Q6 14 12 5 Z',
];

const PETAL_COLORS = [
  { fill: 'rgba(255,200,210,0.7)', stroke: 'rgba(255,150,170,0.4)' },  // 분홍
  { fill: 'rgba(255,230,200,0.7)', stroke: 'rgba(255,200,150,0.4)' },  // 살구
  { fill: 'rgba(255,220,220,0.6)', stroke: 'rgba(255,180,180,0.3)' },  // 연분홍
  { fill: 'rgba(255,255,220,0.6)', stroke: 'rgba(240,230,150,0.3)' },  // 연노랑
  { fill: 'rgba(220,240,255,0.6)', stroke: 'rgba(180,210,240,0.3)' },  // 연하늘
];

function Petal({ startX, startY, delay, duration, size, shapeIdx, colorIdx }: {
  startX: number; startY: number; delay: number; duration: number;
  size: number; shapeIdx: number; colorIdx: number;
}) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const runFloat = () => {
      translateY.value = 0;
      translateX.value = 0;
      rot.value = 0;
      opacity.value = 0;

      // 나타남
      opacity.value = withDelay(delay, withTiming(0.8, { duration: 1500, easing: Easing.out(Easing.ease) }));

      // 아래로 떠내려감 + 좌우 흔들림
      translateY.value = withDelay(delay, withTiming(SCREEN_HEIGHT * 0.7, {
        duration: reduceMotion ? duration * 2 : duration,
        easing: Easing.linear,
      }));

      // 좌우 사인파 흔들림
      translateX.value = withDelay(delay, withRepeat(
        withTiming(30 + size, { duration: duration / 3, easing: Easing.inOut(Easing.ease) }),
        -1, true,
      ));

      // 빙글빙글 회전
      rot.value = withDelay(delay, withTiming(360 + (delay % 180), {
        duration: reduceMotion ? duration * 2 : duration,
        easing: Easing.linear,
      }));

      // 하단에서 사라짐
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 2000, easing: Easing.in(Easing.ease) });
      }, delay + (reduceMotion ? duration * 1.6 : duration * 0.8));
    };

    runFloat();
    const interval = setInterval(runFloat, duration + delay + 2000);
    return () => clearInterval(interval);
  }, [reduceMotion, delay, duration, translateY, translateX, rot, opacity, size]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  const svgSize = size + 4;
  const petalPath = PETAL_SHAPES[shapeIdx % PETAL_SHAPES.length];
  const color = PETAL_COLORS[colorIdx % PETAL_COLORS.length];

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: startX, top: startY - 30, width: svgSize, height: svgSize },
        style,
      ]}
    >
      <Svg width={svgSize} height={svgSize} viewBox="0 0 35 35">
        <Defs>
          <RadialGradient id={`petal-${startX}-${delay}`} cx="40%" cy="35%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </RadialGradient>
        </Defs>
        {/* 꽃잎 본체 */}
        <Path
          d={petalPath}
          fill={color.fill}
          stroke={color.stroke}
          strokeWidth="0.5"
        />
        {/* 하이라이트 */}
        <Ellipse cx="17" cy="12" rx="4" ry="3" fill={`url(#petal-${startX}-${delay})`} />
      </Svg>
    </Animated.View>
  );
}

function FloatingPetals({ count }: { count: number }) {
  const rng = useMemo(() => mulberry32(333), []);
  const petals = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: rng() * SCREEN_WIDTH * 0.9,
      startY: rng() * SCREEN_HEIGHT * 0.3,
      delay: rng() * 5000,
      duration: 8000 + rng() * 6000,
      size: 14 + rng() * 14,
      shapeIdx: Math.floor(rng() * PETAL_SHAPES.length),
      colorIdx: Math.floor(rng() * PETAL_COLORS.length),
    })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {petals.map((p) => (
        <Petal
          key={p.id}
          startX={p.startX}
          startY={p.startY}
          delay={p.delay}
          duration={p.duration}
          size={p.size}
          shapeIdx={p.shapeIdx}
          colorIdx={p.colorIdx}
        />
      ))}
    </View>
  );
}

// --- 맑음: 나비 ---

const BUTTERFLY_COLORS = [
  { wing: 'rgba(255,180,50,0.85)', wingDark: 'rgba(220,140,20,0.9)', body: 'rgba(80,50,20,0.9)', spot: 'rgba(200,120,10,0.5)' },      // 주황 나비
  { wing: 'rgba(100,180,255,0.85)', wingDark: 'rgba(60,130,220,0.9)', body: 'rgba(30,50,80,0.9)', spot: 'rgba(50,120,200,0.5)' },      // 파란 나비
  { wing: 'rgba(255,150,200,0.85)', wingDark: 'rgba(220,100,160,0.9)', body: 'rgba(80,30,50,0.9)', spot: 'rgba(200,80,130,0.5)' },     // 분홍 나비
  { wing: 'rgba(255,240,100,0.85)', wingDark: 'rgba(230,210,50,0.9)', body: 'rgba(80,70,10,0.9)', spot: 'rgba(210,190,30,0.5)' },      // 노란 나비
  { wing: 'rgba(180,130,255,0.85)', wingDark: 'rgba(140,90,220,0.9)', body: 'rgba(50,30,80,0.9)', spot: 'rgba(120,70,200,0.5)' },      // 보라 나비
];

function Butterfly({ startX, startY, delay, size, colorIdx }: {
  startX: number; startY: number; delay: number; size: number; colorIdx: number;
}) {
  const reduceMotion = useReducedMotion();
  const posX = useSharedValue(startX);
  const posY = useSharedValue(startY);
  const wingAngle = useSharedValue(0);
  const opacity = useSharedValue(0);

  const color = BUTTERFLY_COLORS[colorIdx % BUTTERFLY_COLORS.length];

  useEffect(() => {
    const flightDuration = reduceMotion ? 20000 : 12000;

    const runFlight = () => {
      opacity.value = 0;
      posX.value = startX;
      posY.value = startY;

      // 나타남
      opacity.value = withDelay(delay, withTiming(1, { duration: 1500 }));

      // 불규칙 비행 경로 — 여러 waypoint를 순차 이동
      posX.value = withDelay(delay, withSequence(
        withTiming(startX + 40, { duration: flightDuration * 0.25, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX - 30, { duration: flightDuration * 0.25, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX + 60, { duration: flightDuration * 0.25, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX + 20, { duration: flightDuration * 0.25, easing: Easing.inOut(Easing.ease) }),
      ));

      posY.value = withDelay(delay, withSequence(
        withTiming(startY - 30, { duration: flightDuration * 0.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(startY + 20, { duration: flightDuration * 0.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(startY - 50, { duration: flightDuration * 0.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(startY + 10, { duration: flightDuration * 0.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(startY - 20, { duration: flightDuration * 0.2, easing: Easing.inOut(Easing.ease) }),
      ));

      // 사라짐
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 2000 });
      }, delay + flightDuration * 0.85);
    };

    // 날갯짓 — 빠르게 반복
    if (!reduceMotion) {
      const flapOnce = () => {
        wingAngle.value = withSequence(
          withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        );
      };
      flapOnce();
      const flapInterval = setInterval(flapOnce, 300);

      runFlight();
      const flightInterval = setInterval(runFlight, 12000 + delay + 2000);
      return () => {
        clearInterval(flapInterval);
        clearInterval(flightInterval);
      };
    }

    runFlight();
    const flightInterval = setInterval(runFlight, 20000 + delay + 2000);
    return () => clearInterval(flightInterval);
  }, [reduceMotion, delay, startX, startY, posX, posY, wingAngle, opacity]);

  const bodyStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: posX.value,
    top: posY.value,
    opacity: opacity.value,
  }));

  // 왼쪽 날개
  const leftWingStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 100 },
      { rotateY: `${wingAngle.value * 70}deg` },
    ],
  }));

  // 오른쪽 날개
  const rightWingStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 100 },
      { rotateY: `${-wingAngle.value * 70}deg` },
    ],
  }));

  const s = size;
  const wingW = s * 0.48;
  const wingH = s * 0.7;

  return (
    <Animated.View style={bodyStyle}>
      <View style={{ width: s, height: s, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {/* 왼쪽 날개 */}
        <Animated.View style={[{ width: wingW, height: wingH, marginRight: -2 }, leftWingStyle]}>
          <Svg width={wingW} height={wingH} viewBox="0 0 24 35">
            {/* 윗날개 */}
            <Path
              d="M24 15 Q22 3 12 0 Q2 2 0 12 Q1 18 8 20 Q14 22 24 15 Z"
              fill={color.wing}
              stroke={color.wingDark}
              strokeWidth="0.5"
            />
            {/* 아랫날개 */}
            <Path
              d="M24 17 Q20 22 14 28 Q8 35 4 30 Q0 25 2 18 Q8 20 24 17 Z"
              fill={color.wing}
              stroke={color.wingDark}
              strokeWidth="0.5"
            />
            {/* 무늬 */}
            <Circle cx="12" cy="10" r="3" fill={color.spot} />
            <Circle cx="10" cy="24" r="2" fill={color.spot} />
          </Svg>
        </Animated.View>

        {/* 몸통 */}
        <View style={{ width: 3, height: s * 0.5, backgroundColor: color.body, borderRadius: 1.5, zIndex: 1 }} />

        {/* 오른쪽 날개 (좌우 반전) */}
        <Animated.View style={[{ width: wingW, height: wingH, marginLeft: -2, transform: [{ scaleX: -1 }] }, rightWingStyle]}>
          <Svg width={wingW} height={wingH} viewBox="0 0 24 35">
            <Path
              d="M24 15 Q22 3 12 0 Q2 2 0 12 Q1 18 8 20 Q14 22 24 15 Z"
              fill={color.wing}
              stroke={color.wingDark}
              strokeWidth="0.5"
            />
            <Path
              d="M24 17 Q20 22 14 28 Q8 35 4 30 Q0 25 2 18 Q8 20 24 17 Z"
              fill={color.wing}
              stroke={color.wingDark}
              strokeWidth="0.5"
            />
            <Circle cx="12" cy="10" r="3" fill={color.spot} />
            <Circle cx="10" cy="24" r="2" fill={color.spot} />
          </Svg>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function FloatingButterflies({ count }: { count: number }) {
  const rng = useMemo(() => mulberry32(777), []);
  const butterflies = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: SCREEN_WIDTH * 0.1 + rng() * SCREEN_WIDTH * 0.7,
      startY: SCREEN_HEIGHT * 0.15 + rng() * SCREEN_HEIGHT * 0.5,
      delay: rng() * 6000,
      size: 30 + rng() * 20,
      colorIdx: Math.floor(rng() * BUTTERFLY_COLORS.length),
    })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {butterflies.map((b) => (
        <Butterfly
          key={b.id}
          startX={b.startX}
          startY={b.startY}
          delay={b.delay}
          size={b.size}
          colorIdx={b.colorIdx}
        />
      ))}
    </View>
  );
}

// --- 안개/미스트 효과 ---

function FogEffect() {
  const reduceMotion = useReducedMotion();
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const drift3 = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 천천히 나타남
    opacity.value = withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) });

    if (!reduceMotion) {
      // 각 레이어가 다른 속도로 좌우 흔들림
      const sway = () => {
        drift1.value = withTiming(20, { duration: 12000, easing: Easing.inOut(Easing.ease) });
        drift2.value = withTiming(-15, { duration: 10000, easing: Easing.inOut(Easing.ease) });
        drift3.value = withTiming(10, { duration: 14000, easing: Easing.inOut(Easing.ease) });
        setTimeout(() => {
          drift1.value = withTiming(-20, { duration: 12000, easing: Easing.inOut(Easing.ease) });
          drift2.value = withTiming(15, { duration: 10000, easing: Easing.inOut(Easing.ease) });
          drift3.value = withTiming(-10, { duration: 14000, easing: Easing.inOut(Easing.ease) });
        }, 12000);
      };
      sway();
      const interval = setInterval(sway, 24000);
      return () => clearInterval(interval);
    }
  }, [reduceMotion, drift1, drift2, drift3, opacity]);

  const layer1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift1.value }],
    opacity: opacity.value * 0.35,
  }));
  const layer2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift2.value }],
    opacity: opacity.value * 0.25,
  }));
  const layer3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift3.value }],
    opacity: opacity.value * 0.15,
  }));

  const W = SCREEN_WIDTH;
  const H = SCREEN_HEIGHT;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 하단 안개 — 가장 진하고 두꺼움 */}
      <Animated.View style={[{ position: 'absolute', bottom: 0, width: W, height: H * 0.45 }, layer1Style]}>
        <Svg width={W} height={H * 0.45} viewBox={`0 0 ${W} ${H * 0.45}`}>
          <Defs>
            <RadialGradient id="fog-bottom" cx="50%" cy="80%" rx="80%" ry="60%">
              <Stop offset="0%" stopColor="rgba(190,200,215,1)" />
              <Stop offset="50%" stopColor="rgba(190,200,215,0.5)" />
              <Stop offset="100%" stopColor="rgba(190,200,215,0.0)" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={W * 0.5} cy={H * 0.35} rx={W * 0.8} ry={H * 0.3} fill="url(#fog-bottom)" />
        </Svg>
      </Animated.View>

      {/* 중단 안개 — 옅고 넓게 */}
      <Animated.View style={[{ position: 'absolute', bottom: H * 0.2, width: W, height: H * 0.35 }, layer2Style]}>
        <Svg width={W} height={H * 0.35} viewBox={`0 0 ${W} ${H * 0.35}`}>
          <Defs>
            <RadialGradient id="fog-mid" cx="50%" cy="70%" rx="90%" ry="50%">
              <Stop offset="0%" stopColor="rgba(195,205,220,1)" />
              <Stop offset="60%" stopColor="rgba(195,205,220,0.3)" />
              <Stop offset="100%" stopColor="rgba(195,205,220,0.0)" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={W * 0.5} cy={H * 0.25} rx={W * 0.9} ry={H * 0.22} fill="url(#fog-mid)" />
        </Svg>
      </Animated.View>

      {/* 상단 안개 — 아주 옅게 전체 덮음 */}
      <Animated.View style={[{ position: 'absolute', top: H * 0.2, width: W, height: H * 0.3 }, layer3Style]}>
        <Svg width={W} height={H * 0.3} viewBox={`0 0 ${W} ${H * 0.3}`}>
          <Defs>
            <RadialGradient id="fog-top" cx="50%" cy="50%" rx="100%" ry="50%">
              <Stop offset="0%" stopColor="rgba(200,210,225,1)" />
              <Stop offset="70%" stopColor="rgba(200,210,225,0.15)" />
              <Stop offset="100%" stopColor="rgba(200,210,225,0.0)" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={W * 0.5} cy={H * 0.15} rx={W} ry={H * 0.15} fill="url(#fog-top)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// --- 구름/먼지 효과 ---

function CloudPuff({ startX, startY, size, delay, duration, direction }: {
  startX: number; startY: number; size: number; delay: number; duration: number; direction: 1 | -1;
}) {
  const reduceMotion = useReducedMotion();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const moveDistance = SCREEN_WIDTH * 0.5 * direction;

  useEffect(() => {
    if (reduceMotion) {
      const slowDuration = duration * 2;
      const runOnce = () => {
        translateX.value = 0;
        opacity.value = 0;
        opacity.value = withDelay(delay, withTiming(0.15, { duration: slowDuration * 0.3 }));
        translateX.value = withDelay(delay, withTiming(moveDistance, { duration: slowDuration, easing: Easing.linear }));
        setTimeout(() => {
          opacity.value = withTiming(0, { duration: slowDuration * 0.3 });
        }, slowDuration * 0.7 + delay);
      };
      runOnce();
      const interval = setInterval(runOnce, slowDuration + delay);
      return () => clearInterval(interval);
    }

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.2, { duration: duration * 0.2 }),
        -1,
        true,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(moveDistance, { duration, easing: Easing.linear }),
        -1,
      ),
    );
  }, [reduceMotion, delay, duration, translateX, opacity, moveDistance]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
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
          height: size * 0.6,
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 200 120">
        <Path
          d="M170 105 Q180 105 180 95 Q180 80 165 78 Q170 55 150 45 Q140 25 115 28 Q105 10 80 15 Q55 5 45 25 Q20 20 18 45 Q0 50 5 70 Q0 90 20 95 Q15 105 30 105 Z"
          fill="rgba(255,255,255,0.4)"
        />
      </Svg>
    </Animated.View>
  );
}

function CloudEffect({ count }: { count: number }) {
  const rng = useMemo(() => mulberry32(777), []);
  const clouds = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const goRight = rng() > 0.5;
      return {
        id: i,
        startX: goRight
          ? -120 + rng() * SCREEN_WIDTH * 0.3          // 왼쪽에서 시작
          : SCREEN_WIDTH * 0.7 + rng() * SCREEN_WIDTH * 0.3, // 오른쪽에서 시작
        startY: rng() * SCREEN_HEIGHT * 0.85,
        size: 100 + rng() * 20,
        delay: rng() * 5000,
        duration: 10000 + rng() * 8000,
        direction: (goRight ? 1 : -1) as 1 | -1,
      };
    }),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {clouds.map((c) => (
        <CloudPuff
          key={c.id}
          startX={c.startX}
          startY={c.startY}
          size={c.size}
          delay={c.delay}
          duration={c.duration}
          direction={c.direction}
        />
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
