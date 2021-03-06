import axios from "redaxios"
import { saveAs } from 'file-saver';

const actions = {}
const BASE_URL = import.meta.env.VITE_SERVER


//  CONTRACTS

actions.addContract = async (data) => {
  let url = BASE_URL + `/contract`

  let contract = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error adding contract to DB")
      return false
    } else {
      console.log("axios response", res.data)
      return res.data.newDoc
    }
  })
  return contract
}


actions.getContracts = async (data) => {
  let url = BASE_URL + `/allContracts?accountId=${data.accountId}`

  // let contracts = await fetch(url).then(async (res) => {
  //   let data = await res.json()
  //   console.log('data: ', data)
  //   if (data.error) {
  //     console.log("error retrieving contracts ")
  //     return false
  //   } else {
  //     console.log("axios response", res.data)
  //     return data.contracts
  //   }
  // })

  let contracts = await axios.get(url).then(res => {
    if (res.data.error) {
      console.log("error retrieving contracts ")
      return false
    } else {
      console.log("axios response", res.data)
      return res.data.contracts
    }
  })
  return contracts
}

actions.removeContract = async (data) => {
  let url = BASE_URL + `/contract?contractId=${data.contractId}&accountId=${data.accountId}`

  let contract = await axios.delete(url).then(res => {
    if (res.data.error) {
      console.log("error removing contract ")
      return false
    } else {
      console.log("axios response", res.data)
      return res.data
    }
  })
  return contract
}



//  FILE MANAGER

actions.createProjectDirectory = async (data) => {

  let url = BASE_URL + `/createProjectDirectory`

  let projectCreated = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error deleting new file ")
      return false
    } else {
      console.log("axios response", res.data)
      return res.data.projectCreated
    }
  })
  return projectCreated
}


actions.deleteProjectDirectory = async (data) => {
  let url = BASE_URL + `/deleteProjectDirectory`

  let fileTree = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error deleting new file ")
      return false
    } else {
      console.log("axios response", res.data)
      return true
    }

  })
  return fileTree
}


actions.getFileTree = async (data) => {
  let url = BASE_URL + `/getFileTree`
  let fileTree = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error getting file tree")
      return []
    } else {
      console.log("axios response", res.data)
      return res.data.fileTree
    }

  })
  return fileTree
}

actions.createFile = async (data) => {
  let url = BASE_URL + `/createFile`

  let fileTree = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error creating new file ")
      return res.data
    } else {
      console.log("axios response", res.data)
      return res.data.fileTree
    }

  })
  return fileTree
}


actions.renameFile = async (data) => {
  let url = BASE_URL + `/renameFile`

  let fileTree = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error renaming file")
      return res.data
    } else {
      console.log("axios response", res.data)
      return res.data.fileTree
    }

  })
  return fileTree
}



actions.deleteFile = async (data) => {
  let url = BASE_URL + `/deleteFile`

  let fileTree = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error deleting new file ")
      return res.data
    } else {
      console.log("axios response", res.data)
      return res.data.fileTree
    }

  })
  return fileTree
}


actions.downloadProject = async (contract) => {
  try {
    let url = BASE_URL + `/downloadProject?contractId=${contract.id}&owner=${contract.owner}&type=${contract.type}`
    await saveAs(url, "project.zip")
    return true
  } catch (error) {
    console.log("error: ", error)
    return false
  }
}


actions.getText = async (data) => {
  let url = BASE_URL + `/getText`

  let text = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error getting file text")
      return undefined
    } else {
      console.log("file text", res.data.text.length)
      return res.data.text
    }

  })
  return text
}

actions.saveText = async (data) => {
  let url = BASE_URL + `/saveText`

  let status = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error saving file text")
      return undefined
    } else {
      console.log("saved file text", res.data)
      return res.data.status
    }

  })
  return status
}

actions.backupProjects = async (accountId) => {
  try {
    let url = BASE_URL + `/backupProjects?accountId=${accountId}`
    await axios
      .get(url, { responseType: 'blob' })
      .then(response => {
        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');

        fileLink.href = fileURL;
        fileLink.setAttribute('download', 'backup.zip');
        document.body.appendChild(fileLink);

        fileLink.click();
      })

    return true
  } catch (error) {
    console.log("error: ", error)
    return false
  }
}

actions.restoreProjects = async (backupFile, accountId) => {
  try {
    let url = BASE_URL + `/restoreBackup`
    var formData = new FormData();
    formData.append("backup", backupFile)
    formData.append("accountId", accountId)


    // let status = fetch(url, {
    //   method: 'post',
    //   body: formData,
    // }).then(async (res) => {
    //   let data = await res.json()
    //   console.log(data)
    //   return res.data.success
    // })

    let status = await axios.post(url, formData).then(res => {
      console.log(res.data)
      return res.data.success
    })

    return status
  } catch (error) {
    console.log("error: ", error)
    return false
  }
}


// GET COMPILED CONTRACT
actions.getContract = async (contract) => {
  let url = BASE_URL + `/getContract?contractId=${contract.id}&owner=${contract.owner}`
  let fileTree = await axios.get(url, { responseType: 'blob' }).then(async (res) => {
    if (res.data.error) {
      console.log("error getting file tree")

      return undefined
    } else {
      console.log("axios res ", res.data)
      let blob = res.data
      var aBuffer = await blob.arrayBuffer();
      var contract = Buffer(aBuffer, "binary")

      console.log('contract', contract)
      return contract
    }

  }).catch(error => {
    console.log('axios error', error)
  })
  return fileTree
}

// GET VIEW AND CHANGE METHODS
actions.getManifest = async (data) => {
  let url = BASE_URL + `/getManifest`

  let manifest = await axios.post(url, { data: data }).then(res => {
    if (res.data.error) {
      console.log("error retrieving manifest ")
      return undefined
    } else {
      // console.log("retrieved manifest", res.data)
      return res.data.manifest
    }

  })
  return manifest
}


export default actions

