const fs = require('fs');
const fse = require('fs-extra')
const archiver = require('archiver');
const fileSystemExplorer = require('file-system-explorer');
const fsExplorer = new fileSystemExplorer.FileSystemExplorer();


let createProjectDirectory = (projectPath, templatePath) => {
    try {
        let createdDirectory = fs.mkdirSync(projectPath, { recursive: true })
        console.log(createdDirectory)
        let copiedFolder = copyFolder(templatePath, projectPath)
        if (copiedFolder) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log('error creating path', error)
        return false
    }

}


let deleteProjectDirectory = (projectPath) => {
    try {
        fs.rmdirSync(projectPath, { recursive: true });
        console.log(`${projectPath} is deleted!`);
        return true
    } catch (err) {
        console.error(`Error while deleting ${projectPath}.`, err);
        return false
    }

}


let copyFolder = (templatePath, destination) => {
    try {
        let copiedFolder = fse.copySync(templatePath, destination)
        console.log('copy success!', copiedFolder)
        return true
    } catch (err) {
        console.error(err)
        return false
    }
}


// createProjectDirectory(path)


// let path = "/home/csfm1993/Documents/projects/near/guide/rust-counter/Smart Contract"
// getFileStructure(path)
let getFileTree = (path) => {
    const myPathTree = fsExplorer.createFileSystemTree(path);
    // console.log(myPathTree)
    // console.log(JSON.stringify(myPathTree, null, 2))
    return myPathTree

}


let createFile = async (path, filename) => {
    let filePath = path + filename
    fs.appendFile(filePath, '', function (err) {
        if (err) {
            console.log('failed to create file')
            return false
        } else {
            console.log('file created');
            return true
        }
    });
}


let renameFile = async (oldFilePath, newFilePath, cb) => {

    fs.rename(oldFilePath, newFilePath, function (err) {
        if (err) {
            console.log('ERROR: ' + err)
            cb(false)
        } else {
            cb(true)
        }
    });
}

let deleteFile = async (path) => {
    try {
        fs.unlinkSync(path)
        return true
        //file removed
    } catch (err) {
        console.log(err)
        return false

    }
}


let downloadProject = async (folderPath, filePath) => {

    const output = await fs.createWriteStream(filePath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    return new Promise(async (resolve, reject) => {
        archive
            .directory(folderPath, false)
            .on('error', (err) => {
                console.log('err: ', err)
                reject(err)
            })
            .pipe(output)
            ;

        output.on('close', () => resolve(true));
        await archive.finalize();
    });


}


let downloadProjectAssembly = async (folderPath, filePath) => {

    const output = await fs.createWriteStream(filePath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    return new Promise(async (resolve, reject) => {
        archive.glob('**', { ignore: "node_modules/**", cwd: folderPath })
            .on('error', (err) => {
                console.log('err: ', err)
                reject(err)
            })
            .pipe(output)
            ;

        output.on('close', () => resolve(true));
        await archive.finalize();
    });


}
// let path = "/home/csfm1993/Documents/projects/near/guide/users/csfm1993.testnet/3e4aa991-76cc-4165-9683-70b518906797"
// let filePath = "/home/csfm1993/Documents/projects/near/guide/users/csfm1993.testnet/project.zip"
// downloadProjectAssembly(path, filePath)



let getText = (path) => {
    try {
        let text = fs.readFileSync(path, 'utf8');
        // console.log(text.toString());
        return text
    } catch (e) {
        console.log('Error:', e.stack);
        return undefined
    }
}

let saveText = async (path, content) => {
    try {
        console.log("path: \n", path, "\n", content)
        fs.writeFileSync(path, content, { encoding: 'utf8', flag: 'w' })
        return true
    } catch (error) {
        console.log("error: ", error)
        return false
    }

}


let getCompiledContract = (path) => {
    try {
        let contract = fs.readFileSync(path)
        console.log('contract', contract)
        // let contractStr = contract.toString('base64')
        // console.log('contract str',contractStr)

        return contract
    } catch (error) {
        console.error(error)
        return undefined
    }


}

let getManifest = (path) => {
    try {
        let rawData = fs.readFileSync(path)
        let manifest = JSON.parse(rawData);
        console.log('manifest', manifest)
        return manifest

    } catch (error) {
        console.error(error)
        return undefined
    }


}

// let path = "/home/csfm1993/Documents/projects/near/guide/users/csfm1993.testnet/3e4aa991-76cc-4165-9683-70b518906797/NearPGManifest.json"
// getManifest(path)


// addUser()

module.exports = {
    saveText, getFileTree, getCompiledContract, createFile,
    deleteFile, renameFile, downloadProject, downloadProjectAssembly, getText,
    createProjectDirectory, deleteProjectDirectory, copyFolder,getManifest
}

