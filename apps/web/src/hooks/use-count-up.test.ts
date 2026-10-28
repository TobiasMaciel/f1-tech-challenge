import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCountUp } from './use-count-up';

describe('useCountUp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('con movimiento reducido devuelve el valor final de inmediato', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);

    const { result } = renderHook(() => useCountUp(5270.058, 500));

    expect(result.current).toBe(5270.058);
  });

  it('al cambiar el objetivo anima desde el valor anterior y no desde cero', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 500), {
      initialProps: { target: 5000 },
    });
    act(() => vi.advanceTimersByTime(600));
    expect(result.current).toBe(5000);

    rerender({ target: 5010 });
    act(() => vi.advanceTimersByTime(100));

    expect(result.current).toBeGreaterThan(5000);
    expect(result.current).toBeLessThan(5010);
  });
});
