export default class GameQueue {
  private queue: any[] = [];

  enqueue(item: any) {
    this.queue.push(item);
  }

  dequeue(): any | undefined {
    return this.queue.shift();
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
