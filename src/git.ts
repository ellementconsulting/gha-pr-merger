import * as core from "@actions/core"
import git from "isomorphic-git"
import fs from "fs"
// @ts-ignore
import http from "isomorphic-git/http/node/index.cjs"
import { assert } from "./assert"
import { Pull } from "./types.js"

function onAuth(token: string) {
  return () => ({ username: token })
}

export const prepareBranch = async (
  workingDir: string,
  committer: string,
  targetBranch: string,
  baseBranch: string,
  token: string,
) => {
  await git.setConfig({
    fs,
    dir: workingDir,
    path: "user.name",
    value: committer,
  })

  let branches = await git.listBranches({ fs, dir: workingDir })

  if (targetBranch in branches) {
    git.deleteBranch({ fs, dir: workingDir, ref: targetBranch })
  }

  await git.checkout({ fs, dir: workingDir, ref: baseBranch })
  await git.pull({
    fs,
    http,
    dir: workingDir,
    onAuth: onAuth(token),
    ref: `${baseBranch}`,
  })

  await git.branch({ fs, dir: workingDir, ref: targetBranch })
  await git.checkout({ fs, dir: workingDir, ref: targetBranch })

  let currentBranch = await git.currentBranch({ fs, dir: workingDir })

  assert(currentBranch === targetBranch, `Expected to be on ${targetBranch}, but it appears we are on ${currentBranch}`)
}

export const mergePulls = async (pulls: Pull[], workingDir: string) => {
  if (pulls.length > 0) {
    for (let pull of pulls) {
      await git.merge({
        fs,
        dir: workingDir,
        theirs: `remotes/origin/${pull.head.ref}`,
      })
      console.log(`Merged #${pull.number} ${pull.title}`)
    }
  }
}

export const pushBranch = async (targetBranch: string, token: string, workingDir: string) => {
  console.log(`Pushing to origin/${targetBranch}`)
  let result = await git.push({
    fs,
    http,
    onAuth: onAuth(token),
    dir: workingDir,
    remoteRef: `${targetBranch}`,
    force: true,
  })

  if (!result.ok) {
    core.setFailed(result.error!)
  }
}
