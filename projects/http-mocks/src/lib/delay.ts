// Copied from https://github.com/sindresorhus/delay

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

export const delay: any = createDelay({ willResolve: true });

delay.reject = createDelay({ willResolve: false });
delay.createWithTimers = ({ clearTimeout, setTimeout }) => {
  const innerDelay: any = createDelay({
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
