import { useCounterStore } from './useCounterStore';
import { act } from 'react-test-renderer';

describe('useCounterStore', () => {
  beforeEach(() => {
    act(() => {
      useCounterStore.getState().reset();
    });
  });

  it('should initialize with 0', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('should increment the count', () => {
    act(() => {
      useCounterStore.getState().increment();
    });
    expect(useCounterStore.getState().count).toBe(1);
  });

  it('should decrement the count', () => {
    act(() => {
      useCounterStore.getState().decrement();
    });
    expect(useCounterStore.getState().count).toBe(-1);
  });

  it('should reset the count', () => {
    act(() => {
      useCounterStore.getState().increment();
      useCounterStore.getState().reset();
    });
    expect(useCounterStore.getState().count).toBe(0);
  });
});
