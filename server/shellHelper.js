const { spawn } = require("child_process");

let fileManager = require('./fileManager')
let basePath = __dirname + "/NearPG/Users/"


// runShellCommand()

let runShell = (data, io) => {
    let commands = data.command.split(" ")
    let cmd = commands[0]
    let args = commands.filter((item, i) => i !== 0)
    let path = data.path

    console.log('commands', commands,)
    console.log('cmd', cmd, path)
    console.log('args', args)



    const ls = spawn(cmd, args, { cwd: path });

    ls.stdout.on("data", res => {

        if (res !== undefined) {
            console.log('stdout', JSON.stringify(res, null, 2));
            io.emit('log', res.toString())
        } else {
            console.log('error res is undefined');

        }
    });


    ls.stderr.on("data", res => {
        if (res !== undefined) {
            console.log('stderr', JSON.stringify(res, null, 2));
            io.emit('log', res.toString())
        } else {
            console.log('error res is undefined');

        }

    });

    ls.on('error', (error) => {
        if (error !== undefined) {
            console.log('error', JSON.stringify(error, null, 2));

            io.emit('log', error.toString())
        } else {
            console.log('error res is undefined');

        }
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        try {
            if (data.method === "compile" && data.contract.type === "Rust") {
                let binaryPath = basePath + data.contract.owner + "/target/wasm32-unknown-unknown/release/contract.wasm"
                let destination = path + "out/" + "contract.wasm"
                fileManager.copyFolder(binaryPath, destination)
            }
        } catch (error) {
            console.log('failed to copy binary')
        }



        io.emit('log', "Log End ------------------------------------")
        io.emit('logEnd', "Log End")

    });
}

// let command = "npm i dotenv"
// runShell(command)

module.exports = { runShell }