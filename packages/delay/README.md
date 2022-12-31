# @knicola/delay

Delay code execution for a specified amount of milliseconds. This is an [isomorphic](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) variation of `require('timers/promises').setTimeout(1000)`.

## Install

Using npm:
```sh
$ npm install @knicola/delay
```

Using yarn:
```sh
$ yarn add @knicola/delay
```

## Usage

```js
import { delay, AbortError } from '@knicola/delay'

const ac = new AbortController()

// abort after 3 seconds
setTimeout(() => ac.abort(), 3000)

try {
    await delay(10e3, ac.signal)
    // work, work ..
} catch (err) {
    if (err instanceof AbortError) {
        // operation aborted ..
    }
}
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
