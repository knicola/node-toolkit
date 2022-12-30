# @knicola/autobind

Automatically bind all methods of an object to the object itself.

## Install

Using npm:
```sh
$ npm install @knicola/autobind
```

Using yarn:
```sh
$ yarn add @knicola/autobind
```

## Usage

```ts
import { autobind } from '@knicola/autobind'

// with autobind
class Foo {
    public myname: string = 'foo'
    constructor() {
        autobind(this)
    }
    public say(): void {
        console.log(this.myname)
    }
}
const { say: sayFoo } = new Foo()
sayFoo() //=> "foo"

// without autobind
class Bar {
    public myname: string = 'bar'
    public say(): void {
        console.log(this.myname)
    }
}
const { say: sayBar } = new Bar()
sayBar() //=> [ERR]: this is undefined 
```

## License

This project is open-sourced software licensed under the [MIT license](./LICENSE).
