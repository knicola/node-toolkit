# @knicola/repeat

Repeats the given task for a certain amount of times or forever.
Useful for repetative tasks, such as polling.

## Install

Using npm:
```sh
$ npm install @knicola/repeat
```

Using yarn:
```sh
$ yarn add @knicola/repeat
```

## Usage

```ts
import { repeat, RepeatOptions, RepeatTask } from '@knicola/repeat'

// default options
const options: RepeatOptions = {
    timeout: 3000,
    startOnInit: true,
    runOnStart: true,
    maxRuns: Infinity,
    maxFailures: Infinity,
}

// to be populated by the repeated task
let status: string = 'n/a'

// the task to repeat
const task: RepeatTask = async () => {
    status = await axios.get('https://example.com/api/status')
}

// initialize the repeat operation
const op = repeat(task, options)

// check if task is running
console.log(op.isRunning) //=> true

// cancel the task
op.stop()
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
