import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface CharacterShadowProps {
  idleOffsetY: SharedValue<number>;
  spriteScale: SharedValue<number>;
}

export function CharacterShadow({ idleOffsetY, spriteScale }: CharacterShadowProps) {
  const shadowStyle = useAnimatedStyle(() => {
    const idleScaleX = interpolate(idleOffsetY.value, [-10, 0], [1.15, 1]);
    const opacity = interpolate(idleOffsetY.value, [-10, 0], [0.06, 0.12]);

    return {
      transform: [{ scaleX: idleScaleX * spriteScale.value }, { scaleY: 0.3 * spriteScale.value }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: 120,
          height: 40,
          borderRadius: 60,
          backgroundColor: '#000',
          alignSelf: 'center',
          marginTop: -60,
        },
        shadowStyle,
      ]}
    />
  );
}
