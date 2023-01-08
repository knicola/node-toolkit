# @knicola/xfetch

JS implementation of the [XFetch](http://cseweb.ucsd.edu/~avattani/papers/cache_stampede.pdf) probabilistic early expiration algorithm.

## Install

Using npm:
```sh
$ npm install @knicola/xfetch
```

Using yarn:
```sh
$ yarn add @knicola/xfetch
```

## Usage

### xfetch()
Wrap a function with an in-memory cache layer
```ts
import { xfetch } from '@knicola/xfetch'

const fn = async (n1: number, n2: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 3e3))
    return n1 + n2
}

const xfn = xfetch(fn, {
    key: 'cache-key',
    ttl: 30e3,
})

await xfn(1, 1)
```
Use a custom cache adapter
```ts
import { XFetchCacheAdapter } from '@knicola/xfetch'

const adapter: XFetchCacheAdapter = {
    get (key) {
        const { value, delta } = cache.get(key)
        const expiry = cache.ttl(key) + Date.now()
        return { value, delta, expiry }
    },
    set (key, { value, delta, ttl }) {
        cache.set(key, { value, delta }, ttl)
    },
}

const xfn = xfetch(fn, {
    key: 'cache-key',
    ttl: 30e3,
    adapter,
})
```
Use Redis as a cache adapter
```ts
import Redis from 'ioredis'

const redis = new Redis('redis://localhost:6379')

const adapter: XFetchCacheAdapter = {
    async get (key) {
        const res = await redis.multi()
            .hgetall(key)
            .pttl(key)
            .exec()
        const [[,{ value, delta }], [,ttl]] = res as [any, any]
        return { value, delta, expiry: Number(ttl) + Date.now() }
    },
    async set (key, { value, delta, ttl }) {
        await redis
            .multi()
            .hmset(key, { value, delta })
            .pexpire(key, ttl)
            .exec()
    },
}
```
### shouldRecompute()
Determine whether it's time to recompute the cached value
```ts
import { shouldRecompute } from '@knicola/xfetch'

const expiry = Date.now() + 3e3
const delta = 1e3
const beta = 1

shouldRecompute(expiry, delta, beta) //=> boolean
```
### compute()
Compute value and calculate duration of computation
```ts
import { compute } from '@knicola/xfetch'

const [value, delta] = await compute(() => fn())
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
