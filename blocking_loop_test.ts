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
      name: "Start_RunOnce_RuAndStopWhielWaiting_RestartAndStopWhileRunningAction",
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
        assertThat(msCaptured, eq(interval), "waiting time");

        // Execute
        waitingResolveFn();
        await advanceOneFrame();
        actionResolveFn();
        await advanceOneFrame();

        // Verify
        assertThat(loopId, eq(2), "2nd loop");

        // Prepare
        actionResolveFn = undefined;

        // Execute
        loopFn();
        loop.stop();

        // Verify
        assertThat(loopIdCleared, eq(2), "clear 2nd loop");

        // Execute
        waitingResolveFn();
        await advanceOneFrame();

        // Verify
        assertThat(actionResolveFn, eq(undefined), "no more actions");
        assertThat(loopId, eq(2), "still 2nd loop");

        // Prepare
        loop.start();
        loopFn();
        assertThat(loopId, eq(3), "3rd loop");
        waitingResolveFn();
        await advanceOneFrame();

        // Execute
        loop.stop();

        // Verify
        assertThat(loopIdCleared, eq(3), "clear 3rd loop");

        // Execute
        actionResolveFn();
        await advanceOneFrame();

        // Verify
        assertThat(loopId, eq(3), "still 3rd loop");
      },
    },
  ],
});
