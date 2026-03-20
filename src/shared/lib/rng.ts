// TODO: [WO-001] 공통 시드 기반 RNG — CLAUDE.md Math.random() 금지 규칙 준수

/**
 * mulberry32 시드 기반 의사 난수 생성기
 *
 * Math.random() 대신 사용 (CLAUDE.md 규칙)
 * 반환: 0~1 사이의 난수를 생성하는 함수
 */
export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
