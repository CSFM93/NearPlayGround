<template>
  <v-container>
    <v-tabs  v-model="currentTab">
      <v-tab
        v-for="(tab, i) in tabs"
        :ref="'tab-' + i"
        :key="i"
        :id="'tab-' + i"
        @click="switchTab(i)"
      >
        <v-icon left small>
          {{ files[tab.extension.replace(".", "")] }}
        </v-icon>
        {{ tab.title }}
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="btn-new"
              v-bind="attrs"
              v-on="on"
              @click="closeFile(i)"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </template>
          <span>Close file</span>
        </v-tooltip>
      </v-tab>
      <v-tab-item v-for="item in tabs" :key="'tab-editor-' + item.path">
        <Editor
          v-if="Object.keys(tab).length > 0"
          :readOnly="tab.readOnly"
          :key="tabItemKey"
          :editorKey="'editor-' + tab.path"
          :text="tab.text"
          :path="tab.path"
          :options="tab.options"
          :extension="tab.extension"
        />
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import Editor from "./Editor.vue";
import { v4 as uuidv4 } from "uuid";

import { bus } from "../main";
import actions from "../components/actions";

export default {
  name: "EditorTabs",
  components: {
    Editor,
  },
  data: () => ({
    contract: {},
    tabItemKey: uuidv4(),
    currentTab:null,
    tab: {},
    tabs: [],
    files: {
      html: "mdi-language-html5",
      js: "mdi-nodejs",
      json: "mdi-code-json",
      md: "mdi-language-markdown",
      pdf: "mdi-file-pdf",
      png: "mdi-file-image",
      txt: "mdi-file-document-outline",
      toml: "mdi-file-document-outline",
      xls: "mdi-file-excel",
      rs: "mdi-language-rust",
    },
  }),
  async created() {
    this.initialize();

    bus.$on("newTab", (data) => {
      console.log("new tab", data.path);
      let tabExists = false;
      let index = 0;
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].path === data.path) {
          index = i;
          tabExists = true;
          break;
        }
      }
      if (!tabExists) {
        console.log("tab does not exist ------------------");
        this.tabs.push(data);
        this.tab = JSON.parse(JSON.stringify(data));
        this.tabItemKey = uuidv4();
        this.currentTab = (this.tabs.length - 1)
        // setTimeout(() => {
        //   let tabName = "tab-" + (this.tabs.length - 1);
        //   let el = document.getElementById(tabName);
        //   el.click();
        // }, 200);
      } else {
        console.log("tab exists ------------------");
        // setTimeout(() => {
        this.currentTab = index
        // let el = document.getElementById(tabName);
        // el.click();
        // }, 0);

        this.switchTab(index);
        // setTimeout(() => {
        //   let el = this.$refs[tabName][0].$el;
        //   console.log("element: ", el);
        //   el.click();
        // }, 500);
      }
    });
    bus.$on("closeTab", (filePath) => {
      let index = 0;
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].path === filePath) {
          this.closeFile(i);
          break;
        }
      }
    });
  },
  computed: {},
  methods: {
    async initialize() {
      this.contract = await this.$store.state.contract;
      console.log("contract", this.contract);

      return this.contract;
    },
    closeFile(index) {
      this.tabs.splice(index, 1);
      if (index - 1 > 0) {
        this.switchTab(index - 1);
      }
    },
    async switchTab(index) {
      console.log("switch tab: ", index, this.tabs[index].path);

      let data = {
        path: this.tabs[index].path,
      };
      let text = await actions.getText(data);
      if (text !== undefined) {
        let tab = {
          title: this.tabs[index].name,
          path: this.tabs[index].path,
          readOnly: this.tabs[index].readOnly,
          extension: this.tabs[index].extension,
          text: text,
        };
        this.tab = JSON.parse(JSON.stringify(tab));
        this.tabItemKey = uuidv4();
      }
    },
  },
};
</script>

<style scoped>
.v-tab {
  text-transform: none !important;
}
</style>
