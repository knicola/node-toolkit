# @knicola/xbackoff

JS implementation of the [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) algorithm.

## Install

Using npm:
```sh
$ npm install @knicola/xbackoff
```

Using yarn:
```sh
$ yarn add @knicola/xbackoff
```

## Usage

```ts
import { xbackoff, XBackoffOptions } from '@knicola/xbackoff'

// default options
const options: XBackoffOptions = {
    factor: 2,
    minTimeout: 1e3,
    maxTimeout: 60e3,
    randomize: false,
}

const getTimeout = xbackoff(options)

getTimeout(0) // 1000
getTimeout(1) // 2000
getTimeout(2) // 4000
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
