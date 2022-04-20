const cors = require("cors")
var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require("socket.io")(server,
    {
        cors: {
            origin: "http://localhost:3001",
            methods: ["GET", "POST"]
        }
    });

let fileManager = require('./fileManager')
let shellHelper = require('./shellHelper')
const path = __dirname + '/dist/';
let basePath = __dirname + "/NearPG/Users/"


app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static('uploads'))
app.use(express.static(path));


io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('compile', (msg) => {
        console.log('message: ' + msg);
        let command
        let contract = msg.contract
        let path = basePath + contract.owner + "/" + contract.id + "/"
        if (contract.type === "Rust") {
            let targetPath = basePath + contract.owner + "/target"
            console.log(targetPath)
            command = `cargo build --target wasm32-unknown-unknown --release --target-dir ${targetPath}`
        } else {
            command = "npm run build"
        }


        let data = {
            contract: contract,
            command: command,
            path: path,
            method: "compile"
        }
        console.log('message: ' + msg);

        shellHelper.runShell(data, io)

    });

    socket.on('test', (msg) => {
        let command 
        let contract = msg.contract
        let path = basePath + contract.owner + "/" + contract.id + "/"
        if (contract.type === "Rust") {
            let targetPath = basePath + contract.owner + "/target"
            command = `cargo test --target-dir ${targetPath}`
        } else {
            command = "npm run test --no-color"
        }
        let data = {
            contract: contract,
            command: command,
            path: path,
            method: "test"
        }
        console.log("run tests: ",data)
        console.log('message: ' + msg);

        shellHelper.runShell(data, io)

    });
});

app.get('/', (req, res) => {
    res.send('Successful response.');
});




// FILE MANAGER

