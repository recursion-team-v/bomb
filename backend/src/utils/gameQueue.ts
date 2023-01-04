export default class GameQueue<T> {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private queue: T[] = [];

  read(): T | undefined {
    return this.queue[0];
  }

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
