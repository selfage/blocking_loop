import { BlockingLoop } from "./blocking_loop";
import { TEST_RUNNER } from "@selfage/puppeteer_test_runner";
import { assertThat, eq } from "@selfage/test_matcher";

async function advanceOneFrame(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

TEST_RUNNER.run({
  name: "BlockingLoopTest",
  cases: [
    {
      name: "AnimationFrame_StartLoop_RunOnce_RunAndStop_FinishedWithNoMoreLoops",
      execute: async () => {
        // Prepare
        let interval = 500;
        let loopFn: Function;
        let loopId = 0;
        let loopIdCleared: number;
        let waitingResolveFn: Function;
        let msCaptured: number;
        let actionResolveFn: Function;
        let loop = new BlockingLoop(
          (callback: Function) => {
            loopFn = callback;
            loopId++;
            return loopId;
          },
          (id: number) => {
            loopIdCleared = id;
          },
          (callback: Function, ms: number) => {
            waitingResolveFn = callback;
            msCaptured = ms;
          },
        )
          .setAction(() => {
            return new Promise<void>((resolve) => (actionResolveFn = resolve));
          })
          .setInterval(interval);

        // Execute
        loop.start();

        // Verify
        assertThat(loopId, eq(1), "1st loop");

        // Execute
        loopFn();

        // Verify
        assertThat(loopId, eq(1), "still 1st loop");

        // Execute
        actionResolveFn();

        // Verify
        await advanceOneFrame();
        assertThat(msCaptured, eq(interval), "waiting time");

        // Execute
        waitingResolveFn();

        // Verify
        await advanceOneFrame();
        assertThat(loopId, eq(2), "2nd loop");

        // Execute
        loopFn();
        loop.stop();

        // Verify
        assertThat(loopIdCleared, eq(2), "clear 2nd loop");
        actionResolveFn();
        await advanceOneFrame();
        // Resolve waiting promise
        waitingResolveFn();
        await advanceOneFrame();
        // 4 is from timeout used for waiting.
        assertThat(loopId, eq(2), "no more timeout");
      },
    },
  ],
});
