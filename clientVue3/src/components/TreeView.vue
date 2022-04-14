<template 
>
  <div  class="">
    <q-tree :nodes="items" node-key="name" default-expand-all>
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-icon
            :name="selectIcon(prop.node.extension).icon"
            size="md"
            class="q-mr-sm"
            :color="selectIcon(prop.node.extension).color"
          />
          <div class="text-weight-bold text-gray">{{ prop.node.name }}</div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
import actions from "./actions";
import { useContractStore } from "@/stores/contract";
import { useQuasar } from "quasar";

import {
  mdiLanguageHtml5,
  mdiLanguageTypescript,
  mdiCodeJson,
  mdiLanguageMarkdown,
  mdiImage,
  mdiFile,
  mdiLanguageRust,
  mdiFileExcel,
  mdiLanguageJavascript,
  mdiText,
} from "@quasar/extras/mdi-v6";

import { fasFolder } from "@quasar/extras/fontawesome-v6";

export default {
  name: "TreeView",
  props: ["contract"],
  data: () => ({
    dialog: false,
    protectedFiles: ["lib.rs", "NearPGManifest.json", "cargo.toml"],
    newFileName: "",
    action: "",
    btnCreateFile: false,
    showMenu: false,
    fileMenuItems: ["Rename", "Delete"],
    folderMenuItems: ["New file"],
    x: 0,
    y: 0,
    initiallyOpen: ["src"],
    icons: {
      html: { icon: mdiLanguageHtml5, color: "negative" },
      js: { icon: mdiLanguageJavascript, color: "yellow-8" },
      ts: { icon: mdiLanguageTypescript, color: "blue" },
      json: { icon: mdiCodeJson, color: "positive" },
      md: { icon: mdiLanguageMarkdown, color: "blue" },
      png: { icon: mdiImage, color: "positive" },
      txt: { icon: mdiText, color: "grey" },
      xls: { icon: mdiFileExcel, color: "green" },
      rs: { icon: mdiLanguageRust, color: "deep-orange" },
      file: { icon: mdiFile, color: "grey" },
      folder: { icon: fasFolder, color: "grey" },
    },
    tree: [],
    items: [],
    currentItem: {},
  }),
  setup() {
    const $q = useQuasar();
    let contractStore = useContractStore();
    // console.log('contract store',contractStore.contract)
    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
        contractStore
      },
    };
  },
  created() {
    this.initialize();
    this.emitter.on("refreshView", (data) => {
      this.initialize();
    });
  },
  methods: {
    async initialize() {
      let data = { contract: this.contract };
      console.log("contract", this.contract);
      let res = await actions.getFileTree(data);
      console.log(res);
      this.organizeFileTree(res);
    },
    selectIcon(extension) {
      let icon;
      let color;
      if (extension !== undefined) {
        console.log(extension)
        icon = this.icons[extension.replace(".", "")];
        color = this.icons[extension.replace(".", "")];
        icon = icon === undefined ? this.icons["file"].icon : icon.icon;
        color = color === undefined ? this.icons["file"].color : color.color;
      } else {
        icon = this.icons["folder"].icon;
        color = this.icons["folder"].color;
      }
      return { icon: icon, color: color };
    },
    organizeFileTree(res) {
      if (res !== []) {
        let sortedItems = res.children.sort((a, b) =>
          a.type < b.type ? 1 : -1
        );
        let filteredItems = sortedItems.filter(
          (item) => !item.path.includes("node_modules")
        );
        this.items = filteredItems;
      }
    },
    navigateTo(route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch((error) => {
          console.log(error);
        });
      }
    },
    createFileInRootDir() {
      this.currentItem = {};
      this.dialog = true;
    },
    setItem(item) {
      // console.log("item", item);
      this.currentItem = item;
    },
    show(e) {
      e.preventDefault();
      // console.log(e.target.attributes[1].nodeValue)
      let item = JSON.parse(e.target.attributes[1].nodeValue);
      this.setItem(item);

      this.showMenu = false;
      this.x = e.clientX;
      this.y = e.clientY;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    folderAction(menuItem, path) {
      console.log(menuItem, this.currentItem.path);
      this.dialog = true;
    },
    fileAction(menuItem) {
      switch (menuItem) {
        case "New file":
          this.dialog = true;
          this.action = "New file";
          break;
        case "Delete":
          this.action = "New file";
          this.deleteFile();
          break;
        case "Rename":
          this.dialog = true;
          this.action = "Rename";
          break;

        default:
          break;
      }
      console.log(menuItem);
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    async downloadProject() {
      await actions.downloadProject(this.contract).then((res) => {
        if (res) {
          let params = ["File ready for download", "success", 3000];
          this.sendNotification(params);
        } else {
          let params = ["Failed to download file", "red", 3000];
          this.sendNotification(params);
        }
      });
      console.log("items: ", this.items);
    },
    async createFile() {
      this.dialog = false;
      if (this.action === "Rename") {
        this.renameFile();
      } else {
        let data = {
          contract: this.contract,
          path:
            Object.keys(this.currentItem).length === 0
              ? ""
              : this.currentItem.path,
          filename: this.newFileName,
        };
        console.log(
          "item: ",
          this.currentItem,
          Object.keys(this.currentItem).length
        );

        await actions.createFile(data).then((res) => {
          if (!res.error) {
            this.organizeFileTree(res);
            let params = ["File created", "success", 3000];
            this.sendNotification(params);
          } else {
            let params = ["Failed to create file", "red", 3000];
            this.sendNotification(params);
          }
          this.newFileName = "";
        });
      }
    },
    async renameFile() {
      let allowRename = true;
      if (this.protectedFiles.includes(this.currentItem.name.toLowerCase())) {
        allowRename = false;
      }

      if (allowRename) {
        let data = {
          contract: this.contract,
          oldFilePath: this.currentItem.path,
          newFileName: this.newFileName,
          oldFileName: this.currentItem.name,
        };
        await actions.renameFile(data).then((res) => {
          if (!res.error) {
            this.organizeFileTree(res);
            let params = ["File renamed", "success", 3000];
            this.sendNotification(params);
            this.emitter.emit("closeTab", data.oldFilePath);
          } else {
            let params = ["Failed to rename file", "red", 3000];
            this.sendNotification(params);
          }
          this.newFileName = "";
        });
      } else {
        let params = ["You are not allowed to rename this file", "red", 3000];
        this.sendNotification(params);
      }
    },
    async deleteFile() {
      let allowDelete = true;
      console.log(this.currentItem.name);
      if (this.protectedFiles.includes(this.currentItem.name.toLowerCase())) {
        allowDelete = false;
      }

      if (allowDelete) {
        let data = {
          contract: this.contract,
          path: this.currentItem.path,
        };
        await actions.deleteFile(data).then((res) => {
          if (!res.error) {
            this.organizeFileTree(res);
            let params = ["File deleted", "success", 3000];
            this.sendNotification(params);
            this.emitter.emit("closeTab", data.path);
          } else {
            let params = ["Failed to delete file", "red", 3000];
            this.sendNotification(params);
          }
        });
      } else {
        let params = ["You are not allowed to delete this file", "red", 3000];
        this.sendNotification(params);
      }
    },
    async openFile(item) {
      try {
        this.setItem(item);
        if (this.currentItem.type === 0) {
          let readOnlyFiles = [];
          let readOnly = readOnlyFiles.includes(
            this.currentItem.name.toLowerCase()
          )
            ? true
            : false;
          let data = {
            path: this.currentItem.path,
          };
          let text = await actions.getText(data);
          if (text !== undefined) {
            let tab = {
              title: this.currentItem.name,
              path: this.currentItem.path,
              readOnly: readOnly,
              extension: this.currentItem.extension,
              text: text,
            };
            this.emitter.emit("newTab", tab);
          } else {
            let params = ["Error while trying to read file", "red", 3000];
            this.sendNotification(params);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    },
    sendNotification(params) {
      this.emitter.emit("showNotification", params);
    },
  },
};
</script>


<style scoped>
.border-l {
  border-left: 2px solid black !important;
}

.v-treeview {
  height: max-content;
}

.ov {
  /* overflow-y: scroll; */
}

.h3 {
  margin: 0;
  padding: 0;
}

.btn-new {
  padding-bottom: 10px;
}
</style>