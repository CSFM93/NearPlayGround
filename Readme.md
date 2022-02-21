## Inspiration
While participating in the Chainlink Fall Hackathon I spent a lot of time using the Remix IDE to write smart contracts, so I decided to build something similar for Near.


## What it does
Near Playground  (NPG) is a developer tool that allows users to write, test, compile, deploy, and call Near smart contracts in the browser. NPG allows users to develop smart contracts in both Rust and AssemblyScript.
NPG also allows the user to export the smart contract project by clicking the download button available in the file explorer.

Live demo URL : http://161.35.237.45:3000

Youtube demo URL : https://www.youtube.com/watch?v=qhUrogx9YuU


## How to Run 

### Using Docker

Pull the image named `csfm1993/npg` and run it in the `port 3000`. At the moment NearPlayground will only run in this `port`.

```bash
docker pull csfm1993/npg
docker run -d -p 3000:3000 csfm1993/npg
```

Open your browser and navigate to http://localhost:3000


### Using Node

Make sure you have Node.js and all Rust dependencies for Near smart contract development before running the following commands. 

Install pm2 ,Clone the repository and navigate to the `client` directory:

```bash
npm i -g pm2
git clone https://github.com/CSFM93/NearPlayGround.git && cd NearPlayGround/client
```

Install the the dependencies for the Vue frontend and then build the application:

```bash
npm install && npm run build
```

Copy the the generated `dist` directory to the `server` directory:

```
cp -r dist ../server
```

Navigate to the `server` directory:

```
cd ../server
```


Install the node modules and start the application (I recommend you to use pm2 to run the app):

```
npm install && pm2 start server.js
```

Open your browser and navigate to http://localhost:3000


### Calling functions after deploying

Near Playground comes with two starter templates for both languages. The Rust starter template is the counter example provided by Near, and the AssemblyScript template which is a CRUD smart contract written by me that allows users to manage a students database.
Inside each project created there is a file named `NPGManifest.json`. This file is where the user needs to declare the functions that his smart contract has in order to be able to call it.
Here is the `NPGManifest.json` file for the AssemblyScript template:

```json
{
    "viewMethods": [
        {
            "name": "getStudents",
            "args": []
        },
        {
            "name": "filterByJSKnowledge",
            "args": [
                {
                    "name": "knowsJavaScript",
                    "type": "boolean",
                    "default": false
                }
            ]
        }
    ],
    "changeMethods": [
        {
            "name": "addStudent",
            "args": [
                {
                    "name": "id",
                    "type": "string",
                    "default": ""
                },
                {
                    "name": "name",
                    "type": "string",
                    "default": ""
                },
                {
                    "name": "age",
                    "type": "int",
                    "default": 0
                },
                {
                    "name": "gpa",
                    "type": "float",
                    "default": 0
                },
                {
                    "name": "knowsJavaScript",
                    "type": "boolean",
                    "default": false
                }
            ]
        },
        {
            "name": "removeStudent",
            "args": [
                {
                    "name": "id",
                    "type": "string",
                    "default": ""
                }
            ]
        }
    ]
}
```

In the file above we declared the functions that the smart contract has, as well as the arguments that each function takes in the `args` field. The allowed arguments types are : `string, boolean, int, and float`.

