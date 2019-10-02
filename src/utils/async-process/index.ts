export const CANCELLED = Symbol("cancelled");

function asyncProcess(generator: Function): [Promise<any>, () => void] {
  let cancelled = false;

  function cancel() {
    cancelled = true;
  }

  const promise = new Promise(async (resolve, reject) => {
    try {
      const iterator = generator();
      let result;

      while (true) {
        const { value, done }: { value: any; done: any } = iterator.next(result);

        result = await value;

        if (cancelled) {
          reject(CANCELLED);
          iterator.throw(CANCELLED);

          return;
        }

        if (done) {
          resolve(value);

          return;
        }
      }
    } catch (e) {
      if (e !== CANCELLED) {
        reject(e);
      }
    }
  });

  return [promise, cancel];
}

export default asyncProcess;
