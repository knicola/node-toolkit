# @knicola/minibus

A strongly typed event emitter.

## Install

Using npm:
```sh
$ npm install @knicola/minibus
```

Using yarn:
```sh
$ yarn add @knicola/minibus
```

## Usage

```ts
import { minibus, event } from '@knicola/minibus'

// define event schema
interface IUserCreated {
    name: string
    email: string
}

// register events
const Events = {
    UserCreated: event<IUserCreated>('user:created'),
} as const

// create event bus
const bus = minibus()

// subscribe an event handler
bus.subscribe(Events.UserCreated, (data) => {
    console.log(data)
})

// dispatch a new event
bus.dispatch(Events.UserCreated, {
    name: 'Peter Pan',
    email: 'pete@neverland.com',
})
```
 
## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
