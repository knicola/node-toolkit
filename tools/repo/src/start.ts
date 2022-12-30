import { RepoCommandLine } from './repo'

const commandLine: RepoCommandLine = new RepoCommandLine()
commandLine.execute().catch(console.error) // should never reject the promise
