
import argparse
import os
from typing import Dict, List

import requests
from git import Repo




def __get_required(key: str) -> str:
    value = os.environ.get(key, None)
    if not value:
        raise ValueError(f"Required input '{key}' was not provided")

class Config:
    def __init__(
        self,
        target_branch: str,
        token: str,
        base_branch: str,
        repository: str,
        label: str,
        committer_name: str
    ):
        self.target_branch = target_branch
        self.token = token
        self.base_branch = base_branch
        self.repository = repository
        self.label = label
        self.committer_name = committer_name


    @staticmethod
    def load():
        token = __get_required("INPUT_TOKEN")
        current_repo = __get_required("GITHUB_REPOSITORY")
        repository = os.environ.get("INPUT_REPOSITORY", current_repo)
        base_branch = __get_required("INPUT_BASE_BRANCH")
        target_branch = __get_required("INPUT_TARGET_BRANCH")
        label = __get_required("INPUT_LABEL")
        committer_name = os.environ.get("INPUT_COMMITTER_NAME", "PR Merger")

        assert base_branch is not target_branch
      
        return Config(
            token=token,
            target_branch=target_branch,
            base_branch=base_branch,
            repository=repository,
            label=label,
            committer_name=committer_name,
        )


class Pull:
    def __init__(
        self,
        number: int,
        title: str,
        ref: str,
        labels: List[str],
        should_merge: bool
    ):
        self.number = number
        self.title = title
        self.ref = ref
        self.labels = labels
        self.should_merge = should_merge

    @staticmethod
    def from_json(json: Dict, config: Config):
        number = json["number"]
        title = json["title"]
        ref = json["head"]["ref"]
        labels = [l["name"] for l in json["labels"]]

        should_merge = config.label in labels

        return Pull(number, title, ref, labels, should_merge)

    def __repr__(self):
        return f"Pull #{self.number} '{self.title}' from branch '{self.ref}' with labels: {self.labels}"


def get_from_github(url, config: Config):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {config.token}"
    }

    # print(f"Making GitHub API request to '{url}'")
    result = requests.get(url, headers=headers)

    if result.status_code != 200:
        print("GitHub API Request failed.")
        print(result.json())
        exit(1)

    return result.json()


def fetch_pulls(config: Config):
    print("Fetching list of approved pull requests")

    url = f"https://api.github.com/repos/{config.repository}/pulls?direction=asc"
    result = get_from_github(url, config)

    pulls = [Pull.from_json(x, config) for x in result]

    pulls = [x for x in pulls if x.should_merge]

    print(pulls)

    return pulls


def merge_pulls(config: Config, pulls: List[Pull]):
    repo = Repo(".")
    assert not repo.bare

    if config.target_branch in repo.references:
        repo.git.branch(config.target_branch, D=True)

    repo.git.checkout(config.base_branch)
    repo.git.branch(config.target_branch)
    repo.git.checkout(config.target_branch)

    assert repo.active_branch.name == config.target_branch, f"Expected branch '{config.target_branch}', was '{repo.active_branch}'"

    branches = tuple([f"origin/{x.ref}" for x in pulls])
    repo.git.merge(branches, squash=True)

    branch_title_list = "\n".join([f"#{x.number} {x.title}" for x in pulls])
    repo.git.commit(m=f"Merge {len(branches)} approved pull requests to UAT \n\n{branch_title_list}")
    
    repo.git.branch(set_upstream_to=f"origin/{config.target_branch}")
    repo.git.push(force=True)


def main():
    config = Config.load()
    pulls = fetch_pulls(config)

    if pulls:
        merge_pulls(config, pulls)


if __name__ == "__main__":
    main()
