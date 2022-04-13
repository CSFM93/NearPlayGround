<template 
>
  <v-container fluid class="">
    <v-row>
      <v-col cols="7">
        <h3 class="pl-3">Explorer</h3>
      </v-col>
      <v-col>
        <v-row class="ml-2" cols="5">
          <template>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="btn-new"
                  v-bind="attrs"
                  v-on="on"
                  @click="createFileInRootDir"
                >
                  <v-icon>mdi-file-plus</v-icon>
                </v-btn>
              </template>
              <span>New file</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="btn-new"
                  v-bind="attrs"
                  v-on="on"
                  @click="downloadProject"
                >
                  <v-icon>mdi-file-download</v-icon>
                </v-btn>
              </template>
              <span>Download file</span>
            </v-tooltip>
            <v-dialog v-model="dialog" max-width="400px">
              <v-card>
                <v-card-title>
                  <span class="headline">Enter File name</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="8">
                        <v-text-field
                          v-model="newFileName"
                          label="Filename"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDialog"
                    >Cancel</v-btn
                  >
                  <v-btn
                    @click="createFile"
                    color="primary"
                    :disabled="btnCreateFile"
                    :loading="btnCreateFile"
                    >Save</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
        </v-row>
      </v-col>
    </v-row>
    <v-flex xs12 style="overflow: auto">
      <v-treeview
        v-model="tree"
        :open="initiallyOpen"
        :items="items"
        activatable
        hoverable
        item-key="path"
        open-on-click
        class="ov"
      >
        <template slot="label" slot-scope="{ item, open }">
          <a
            @contextmenu="show"
            :data-item="JSON.stringify(item)"
            :ripple="false"
            @click="openFile(item)"
          >
            <v-icon v-if="item.type === 1">
              {{ open ? "mdi-folder-open" : "mdi-folder" }}
            </v-icon>
            <v-icon v-else>
              {{
                item.extension === ".toml"
                  ? files["txt"]
                  : files[item.extension.replace(".", "")]
              }}
            </v-icon>
            {{ item.name }}
          </a>
        </template>
      </v-treeview>
    </v-flex>
    <v-menu
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
    >
      <v-list v-if="currentItem.type === 1">
        <v-list-item v-for="menuItem in folderMenuItems" :key="menuItem">
          <v-list-item-title @click="folderAction(menuItem)">{{
            menuItem
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-list v-else>
        <v-list-item v-for="menuItem in fileMenuItems" :key="menuItem">
          <v-list-item-title @click="fileAction(menuItem)">{{
            menuItem
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script>
import actions from "./actions";

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
    files: {
      html: "mdi-language-html5",
      js: "mdi-nodejs",
      ts:"mdi-language-typescript",
      json: "mdi-code-json",
      md: "mdi-language-markdown",
      pdf: "mdi-file-pdf",
      png: "mdi-file-image",
      txt: "mdi-file-document-outline",
      xls: "mdi-file-excel",
      rs: "mdi-language-rust",
    },
    tree: [],
    items: [],
    currentItem: {},
  }),
  created() {
    this.initialize();
    this.emitter.on("refreshView", data => {
      this.initialize()
    });
  },
  methods: {
    async initialize() {
      let data = { contract: this.contract };
      let res = await actions.getFileTree(data);
      console.log(res);
      this.organizeFileTree(res);
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