app.post('/createProjectDirectory', async (req, res) => {
    try {
        let data = req.body.data
        console.log('req data: ', data)
        let projectPath = basePath + data.contract.owner + "/" + data.contract.id
        let templatePath = data.contract.type === "Rust" ? `${__dirname}/NearPG/Templates/Rust/` : `${__dirname}/NearPG/Templates/AssemblyScript/`


        let createdProjectDirectory = await fileManager.createProjectDirectory(projectPath, templatePath)
        if (createdProjectDirectory) {
            let response = { projectCreated: true, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        let response = { error: true }
        res.send(response);
    }
})


app.post('/deleteProjectDirectory', async (req, res) => {
    try {
        let data = req.body.data
        console.log('req data: ', data)

        let path = basePath + data.contract.owner + "/" + data.contract.id


        let deletedFile = await fileManager.deleteProjectDirectory(path)
        if (deletedFile) {
            let response = { deletedFile: true, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        let response = { error: true }
        res.send(response);
    }
})



app.post('/getFileTree', async (req, res) => {
    try {
        let data = req.body.data
        console.log('req data: ', data)

        let path = basePath + data.contract.owner + "/" + data.contract.id + "/"
        let fileTree = fileManager.getFileTree(path)
        let response = { fileTree: fileTree, error: false }
        res.send(response);
    } catch (error) {
        let response = { error: true }
        res.send(response);
    }
})


app.post('/createFile', async (req, res) => {
    try {
        let data = req.body.data
        console.log('data: ', data)

        let path = basePath + data.contract.owner + "/" + data.contract.id + "/"

        let filePath = ""
        if (data.path === "") {
            filePath = path
        } else {
            filePath = data.path + "/"
        }
        console.log('filePath: ', filePath)
        let createdFile = fileManager.createFile(filePath, data.filename)
        if (createdFile) {
            let fileTree = fileManager.getFileTree(path)
            let response = { fileTree: fileTree, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        let response = { error: true }
        res.send(response);
    }
})


app.post('/deleteFile', async (req, res) => {
    try {
        let data = req.body.data
        console.log('req data: ', data)

        let filePath = req.body.data.path
        let path = basePath + data.contract.owner + "/" + data.contract.id + "/"


        let deletedFile = await fileManager.deleteFile(filePath)
        if (deletedFile) {
            let fileTree = fileManager.getFileTree(path)
            let response = { fileTree: fileTree, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        let response = { error: true }
        res.send(response);
    }
})


app.post('/renameFile', async (req, res) => {
    try {
        let data = req.body.data
        console.log('req data: ', data)

        let oldFilePath = data.oldFilePath
        let newPath = data.oldFilePath.replace(data.oldFileName, data.newFileName)
        let path = basePath + data.contract.owner + "/" + data.contract.id + "/"


        await fileManager.renameFile(oldFilePath, newPath, function (renamedFile) {
            console.log('renamed file: ', renamedFile)
            if (renamedFile) {
                let fileTree = fileManager.getFileTree(path)
                console.log('filetree', fileTree)
                let response = { fileTree: fileTree, error: false }
                res.send(response);
            } else {
                let response = { error: true }
                res.send(response);
            }
        })

    } catch (error) {
        console.log('error: ', error)
        let response = { error: true }
        res.send(response);
    }
})


app.get('/downloadProject', async (req, res) => {
    try {
        console.log(req.query)
        let contractId = req.query.contractId
        let owner = req.query.owner
        let contractType = req.query.type
        let folderPath = basePath + owner + "/" + contractId + "/"
        let filePath = basePath + owner + "/" + "project.zip"

        let preparedFile = contractType === "Rust" ? await fileManager.downloadProject(folderPath, filePath)
            : await fileManager.downloadProjectAssembly(folderPath, filePath)

        if (preparedFile) {
            res.sendFile(filePath, function (err) {
                if (err) {
                    console.log(err)
                    next(err);
                } else {
                    console.log('Sent:', path);
                }
            });
        } else {
            let response = { error: true }
            res.send(response);
        }
    } catch (error) {
        console.log('error: ', error)
        let response = { error: true }
        res.send(response);
    }
})


app.post('/getText', async (req, res) => {
    try {
        let data = req.body.data
        console.log('req data: ', data)

        let path = data.path

        let text = await fileManager.getText(path)
        if (text !== undefined) {
            let response = { text: text, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        console.log('error: ', error)
        let response = { error: true }
        res.send(response);
    }
})


app.post('/saveText', async (req, res) => {
    try {
        let data = req.body.data
        console.log('saving  text: ', data)

        let path = data.path
        let text = data.text
        let status = await fileManager.saveText(path, text)
        if (status) {
            let response = { status: true, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        console.log('error: ', error)
        let response = { error: true }
        res.send(response);
    }
})

// DEPLOY
app.get('/getContract', async (req, res) => {
    try {
        console.log(req.query)
        let owner = req.query.owner
        let contractId = req.query.contractId
        let path = basePath + owner + "/" + contractId + "/out/contract.wasm"
        let compiledContract = fileManager.getCompiledContract(path)
        if (compiledContract !== undefined) {

            res.sendFile(path, function (err) {
                if (err) {
                    console.log(err)
                    next(err);
                } else {
                    console.log('Sent:', path);
                }
            });

        } else {
            let response = { error: true }
            res.send(response);
        }
    } catch (error) {
        console.log('error: ', error)
        let response = { error: true }
        res.send(response);
    }
})


app.post('/getManifest', async (req, res) => {
    try {
        let data = req.body.data
        let path = basePath + data.contract.owner + "/" + data.contract.id + "/NPGManifest.json"


        let manifest = await fileManager.getManifest(path)
        if (manifest) {
            let response = { manifest: manifest, error: false }
            res.send(response);
        } else {
            let response = { error: true }
            res.send(response);
        }

    } catch (error) {
        console.log('error: ', error)
        let response = { error: true }
        res.send(response);
    }
})


server.listen(3000, () => console.log('Example app is listening on port 3000.'));

