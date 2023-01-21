# @knicola/retry

Retries the given task a certain amount of times or until successful.
Useful for retrying tasks that might fail, such as fetching a resource.

## Install

Using npm:
```sh
$ npm install @knicola/retry
```

Using yarn:
```sh
$ yarn add @knicola/retry
```

## Usage

```ts
import { retry, RetryOptions, RetryTask } from '@knicola/retry'

// default options
const options: RetryOptions = {
    retries: 5,
    factor: 2,
    minTimeout: 1e3,
    maxTimeout: 60e3,
    randomize: true,
}

// the task to retry
const task: RetryTask = async (currentAttempt) => {
    // starting at zero, which is the immediate run
    console.log(`Attempt #${currentAttempt}`)
    await axios.get('https://example.com/api/resource')
}

// retry returns a thenable, which means that if it
// is awaited it will immediately run the task
const res = await retry(task, options)

// otherwise, it will return an instance of `Retry`
// and will wait for `run()` to start the task
const op = retry(task, options)

// start the task
const res = await op.run()
// if the `retries` limit is reached and has yet to
// succeed, it will throw the last known error..

// check if task is running
console.log(op.isRunning) //=> true

// cancel the task- this will cause
// `run()` to throw an AbortError
op.abort()
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
