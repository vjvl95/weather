import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface CharacterShadowProps {
  idleOffsetY: SharedValue<number>;
}

export function CharacterShadow({ idleOffsetY }: CharacterShadowProps) {
  const shadowStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(idleOffsetY.value, [-10, 0], [1.15, 1]);
    const opacity = interpolate(idleOffsetY.value, [-10, 0], [0.15, 0.3]);

    return {
      transform: [{ scaleX }, { scaleY: 0.3 }],
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
          marginTop: -10,
        },
        shadowStyle,
      ]}
    />
  );
}
