import * as core from "@actions/core"

export function assert(check: boolean, failureMessage: string) {
  if (!check) {
    console.error(failureMessage)
    core.setFailed(failureMessage)
    // @ts-ignore
    process.exit(1)
  }
}
