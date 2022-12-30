import { autobind } from '../src'

describe('autobind()', () => {
    it('should bind methods', () => {
        class Test {
            value = 'foo'
            constructor () {
                autobind(this)
            }

            foo (): string {
                return this.value
            }
        }

        const { foo } = new Test()
        expect(foo()).toBe('foo')
    }) // test
    it('should bind getters', () => {
        class Test {
            value = 'foo'
            constructor () {
                autobind(this)
            }

            get foo (): string {
                return this.value
            }
        }

        const { foo } = new Test()
        expect(foo).toBe('foo')
    }) // test
}) // group
