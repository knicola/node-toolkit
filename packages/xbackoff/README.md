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

### xbackoff()
Create an xbackoff function
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

getTimeout(0) //=> 1000
getTimeout(1) //=> 2000
getTimeout(2) //=> 4000
```
### compute()
Compute the timeout for the given attempt
```ts
import { compute } from '@knicola/xbackoff'

compute(0, options) //=> 1000
compute(1, options) //=> 2000
compute(2, options) //=> 4000
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
