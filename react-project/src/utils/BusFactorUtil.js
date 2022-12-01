export function calculateBusFactor(data) {
    let result = busFactorForFolder(data)

    if (data.children) {
        let children = []
        data.children.forEach(child => {
            children.push(calculateBusFactor(child))
        })
        result.children = children
    }

    return result
}


function getMajorFileData(folderData) {
    let stack = [folderData];
    let result = [];
    while (stack.length > 0) {
        let file = stack.pop();
        if (file.children && file.children.length > 0) {
            stack.push(...file.children)
            continue
        }
        let fileMajorUsers = [];
        if (file.users) {
            file.users.forEach(user => {
                if (isMajor(user.authorship, user.normalizedAuthorship)) {
                // if (isMajor(user.authorship)) {
                    fileMajorUsers.push(user.email)
                }
            })
        }

        result.push(fileMajorUsers)
    }
    return result
}

function busFactorForFolder(folderData) {
    var majorFileData = getMajorFileData(folderData)
    let developers = sortContributors(majorFileData)
    var orphanFiles = countOrphan(majorFileData)
    let filesCount = majorFileData.length
    var busFactor = 0
    developers.forEach(mainAuthor => {
        if (filesCount >= 2 * orphanFiles) busFactor++

        orphanFiles = 0
        // Each time we delete 1 main author from major contributors and count files without authors
        majorFileData = majorFileData.map(it => {
            it.filter(item => item !== mainAuthor);
            let dataWithoutCurrentAuthor = it.filter(item => item !== mainAuthor);
            if (dataWithoutCurrentAuthor.length === 0) orphanFiles++;
            return dataWithoutCurrentAuthor;
        }
        )
    })
    return sliceNoChildren(folderData, busFactor)
}

function sortContributors(majorFileData) {
    let counter = new Map();
    majorFileData.forEach(fileContributors => {
        fileContributors.forEach(user => {
            let value = counter.get(user)
            if (value) {
                counter.set(user, value + 1)
            } else {
                counter.set(user, 1)
            }
        })
    })

    counter[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
    }
    let developers = []
    for (let [key, value] of counter) {
        developers.push(key);
    }
    return developers
}

function countOrphan(majorFileData) {
    var result = 0
    for (const [key, value] of Object.entries(majorFileData)) {
        if (value.length === 0) result++;
    }
    return result
}

const authorshipThresholdNew = 0.001
const normalizedAuthorshipThreshold = 0.75

function isMajor(authorship, normalizedAuthorship) {
// function isMajor(authorship) {
    return (authorship >= authorshipThresholdNew) && (normalizedAuthorship > normalizedAuthorshipThreshold);
}

function sliceNoChildren(data, newBusFactor) {
    let result = {};
    for (let i in data) {
        if (i === "children") continue
        if (i === "busFactorStatus") {
            let bfs = data[i]
            let value = bfs.busFactor
            if (value) {
                result[i] = {
                    "busFactor": newBusFactor
                }
                continue
            }
        }
        result[i] = data[i];
    }
    return result

}