function asyncProcess(generator: Function): [Promise<any>, () => void] {
  let cancelled = false;

  function cancel() {
    cancelled = true;
  }

  const promise = new Promise(async (resolve, reject) => {
    try {
      const iterator = generator();

      while (true) {
        const { value, done } = iterator.next();

        await value;

        if (cancelled) {
          const result = "cancelled";
          reject(result);
          iterator.throw(result);

          return;
        }

        if (done) {
          resolve(value);

          return;
        }
      }
    } catch (e) {
      if (e !== "cancelled") {
        throw e;
      }
    }
  });

  return [promise, cancel];
}

export default asyncProcess;
