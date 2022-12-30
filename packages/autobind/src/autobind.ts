/**
 * Automatically bind all methods of an object to the object itself
 * @param obj The object to bind methods to
 * @example
 * class Foo {
 *   constructor () {
 *     autoBind(this)
 *   }
 * } // class
 */
export function autobind (obj: object): void {
    Object
        .getOwnPropertyNames(obj.constructor.prototype)
        .forEach((propertyName) => {
            const value = obj[propertyName]
            if (propertyName !== 'constructor' && typeof value === 'function') {
                obj[propertyName] = value.bind(obj)
            }
        })
} // autobind()
