import { CommandLineParser } from '@rushstack/ts-command-line'
import { ReadmeAction } from './actions/readme'

export class RepoCommandLine extends CommandLineParser {
    public constructor () {
        super({
            toolFilename: 'repo',
            toolDescription: 'Used to execute various operations specific to this repo.',
        })

        this.addAction(new ReadmeAction())
    }

    protected onDefineParameters (): void {
    }

    protected async onExecute (): Promise<void> {
        return await super.onExecute()
    }
}
