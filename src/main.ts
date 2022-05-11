import { loadConfig } from "./config"
import { mergePulls, prepareBranch, pushBranch } from "./git"
import { fetchPulls } from "./pulls"

async function run(): Promise<void> {
  const config = loadConfig()

  const pulls = await fetchPulls(config.token, config.label, config.repository)
  await prepareBranch(config.workingDir, config.committer, config.targetBranch, config.baseBranch, config.token)
  await mergePulls(pulls, config.workingDir)

  if (config.push) {
    await pushBranch(config.targetBranch, config.token, config.workingDir)
  } else {
    console.log("Skipping push")
  }
}

run()
