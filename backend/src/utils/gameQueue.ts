export default class GameQueue<T> {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private queue: T[] = [];

  enqueue(item: T) {
    this.queue.push(item);
  }

  dequeue(): T | undefined {
    return this.queue.shift();
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
