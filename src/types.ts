export class Repository {
  owner: string
  name: string

  constructor(owner: string, name: string) {
    this.owner = owner
    this.name = name
  }
}

export class Config {
  token: string
  baseBranch: string
  targetBranch: string
  label: string
  committer: string
  workingDir: string
  push: boolean
  repository: Repository

  constructor(
    token: string,
    baseBranch: string,
    targetBranch: string,
    label: string,
    committer: string,
    workingDir: string,
    push: boolean,
    repository: Repository,
  ) {
    this.token = token
    this.baseBranch = baseBranch
    this.targetBranch = targetBranch
    this.label = label
    this.committer = committer
    this.workingDir = workingDir
    this.push = push
    this.repository = repository
  }
}

export interface Reference {
  ref: string
}

export interface Pull {
  number: number
  labels: Array<{ name: string }>
  title: string
  head: Reference
}
