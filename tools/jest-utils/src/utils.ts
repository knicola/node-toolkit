export async function flushPromises (): Promise<any> {
    return await new Promise(jest.requireActual('timers').setImmediate)
}

export async function advanceTimers (ms: number, times: number = 1): Promise<any> {
    await flushPromises()
    const timesArr = Array.from({ length: times })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of timesArr) {
        jest.advanceTimersByTime(ms)
        await flushPromises()
    }
}
