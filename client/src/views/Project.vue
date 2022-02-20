<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3" class="sidebar border-r1 d-flex align-stretch">
        <v-tabs vertical class="border-r2 pt-2" v-model="activeTab">
          <v-tab
            v-for="(tab, i) in tabs"
            :key="i"
            @click="changeActiveTab(i)"
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="primary"
                  dark
                  v-bind="attrs"
                  v-on="on"
                  left
                  x-large
                >
                  {{ tab.icon }}
                </v-icon>
              </template>
              <span>{{ tab.tooltip }}</span>
            </v-tooltip>
          </v-tab>
          <v-tab-item>
            <TreeView :contract="contract" />
          </v-tab-item>
          <v-tab-item>
            <CompileView :contract="contract" />
          </v-tab-item>
          <v-tab-item>
            <DeployView :contract="contract" />
          </v-tab-item>
        </v-tabs>
      </v-col>
      <v-col cols="8" class="">
        <splitpanes class="default-theme" horizontal style="height: 100vh">
          <pane
            :key="1"
            size="70"
            min-size="20"
            max-size="90"
            style="background-color: #1e1e1e"
          >
            <FileViewer class="d-flex align-stretch" />
          </pane>
          <pane
            :key="2"
            min-size="10"
            max-size="80"
            style="background-color: #1e1e1e"
          >
            <Logs class="d-flex align-stretch" />
          </pane>
        </splitpanes>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

import TreeView from "../components/TreeView.vue";
import CompileView from "../components/Compile.vue";
import DeployView from "../components/Deploy.vue";
import FileViewer from "./FileViewer.vue";

import Logs from "../components/Logs.vue";
import { bus } from "../main";

export default {
  name: "TabsLayout",
  components: {
    TreeView,
    CompileView,
    DeployView,
    FileViewer,
    Splitpanes,
    Pane,
    Logs,
  },
  data: () => ({
    activeTab: null,
    contract: {},
    tabs: [
      { icon: "mdi-file", tooltip: "Write" },
      { icon: "mdi-test-tube", tooltip: "Test and Compile" },
      { icon: "mdi-cloud-upload", tooltip: "Deploy and call" },
    ],
  }),
  async created() {
    this.initialize();
  },
  computed: {},
  methods: {
    async initialize() {
      this.contract = await this.$store.state.contract;
      console.log("contract", this.contract);

      return this.contract;
    },
    changeActiveTab(i) {
      if (i == 2) {
        this.getManifest();
      }
    },
    getManifest() {
      bus.$emit("getManifest", undefined);
    },
  },
};
</script>

<style >
.col-3 {
  padding: 0px;
  border-right: 1px solid black !important;
}

.border-r2 {
  /* height: 120vh !important; */
  overflow-y: scroll;
}

.v-tabs--vertical > .v-tabs-bar {
  /* height: 100vh !important; */
  border-right: 1px solid black !important;
}

.container {
  padding-right: 0 !important;
  padding-left: 0 !important;
}
</style>
