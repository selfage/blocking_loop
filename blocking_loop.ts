export class BlockingLoop {
  public static createWithAinmationFrame(): BlockingLoop {
    return new BlockingLoop(
      (callback) => requestAnimationFrame(callback),
      (id: number) => cancelAnimationFrame(id),
      (callback, ms) => setTimeout(callback, ms),
    );
  }

  public static createWithTimeout(): BlockingLoop {
    return new BlockingLoop(
      (callback) => setTimeout(callback, 0),
      (id) => clearTimeout(id),
      (callback, ms) => setTimeout(callback, ms),
    );
  }

  protected action: () => Promise<void>;
  private lastActionPromise = Promise.resolve();
  private intervalMs: number;
  private loopId: number | NodeJS.Timeout;

  public constructor(
    private schedule: (callback: () => void) => number | NodeJS.Timeout,
    private cancelSchedule: (id: number | NodeJS.Timeout) => void,
    private wait: (callback: () => void, ms: number) => any,
  ) {}

  public setAction(action: () => Promise<void>): this {
    this.action = action;
    return this;
  }

  public setInterval(intervalMs: number): this {
    this.intervalMs = intervalMs;
    return this;
  }

  public start(): this {
    this.loopId = this.schedule(this.run);
    return this;
  }

  private run = async (): Promise<void> => {
    let currentLoopId = this.loopId;
    this.lastActionPromise = this.action();
    await this.lastActionPromise;
    await new Promise<void>((resolve) => this.wait(resolve, this.intervalMs));
    if (currentLoopId !== this.loopId) {
      // Loop id changed. The current loop is cancelled. Don't schedule the next execution.
      return;
    }
    this.loopId = this.schedule(this.run);
  };

  public async stop(): Promise<void> {
    this.cancelSchedule(this.loopId);
    this.loopId = undefined;
    await this.lastActionPromise;
  }
}
