// SOURCE: https://github.com/sindresorhus/delay

interface AbortSignal {
  readonly aborted: boolean;
  addEventListener(
    type: 'abort',
    listener: () => void,
    options?: { once?: boolean }
  ): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}

interface Options {
  signal?: AbortSignal;
}

interface ClearablePromise<T> extends Promise<T> {
  clear(): void;
}

interface Delay {
  (milliseconds: number, options?: Options): ClearablePromise<void>;

  <T>(
    milliseconds: number,
    options?: Options & {
      value: T;
    }
  ): ClearablePromise<T>;

  reject?: (
    milliseconds: number,
    options?: Options & {
      value?: unknown;
    }
  ) => ClearablePromise<never>;

  createWithTimers?: (timers: {
    clearTimeout: typeof clearTimeout;
    setTimeout: typeof setTimeout;
  }) => Delay;
}

const createAbortError = () => {
  const error = new Error('Delay aborted');
  error.name = 'AbortError';
  return error;
};

export const createDelay = ({
  clearTimeout: defaultClear,
  setTimeout: set,
  willResolve
}: any) => (ms: number, { value, signal } = {} as any) => {
  if (signal && signal.aborted) {
    return Promise.reject(createAbortError());
  }

  let timeoutId;
  let settle;
  let rejectFn;
  const clear = defaultClear || clearTimeout;

  const signalListener = () => {
    clear(timeoutId);
    rejectFn(createAbortError());
  };

  const cleanup = () => {
    if (signal) {
      signal.removeEventListener('abort', signalListener);
    }
  };

  const delayPromise: any = new Promise((resolve, reject) => {
    settle = () => {
      cleanup();
      if (willResolve) {
        resolve(value);
      } else {
        reject(value);
      }
    };

    rejectFn = reject;
    timeoutId = (set || setTimeout)(settle, ms);
  });

  if (signal) {
    signal.addEventListener('abort', signalListener, { once: true });
  }

  delayPromise.clear = () => {
    clear(timeoutId);
    timeoutId = null;
    settle();
  };

  return delayPromise;
};

export const delay: Delay = createDelay({ willResolve: true });

delay.reject = createDelay({ willResolve: false });
delay.createWithTimers = ({ clearTimeout, setTimeout }) => {
  const innerDelay: Delay = createDelay({
    clearTimeout,
    setTimeout,
    willResolve: true
  });
  innerDelay.reject = createDelay({
    clearTimeout,
    setTimeout,
    willResolve: false
  });
  return innerDelay;
};
