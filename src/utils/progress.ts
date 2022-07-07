export function progressPromise(
  promises: Array<Promise<any>>,
  tickCallback: (progress: number, length: number) => void
) {
  const length = promises.length;
  let progress = 0;

  function tick(promise: Promise<any>) {
    promise.then(function () {
      progress++;
      tickCallback(progress, length);
    });
    return promise;
  }

  return Promise.all(promises.map(tick));
}
