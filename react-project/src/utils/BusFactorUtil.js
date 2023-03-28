/** @format */

export function calculateBusFactor(data) {
  let result = busFactorForFolder(data);

  if (data.children) {
    let children = [];
    data.children.forEach((child) => {
      const node = busFactorForFolder(child);
      node.children = child.children
      children.push(node);
    });
    result.children = children;
  }

  return result;
}

// return true if all is fine
function checkStatus(node) {
  const status = node.busFactorStatus
  return !(status.ignored || status.old);
}

function getMajorFileData(node) {
  let stack = [node];
  let result = [];
  while (stack.length > 0) {
    let file = stack.pop();

    if (file.children && file.children.length > 0) {
      stack.push(...file.children);
      continue;
    }

    if (!checkStatus(file)) continue

    let fileMajorUsers = [];
    if (file.users) {
      file.users.forEach((user) => {
        if (isMajor(user.authorship, user.normalizedAuthorship)) {
          fileMajorUsers.push(user.email);
        }
      });
    }

    // if (fileMajorUsers.length !== 0 ){
      result.push({
        path: file.path,
        fileMajorUsers: fileMajorUsers
      });
    // }
  }
  compareMajor(node, result)
  return result;
}

function compareMajor(node, major) {
  const nodeMajor = node.busFactorStatus.majorFiles
  if (nodeMajor === undefined) return
  const fileNames = Object.keys(nodeMajor)
  const resultsFiles = major.map(it => it.path)
  let extra = 0
  let missing = 0

  resultsFiles.forEach((v) => {
    if (!fileNames.includes(v)) {
      console.log(`Got extra file ${v}`)
      extra++
    }
  })

  fileNames.forEach((v) => {
    if (!resultsFiles.includes(v)) {
      console.log(`Missing ${v}`)
      missing++
    }
  })

  if (extra !== 0 || missing !== 0 ){
    console.log(`Extra ${extra}; Missing: ${missing}`)
  }
}

function compareDevelopers(node, developers) {
  const a1 = JSON.stringify(developers)
  const a2 = JSON.stringify(node.busFactorStatus.developersSorted)
  if (a1 !== a2) {
    console.log(`!${node.name}! Devs js : ${a1} != ${a2} : kt`)
  }
}

function compareSteps(node, steps) {
  const nodeSteps = node.busFactorStatus.steps
  if (nodeSteps === undefined) return
  console.log(`Comparing steps: size node: ${nodeSteps.length} : ${steps.length}`)
  steps.forEach((v, i) => {
    const step = nodeSteps[i]
    if (i !== 0) {
      // console.log(`step: ${v}`)
      // if (step.mainAuthor !== v.mainAuthor || step.orphanFiles !== v.orphanFiles) {
      if (step.busFactor !== v.busFactor || step.orphanFiles !== v.orphanFiles) {
        console.log(`file ${node.path} , step: ${i}, `)
        console.log(step)
        console.log(v)
        console.log("----")
      }
    } else {
      // console.log(`0: ${step.orphanFiles} ${step.mainAuthor} ?? ${v.orphanFiles} ${v.mainAuthor}`)
    }
  })
}


function countOrphanAndRemove(majorFileData, mainAuthor) {
  let newMajorFileData = []
  let orphanFiles = 0
  majorFileData.forEach((it) => {
    let dataWithoutCurrentAuthor = it.fileMajorUsers.filter((item) => item !== mainAuthor);
    if (dataWithoutCurrentAuthor.length === 0) orphanFiles++;
    const obj = {
      ...it,
      fileMajorUsers: dataWithoutCurrentAuthor
    };
    newMajorFileData.push(obj)
  })
  return [orphanFiles, newMajorFileData]
}


function busFactorForFolder(folderData) {
  console.log(folderData.path)
  let majorFileData = getMajorFileData(folderData);
  // console.log("---")
  // console.log(majorFileData)
  const developers = sortContributors(majorFileData, folderData);
  let orphanFiles = countOrphan(majorFileData);
  const filesCount = majorFileData.length;
  let busFactor = 0;
  // console.log(`${folderData.name} Files count ${filesCount}`)
  let steps = [{
    orphanFiles: orphanFiles,
    filesCount: filesCount
  }];

  // compareDevelopers(folderData, developers)

  for (let mainAuthor of developers) {
    if (filesCount >= 2 * orphanFiles) {
      busFactor++
    } else {
      // break
    }

    orphanFiles = 0;
    // Each time we delete 1 main author from major contributors and count files without authors
    const authorRemovedFrom = [];
    // majorFileData = majorFileData.map((it) => {
    //   if (it.fileMajorUsers.includes(mainAuthor)) authorRemovedFrom.push(it.path)
    //   let dataWithoutCurrentAuthor = it.fileMajorUsers.filter((item) => item !== mainAuthor);
    //   if (dataWithoutCurrentAuthor.length === 0) orphanFiles++;
    //   return {
    //     ...it,
    //     fileMajorUsers: dataWithoutCurrentAuthor
    //   };
    // });
    [orphanFiles, majorFileData] = countOrphanAndRemove(majorFileData, mainAuthor)

    steps.push({
      mainAuthor: mainAuthor,
      orphanFiles: orphanFiles,
      filesCount: filesCount,
      busFactor: busFactor,
      authorRemovedFrom: authorRemovedFrom
    })
  }

  // console.log(steps)
  compareSteps(folderData, steps)
  compareBF(folderData, busFactor)
  return sliceNoChildren(folderData, busFactor);
}

function compareBF(node, busFactor) {
  const bf = node.busFactorStatus.busFactorInit
  if (bf === undefined) return
  if (bf !== busFactor) {
    console.log(`Bf not equal init: ${bf} != ${busFactor} : ${node.path}`)
  }
}

function sortContributors(majorFileData, node) {
  let counter = new Map();
  majorFileData.forEach((it) => {
    const fileContributors = it.fileMajorUsers
    fileContributors.forEach((user) => {
      let value = counter.get(user);
      if (value) {
        counter.set(user, value + 1);
      } else {
        counter.set(user, 1);
      }
    });
  });

  counter[Symbol.iterator] = function* () {
    yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
  };
  let developers = [];
  for (let [key, value] of counter) {
    developers.push(key);
  }


  // TODO: replace with developers
  const devs = node.busFactorStatus.developersSorted
  // if (devs !== developers) console.log(`${devs} != ${developers}`)

  if (devs === undefined) {
    return []
  } else {
    if (devs.length !== developers.length) console.log(`Different size of devs`)

    return devs
  }
  // return devs;
}

function countOrphan(majorFileData) {
  let result = 0;
  majorFileData.forEach((it) => {
    if (it.fileMajorUsers.length === 0) result++
  })
  return result;
}

const authorshipThresholdNew = 0.001;
const normalizedAuthorshipThreshold = 0.75;

function isMajor(authorship, normalizedAuthorship) {
  return (
    authorship >= authorshipThresholdNew &&
    normalizedAuthorship > normalizedAuthorshipThreshold
  );
}

function sliceNoChildren(data, newBusFactor) {
  let result = {};
  for (let i in data) {
    if (i === "children") continue;
    if (i === "busFactorStatus") {
      let bfs = data[i];
      let value = bfs.busFactor;
      if (value) {
        result[i] = {
          busFactor: newBusFactor,
        };
        continue;
      }
    }
    result[i] = data[i];
  }
  return result;
}
