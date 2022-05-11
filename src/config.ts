import * as core from "@actions/core"
import * as github from "@actions/github"
import { assert } from "./assert"
import { Config, Repository } from "./types"

function printVariable(name: string, value: any) {
  console.log(`${name} = ${value}`)
}

function getRequired(key: string): string {
  let value = core.getInput(key)
  assert(!!value, `Required value '${key}' was not provided`)

  printVariable(key, value)
  return value
}

function getOptional(key: string, defaultValue: string) {
  let value = core.getInput(key)
  if (!value) {
    value = defaultValue
  }

  printVariable(key, value)
  return value
}

export const loadConfig = (): Config => {
  const token = getRequired("token")
  const currentRepo = `${github.context.repo.owner}/${github.context.repo.repo}`
  const repository = getOptional("repository", currentRepo)
  const baseBranch = getRequired("base_branch")
  const targetBranch = getRequired("target_branch")
  const label = getRequired("label")
  const committer = getOptional("committer_name", "PR Merger")
  const workingDir = process.env["GITHUB_WORKSPACE"]
  const push = getOptional("push", "false").toLowerCase() === "true"

  printVariable("workingDir", workingDir)

  assert(baseBranch !== targetBranch, "Base branch should not be the same as the target branch")
  assert(workingDir !== undefined, "Unable to detemine working directory for action context")

  let repoParts = repository.split("/")
  if (repoParts.length < 2) {
    throw RangeError(`Unable to determine owner and repo name for repo '${repository}`)
  }
  const repoOwner = repoParts[0]
  const repoName = repoParts[1]

  let config = new Config(
    token,
    baseBranch,
    targetBranch,
    label,
    committer,
    workingDir!,
    push,
    new Repository(repoOwner, repoName),
  )

  return config
}
