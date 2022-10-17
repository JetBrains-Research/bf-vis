import pkg from 'graceful-fs';
import data from './../vis_data.json' assert {type: "json"};

const {writeFileSync} = pkg;
let dataRootNode =  data;

function populateExtension(node, parentPath) {
    node.path = parentPath === ""? ".": `${parentPath}/${node.name}`;
    consolidateUsers(node)

    if ('children' in node) {
        node.children.forEach( element => {
            const newParentPath = (parentPath === undefined || parentPath.length === 0) ? "." : `${parentPath}/${node.name}`;
            populateExtension(element, newParentPath)
        })
    }

    if (!('children' in node)) {
        node.extension = getExtensionFromPath(node.path);
    }
}


function getExtensionFromPath(path) {
    
    const slashSplit = path.split('/');
    const fileName = slashSplit[slashSplit.length - 1];
    const dotSplit = fileName.split('.');

    if (dotSplit.length > 1){
        return `.${dotSplit[dotSplit.length - 1]}`;
    }
    else {
        return undefined
    }
}


function consolidateUsers(node) {
    if (!(node === undefined)){
        if ("users" in node){
            const usersArr = []
            for (const authorName in node.users){
                usersArr.push({
                    "email": authorName,
                    "contributionScore": node.users[authorName]
                });
            }
            node.usersFormatted = usersArr;
        }
    }
}


populateExtension(dataRootNode, "");
writeFileSync('nikDataWithExtension.json', JSON.stringify(dataRootNode), (error) => {
    if (error) {
        throw error;
    }
});
