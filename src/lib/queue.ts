import PQueue from "p-queue";

const conversionQueue = new PQueue({
  concurrency: 3,
  timeout: 300000,
  throwOnTimeout: true,
});

export { conversionQueue };

export async function addToQueue<T>(
  task: () => Promise<T>,
  priority?: number
): Promise<T> {
  const result = await conversionQueue.add(task, { priority });
  if (result === undefined) throw new Error("Queue task returned undefined");
  return result as T;
}

export function getQueueStats() {
  return {
    size: conversionQueue.size,
    pending: conversionQueue.pending,
    isPaused: conversionQueue.isPaused,
  };
}
