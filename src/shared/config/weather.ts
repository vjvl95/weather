import type { WeatherCondition, CharacterPresentationState } from '@shared/types';

/** 날씨별 캐릭터 표현 상태 매핑 */
export const WEATHER_CHARACTER_MAP: Record<WeatherCondition, CharacterPresentationState> = {
  sunny: {
    weatherCondition: 'sunny',
    mood: 'happy',
    motionPreset: 'bounce-happy',
    effectPreset: 'sun-glow',
    bubbleMessages: [
      '오늘 날씨가 정말 좋아요! 기분 좋은 하루 되세요~',
      '햇살이 따뜻해요! 산책 어때요?',
      '맑은 하늘이에요! 기분이 좋아지네~',
    ],
    backgroundColors: ['#87CEEB', '#5BA3D9'],
    asset: {
      image: require('../assets/characters/monggeul-sunny.png'),
      expression: '행복한 표정',
    },
  },
  cloudy: {
    weatherCondition: 'cloudy',
    mood: 'sleepy',
    motionPreset: 'float-sleepy',
    effectPreset: 'cloud-drift',
    bubbleMessages: [
      '오늘은 구름이 많아요. 그래도 좋은 하루예요~',
      '흐린 날엔 따뜻한 음료가 딱이에요~',
      '구름이 많지만 기분은 맑게!',
    ],
    backgroundColors: ['#B0B0B0', '#8A8A8A'],
    asset: {
      image: require('../assets/characters/monggeul-cloudy.png'),
      expression: '졸린 표정',
    },
  },
  rainy: {
    weatherCondition: 'rainy',
    mood: 'cozy',
    motionPreset: 'float-soft',
    effectPreset: 'rain-fall',
    bubbleMessages: [
      '비가 와요! 우산 꼭 챙기세요~',
      '빗소리가 좋아요... 따뜻하게 지내세요~',
      '비 오는 날엔 집이 최고예요!',
    ],
    backgroundColors: ['#708090', '#4A5568'],
    asset: {
      image: require('../assets/characters/monggeul-rainy.png'),
      expression: '살짝 슬픈 표정',
    },
  },
  snowy: {
    weatherCondition: 'snowy',
    mood: 'excited',
    motionPreset: 'bounce-happy',
    effectPreset: 'snow-fall',
    bubbleMessages: [
      '눈이 와요! 따뜻하게 입고 나가세요~',
      '눈사람 만들고 싶다! 같이 가요~',
      '하얀 세상이에요! 너무 예쁘다~',
    ],
    backgroundColors: ['#B0C4DE', '#8BA4C4'],
    asset: {
      image: require('../assets/characters/monggeul-snowy.png'),
      expression: '신난 표정',
    },
  },
  night: {
    weatherCondition: 'night',
    mood: 'calm',
    motionPreset: 'settle-night',
    effectPreset: 'night-stars',
    bubbleMessages: [
      '좋은 밤이에요. 오늘도 수고했어요~',
      '별이 예뻐요... 푹 쉬세요~',
      '내일도 좋은 날이 될 거예요~',
    ],
    backgroundColors: ['#1A1A3E', '#0D0D2B'],
    asset: {
      image: require('../assets/characters/monggeul-night.png'),
      expression: '나른한 표정',
    },
  },
};

/** 기상청 API 코드를 WeatherCondition으로 변환 */
export function mapWeatherCode(
  pty: string,
  sky: string,
  hour: number,
): WeatherCondition {
  if (hour >= 18 || hour < 6) return 'night';

  switch (pty) {
    case '1': return 'rainy';
    case '2': return 'rainy';
    case '3': return 'snowy';
    case '4': return 'rainy';
  }

  switch (sky) {
    case '1': return 'sunny';
    case '3': return 'cloudy';
    case '4': return 'cloudy';
  }

  return 'sunny';
}
