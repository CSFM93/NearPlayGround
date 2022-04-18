<template 
>
  <div class="">
    <div class="row">
      <p class="col-8 text-h6 q-pt-md">Explorer</p>
      <q-btn
        class="col"
        flat
        color="white"
        :icon="selectIcon('newFile').icon"
        @click="createFileInRootDir"
      >
        <q-tooltip>New file</q-tooltip>
      </q-btn>
      <q-btn
        class="col"
        flat
        color="white"
        :icon="selectIcon('downloadProject').icon"
        @click="downloadProject"
      >
        <q-tooltip>Download Project</q-tooltip>
      </q-btn>
    </div>
    <q-dialog v-model="dialog" @hide="closeDialog">
      <q-card class="cardForm" style="height: 40vh; width: 50vw">
        <q-card-section>
          <div class="text-h6 text-center">Enter File name</div>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              filled
              v-model="newFileName"
              label="Filename"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
          </q-form>
        </q-card-section>
        <q-card-actions class="row justify-center centers">
          <q-btn
            label="Save"
            color="primary"
            type="submit"
            @click="createFile"
            :disable="btnCreateFile"
            :loading="btnCreateFile"
          />
          <q-btn
            @click="closeDialog"
            label="Cancel"
            color="primary"
            class="q-ml-xl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-tree
      :nodes="items"
      node-key="name"
      selected-color="primary"
      default-expand-all
    >
      <template v-slot:default-header="prop">
        <a
          class="row items-center cursor-pointer"
          v-bind:class="{ 'text-primary': checkCurrentItem(prop.node) }"
          @click="openFile(prop.node)"
        >
          <q-icon
            :name="selectIcon(prop.node.extension).icon"
            size="md"
            class="q-mr-sm"
            :color="selectIcon(prop.node.extension).color"
          />
          <div class="text-gray text-caption">{{ prop.node.name }}</div>
        </a>
        <q-menu context-menu>
          <q-list style="min-width: 10vw" v-if="currentItem.type === 1">
            <q-item
              clickable
              v-close-popup
              v-for="menuItem in folderMenuItems"
              :key="menuItem"
              @click="folderAction(menuItem)"
            >
              <q-item-section>{{ menuItem }}</q-item-section>
            </q-item>
          </q-list>
          <q-list style="min-width: 100px" v-else>
            <q-item
              clickable
              v-close-popup
              v-for="menuItem in fileMenuItems"
              :key="menuItem"
              @click="fileAction(menuItem)"
            >
              <q-item-section>{{ menuItem }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </template>
    </q-tree>
  </div>
</template>

<script>
import actions from "./actions";
import { useContractStore } from "@/stores/contract";
import { useQuasar } from "quasar";
import { mapState } from "pinia";

import {
  mdiLanguageHtml5,
  mdiLanguageTypescript,
  mdiLanguageMarkdown,
  mdiImage,
  mdiFile,
  mdiLanguageRust,
  mdiFileExcel,
  mdiNodejs,
  mdiLanguageJavascript,
  mdiText,
  mdiFilePlus,
  mdiFileDownload,
} from "@quasar/extras/mdi-v6";

import { fasFolder } from "@quasar/extras/fontawesome-v6";

export default {
  name: "TreeView",
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
      json: { icon: mdiNodejs, color: "positive" },
      md: { icon: mdiLanguageMarkdown, color: "blue" },
      png: { icon: mdiImage, color: "positive" },
      txt: { icon: mdiText, color: "grey" },
      xls: { icon: mdiFileExcel, color: "green" },
      rs: { icon: mdiLanguageRust, color: "deep-orange" },
      file: { icon: mdiFile, color: "grey" },
      folder: { icon: fasFolder, color: "grey" },
      newFile: { icon: mdiFilePlus, color: "white" },
      downloadProject: { icon: mdiFileDownload, color: "white" },
    },
    tree: [],
    items: [],
    currentItem: {},
  }),
  setup(props, context) {
    const $q = useQuasar();

    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
    };
  },
  computed: {
    ...mapState(useContractStore, ["contract"]),
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
      let res = await actions.getFileTree(data);
      console.log("file tree:", res);
      this.organizeFileTree(res);
    },
    selectIcon(extension) {
      let icon;
      let color;
      if (extension !== undefined) {
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
    checkCurrentItem(item) {
      let selected = this.currentItem.name === item.name;
      return selected;
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
      this.newFileName = "";
    },
    async downloadProject() {
      await actions.downloadProject(this.contract).then((res) => {
        if (res) {
          let params = ["File ready for download", "positive"];
          this.showNotification(params[0],params[1]);
        } else {
          let params = ["Failed to download file", "negative"];
          this.showNotification(params[0],params[1]);
        }
      });
      console.log("items: ", this.items);
    },
    async createFile() {
      console.log("create file");
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
            let params = ["File created", "positive"];
            this.showNotification(params[0],params[1]);
          } else {
            let params = ["Failed to create file", "negative"];
            this.showNotification(params[0],params[1]);
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
            let params = ["File renamed", "positive"];
            this.showNotification(params[0],params[1]);
            this.emitter.emit("closeTab", data.oldFilePath);
          } else {
            let params = ["Failed to rename file", "negative"];
            this.showNotification(params[0],params[1]);
          }
          this.newFileName = "";
        });
      } else {
        let params = ["You are not allowed to rename this file", "negative"];
        this.showNotification(params[0],params[1]);
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
            let params = ["File deleted", "positive"];
            this.showNotification(params[0],params[1]);
            this.emitter.emit("closeTab", data.path);
          } else {
            let params = ["Failed to delete file", "negative"];
            this.showNotification(params[0],params[1]);
          }
        });
      } else {
        let params = ["You are not allowed to delete this file", "negative"];
        this.showNotification(params[0],params[1]);
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
            let params = ["Error while trying to read file", "negative"];
            this.showNotification(params[0],params[1]);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    },
  },
};
</script>


<style scoped>
.itemSelected {
  /* background-color: #31CCEC; */
}
</style>