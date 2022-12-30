import { JestConfigWithTsJest } from 'ts-jest'
import jestBaseConfig from '@knicola/dev-config/jest/base'

const config: JestConfigWithTsJest = {
    ...jestBaseConfig,
}

export default config
