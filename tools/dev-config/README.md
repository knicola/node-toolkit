# @knicola/dev-config

Base configurations for typescript, eslint, typedoc and jest.

## Install
```sh
npm i -D @knicola/dev-config typescript eslint
```

## Setup

.eslintrc.js
```js
require('@knicola/dev-config/eslint/patch')

module.exports = {
    extends: ['./node_modules/@knicola/dev-config/eslint/node'],
    parserOptions: { tsconfigRootDir: __dirname }
}
```

tsconfig.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@knicola/dev-config/tsconfig/node",
  "compilerOptions": {
    "types": [ "node", "jest" ],
  },
  "include": [ "**/*.ts", "**/*.js" ]
}
```

tsconfig.build.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@knicola/dev-config/tsconfig/node",
  "compilerOptions": {
    "removeComments": true,
    "noUnusedLocals": true,
    "outDir": "lib/",
  },
  "include": [ "src/**/*.ts" ]
}
```

jest.config.ts
```ts
import { JestConfigWithTsJest } from 'ts-jest'
import jestBaseConfig from '@knicola/dev-config/jest/base'

const config: JestConfigWithTsJest = {
  ...jestBaseConfig,
  // additional config
}

export default config
```

typedoc.json
```json
{
  "$schema": "https://typedoc.org/schema.json",
  "extends": ["./node_modules/@knicola/dev-config/typedoc/base.json"],
}
```

package.json
```jsonc
{
  // ...
  "scripts": {
    "lint": "eslint src/ --ext .js,.jsx,.ts,.tsx",
    "build": "tsc -p ./tsconfig.build.json",
  }
}
```
