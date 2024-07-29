export enum Style {
  ANIMATION_FRAME,
  TIMEOUT,
}

export class BlockingLoop {
  public static create(style: Style): BlockingLoop {
    return new BlockingLoop(window, style);
  }

  private schedule: (callback: () => void) => number;
  private cancelSchedule: (id: number) => void;
  private action: () => Promise<void>;
  private intervalMs: number;
  private loopId: number;

  public constructor(
    private window: Window,
    style: Style,
  ) {
    switch (style) {
      case Style.ANIMATION_FRAME:
        this.schedule = (callback) =>
          this.window.requestAnimationFrame(callback);
        this.cancelSchedule = (id) => this.window.cancelAnimationFrame(id);
        break;
      case Style.TIMEOUT:
        this.schedule = (callback) => this.window.setTimeout(callback, 0);
        this.cancelSchedule = (id) => this.window.clearTimeout(id);
        break;
      default:
        throw new Error(`Unknown kind: ${style}.`);
    }
  }

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
    await this.action();
    await new Promise<void>((resolve) =>
      this.window.setTimeout(resolve, this.intervalMs),
    );
    if (currentLoopId !== this.loopId) {
      // Loop id changed. The current loop is cancelled. Don't schedule the next execution.
      return;
    }
    this.loopId = this.schedule(this.run);
  };

  public stop(): this {
    this.cancelSchedule(this.loopId);
    this.loopId = undefined;
    return this;
  }
}
