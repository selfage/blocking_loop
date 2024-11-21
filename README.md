# @selfage/loop

## Install

`npm install @selfage/loop`

## Overview

Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig ](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides a util class to start and stop recurring loops, which only starts scheduling the next loop until the provided async function has finished. It makes sure to handle loops cancellation. Simply cancelling timeout or animation frame doesn't work in this case, because the loop function might be in the middle of execution, waiting for the async function.

## Usage

```TypeScript
import { BlockingLoop } from "@selfage/blocking_loop";

let loop = BlockingLoop.createWithTimeout() // Can be used in either browser or Nodejs environment.
  .setAction(async () => {
    // your async function
  })
  .setInterval(500);
// or BlockingLoop.createWithAinmationFrame()

// The first action will be run after the interval.
loop.start();

// You can wait for the last running loop to be finished, and it won't schedule a new loop.
await loop.stop();
```
