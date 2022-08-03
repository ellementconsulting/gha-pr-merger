// @ts-ignore
import GitHubApi from "github-api"
import { Pull, Repository } from "./types"

export function shouldMerge(pull: Pull, filterLabel: string): boolean {
  let labels = pull.labels.map(x => x.name)
  return labels.includes(filterLabel)
}

export const fetchPulls = async (token: string, filterLabel: string, repository: Repository): Promise<Pull[]> => {
  console.log("Fetching list of pull requests to merge")

  const gh = new GitHubApi({ token: token })

  // @ts-ignore
  const repo = gh.getRepo(repository.owner, repository.name)
  let pulls = await repo.listPullRequests({
    direction: "asc",
  })

  pulls = pulls.data.filter((pull: Pull) => shouldMerge(pull, filterLabel))

  if (pulls.length > 0) {
    let titles = pulls.map((x: Pull) => x.title)
    console.log(titles)
  } else {
    console.log(
      `No pull requests with label '${filterLabel}' found, nothing to merge. Target branch will be reset to base branch.`,
    )
  }

  return pulls
}
