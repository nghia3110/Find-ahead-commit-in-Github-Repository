import axios from 'axios';

const SOURCE_URL = 'https://github.com/moonlight-stream/moonlight-embedded';
const SOURCE_PATH = SOURCE_URL.slice(19);
//const API_URL = `https://api.github.com/repos/${SOURCE_REPO}`;

const instance = axios.create({
  baseURL: 'https://api.github.com/repos/',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'authorization': "token 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"
  }
});

//<-------------------- Global Variable ----------------------->
const getRootPath = async () => {
  try {
    const response = await instance.get(SOURCE_PATH)
    const data = await response.data;
    if (data.fork) return data.source.full_name;
    else return data.full_name;
  } catch (error) {
    console.error(error);
  }
}

const rootPath = await getRootPath();

async function getListBranch(path) {
  try {
    const response = await instance.get(path + '/branches');

    const data = await response.data;
    return data.map(item => item.name);
  } catch (error) {
    return [];
  }
}

const sourceListBranch = await getListBranch(SOURCE_PATH);

// <---------------------------- Function ----------------------------->

async function getRepoParentName (path) {
  try {
    const response = await instance.get(path);

    const data = await response.data;
    return data.parent.full_name;
  } catch (error) {
    return;
  }
}

async function getRepoFork(path) {
  try {
    const response = await instance.get(path);
    const forks = await response.data;
    return forks;
  } catch (error) {
    console.error(error);
  }
}

async function getAllRepoFork(path) {
  var listForks = [];
  var paths = [path];
  while (paths.length > 0) {
    var i = 1;
    var running = true;
    var cur_path = paths.pop();
    while (running) {
      const forks = await getRepoFork(cur_path + `/forks?per_page=100&page=${i}`);

      if (forks.length == 0) running = false;
      else {
        forks.forEach(async (fork) => {
          listForks.push({
            user: fork.owner.login,
            repos: fork.name,
            path: fork.full_name
          });
          if (fork.forks > 0) {
            paths.push(fork.full_name);
          }
        });
        if (forks.length < 100) running = false;
      }
      i++;
    }
  }
  return listForks;
}

async function getAheadCommitInOneBranch(compare_path, compare_branch, user, repos, branch) {
  var page = 1;
  var listCommits = [];
  while (true) {
    try {
      const response = await instance.get(`${compare_path}/compare/${compare_branch}...${user}:${repos}:${branch}?page=${page}`);

      const data = await response.data;

      if (data.commits.length == 0) {
        break;
      }
      else {
        data.commits.forEach(c => {
          listCommits.push({
            message: c.commit.message,
            url: c.html_url,
            author: {
              name: c.commit.author.name,
              date: c.commit.author.date
            }
          });
        })
        if (data.ahead_by < 250) break;
        page++;
      }
    } catch (error) {
      break;
    }
  }

  return listCommits;
}

async function getAheadCommit(path, user, repos) {
  const parentPath = await getRepoParentName(path);
  var compareBranches = [];
  var compareRepos = '';
  if(parentPath == SOURCE_PATH || parentPath == rootPath){
    compareBranches = sourceListBranch;
    compareRepos = SOURCE_PATH;
  }else{
    compareBranches = await getListBranch(parentPath);
    compareRepos = parentPath;
  }
  
  const branches = await getListBranch(path);
  var listCommits = [];
  if(branches.length == 0) return [];

  for (var branch of branches) {
    if (!compareBranches.includes(branch)) {
      for (var compareBranch of compareBranches) {
        const commits = await getAheadCommitInOneBranch(compareRepos, compareBranch,
          user, repos, branch);
        if (commits.length == 0) break;
        else {
          commits.forEach(commit => listCommits.push(commit));
        }
      }
    }
    else {
      const commits = await getAheadCommitInOneBranch(compareRepos, branch, user, repos, branch);
      if (commits.length == 0) continue;
      commits.forEach(commit => listCommits.push(commit));
    }
  }

  const uniqueListCommits = listCommits.filter((value, index) => {
    const _value = JSON.stringify(value);
    return index === listCommits.findIndex(obj => {
      return JSON.stringify(obj) === _value;
    });
  });

  return uniqueListCommits;
}

async function run() {
  var aheadCommits = [];
  /* const listForks = await getAllRepoFork(rootPath);
  for (var fork of listForks) {
    console.log('fetching: ' + fork.path);
    const list = await getAheadCommit(fork.path, fork.user, fork.repos);
    if(list.length == 0) continue;
    aheadCommits.push({
      repos_name: fork.user + '/' + fork.repos,
      commits: list
    });
  }
  
  aheadCommits.forEach(commit => {
    commit.commits.forEach(c => fs.writeFileSync('src/test.txt', commit.repos_name + ' ' + c.message + ' ' + c.url + '\n'));
  }); */


  const list = await getAheadCommit('4ydx/moonlight-embedded', '4ydx', 'moonlight-embedded');

  console.log(list.length);
  //console.log(listForks); 
}

run();