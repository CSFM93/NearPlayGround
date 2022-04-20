<template>
  <div>
    <q-tabs
      id="my-tabs"
      v-model="selectedTab"
      class=""
      content-class="items-start"
      switch-indicator
      indicator-color="primary"
    >
      <q-tab
        no-caps
        v-for="(tab, i) in tabs"
        :ref="'tab-' + i"
        :key="i"
        :id="'tab-' + i"
        :name="i"
        style="border-right: 0.01vh solid black"
      >
        <div class="row">
          <div class="" @click="switchTab(i)">
            <q-icon
              class=""
              :name="selectIcon(tab.extension).icon"
              :color="selectIcon(tab.extension).color"
              size="md"
            />
            {{ tab.title }}
          </div>
          <q-btn
            flat
            size="xs"
            :icon="selectIcon('closeFile').icon"
            :color="selectIcon('closeFile').color"
            @click="closeFile(i)"
          >
            <q-tooltip> Close </q-tooltip>
          </q-btn>
        </div>
      </q-tab>
    </q-tabs>
    <q-tab-panels v-model="selectedTab" animated class="">
      <q-tab-panel
        v-for="(item, i) in tabs"
        :key="'tab-editor-' + item.path"
        :name="i"
      >
        <div style="height: 70vh">
          <Editor
            v-if="Object.keys(tab).length > 0"
            :readOnly="tab.readOnly"
            :key="i"
            :editorKey="'editor-' + tab.path"
            :text="tab.text"
            :path="tab.path"
            :options="tab.options"
            :extension="tab.extension"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import Editor from "./Editor.vue";
import { v4 as uuidv4 } from "uuid";

import actions from "../components/actions";
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
  mdiClose,
} from "@quasar/extras/mdi-v6";

import { fasFolder } from "@quasar/extras/fontawesome-v6";

import { ref } from "vue";

export default {
  name: "EditorTabs",
  components: {
    Editor,
  },
  data: () => ({
    tabItemKey: uuidv4(),
    currentTab: null,
    tab: {},
    tabs: [],
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
      closeFile: { icon: mdiClose, color: "white" },
    },
  }),
  setup() {
    const $q = useQuasar();

    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
      selectedTab: ref(""),
    };
  },
  computed: {
    ...mapState(useContractStore, ["contract"]),
  },

  mounted() {
    let myTabs = document.getElementsByClassName("q-tabs__content")[1];

    if (myTabs.classList.contains("items-center")) {
      myTabs.className = myTabs.className.replace(
        "items-center",
        "items-start"
      );

      myTabs.className = myTabs.className.replace(
        "q-tabs__content--align-center",
        ""
      );
    }
  },
  beforeUpdate() {
    console.log("before update");
    let myTabs = document.getElementsByClassName("q-tabs__content")[1];

    if (myTabs.classList.contains("items-center")) {
      myTabs.className = myTabs.className.replace(
        "items-center",
        "items-start"
      );

      myTabs.className = myTabs.className.replace(
        "q-tabs__content--align-center",
        ""
      );
    }
  },
  async created() {
    this.initialize();

    this.emitter.on("newTab", (data) => {
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
        console.log("tab does not exist ------------------", this.selectedTab);
        this.tabs.push(data);
        this.tab = JSON.parse(JSON.stringify(data));
        this.tabItemKey = uuidv4();
        this.selectedTab = this.tabs.length - 1;
      } else {
        console.log("tab exists ------------------", this.selectedTab);
        this.selectedTab = index;
        this.switchTab(index);
      }
    });
    this.emitter.on("closeTab", (filePath) => {
      let index = 0;
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].path === filePath) {
          this.closeFile(i);
          break;
        }
      }
    });
  },
  methods: {
    async initialize() {
      console.log("contract", this.contract);

      return this.contract;
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
    closeFile(index) {
      console.log("delete ", index);
      this.tabs.splice(index, 1);
      let newIndex = index - 1;
      if (newIndex > 0) {
        this.switchTab(newIndex);
      }
    },
    async switchTab(index) {
      if (this.tabs.length - 1 >= index) {
        console.log("switch tab: ", index);

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
          this.selectedTab = index;
        }
      }
    },
  },
};
</script>


