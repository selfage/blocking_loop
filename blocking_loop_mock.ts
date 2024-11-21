import { BlockingLoop } from "./blocking_loop";

export class BlockingLoopMock extends BlockingLoop {
  public loopFn: Function;
  public loopIdCounter = 0;
  public loopIdCleared: number;
  public waitingResolveFn: Function;
  public msCaptured: number;

  public constructor() {
    super(
      (callback: Function) => {
        this.loopFn = callback;
        this.loopIdCounter++;
        return this.loopIdCounter;
      },
      (id: number) => {
        this.loopIdCleared = id;
      },
      (callback: Function, ms: number) => {
        this.waitingResolveFn = callback;
        this.msCaptured = ms;
      },
    );
  }

  public async execute(): Promise<void> {
    await this.action();
  }
}
