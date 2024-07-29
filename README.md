# @selfage/loop

## Install

`npm install @selfage/loop`

## Overview

Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig ](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides a util class to start and stop recurring loops, which only starts scheduling the next loop until the provided async function has finished. It makes sure to handle loops cancellation. Simply cancelling timeout or animation frame doesn't work in this case, because the loop function might be in the middle of execution, waiting for the async function.

Note that global `window` object is required. I.e. only run in a browser.

## Usage

```TypeScript
import { BlockingLoop, Style } from "@selfage/blocking_loop";

// Style.TIMEOUT uses setTimeout function to schedule loops.
// Style.ANIMATION_FRAME uses requestAnimationFrame to schedule loops.
let loop = BlockingLoop.create(Style.TIMEOUT)
  .setAction(async () => {
    // your async function
  })
  .setInterval(500);

// The first loop will start immediately.
loop.start();

// The last running loop will still be finished, but it won't schedule a new loop.
loop.stop();

// stop() cannot be waited. So make sure the provided async action function can be run while the other action function is in the middle of execution.
loop.start();
```
