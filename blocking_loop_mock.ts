import { BlockingLoop, Style } from "./blocking_loop";

export class BlockingLoopMock extends BlockingLoop {
  public constructor(style: Style) {
    super(undefined, style);
  }

  public start(): this {
    return this;
  }
  public stop(): this {
    return this;
  }
  public async execute(): Promise<void> {
    await this.action();
  }
}
