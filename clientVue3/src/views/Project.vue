<template>
  <div>
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <q-splitter
          v-model="splitterModel2"
          style="width: 100%; height: 92vh"
          class="col"
        >
          <template v-slot:before>
            <q-tabs
              v-model="tab"
              vertical
              class="text-grey"
              active-color="white"
              indicator-color="primary"
            >
              <q-tab
                :name="tab1.tooltip"
                label=""
                v-for="(tab1, i) in tabs"
                :key="i"
                @click="changeActiveTab(i)"
              >
                <q-icon :name="tab1.icon" size="lg" />
                <q-tooltip>{{ tab1.tooltip }}</q-tooltip>
              </q-tab>
            </q-tabs>
          </template>

          <template v-slot:after>
            <q-tab-panels
              v-model="tab"
              animated
              swipeable
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel name="Write" style="height: 92vh">
                <TreeView />
              </q-tab-panel>

              <q-tab-panel name="Test and Compile" style="height: 92vh">
                <CompileView />
              </q-tab-panel>

              <q-tab-panel name="Deploy and call" style="height: 92vh" >
                <DeployView />
              </q-tab-panel>
            </q-tab-panels>
          </template>
        </q-splitter>
      </template>
      <template v-slot:after>
        <div>
          <q-splitter
            v-model="splitterModel3"
            horizontal
            style="height: 92vh"
            reverse
          >
            <template v-slot:before>
              <div class="">
                <FileViewer class="" />
              </div>
            </template>

            <template v-slot:after>
              <Logs />
            </template>
          </q-splitter>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

import TreeView from "../components/TreeView.vue";
import CompileView from "../components/Compile.vue";
import DeployView from "../components/Deploy.vue";
import FileViewer from "./FileViewer.vue";

import Logs from "../components/Logs.vue";

import { ref } from "vue";
import { useQuasar } from "quasar";
import { useContractStore } from "@/stores/contract";

import { mdiFile, mdiTestTube, mdiCloudUpload } from "@quasar/extras/mdi-v6";

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
    tab: ref("Deploy and call"),
    splitterModel: ref(22),
    splitterModel2: ref(15),
    splitterModel3: ref(15),
    activeTab: null,
    contract: {},
    tabs: [],
  }),
  async created() {
    this.mdiFile = mdiFile;
    this.mdiTestTube = mdiTestTube;
    this.mdiCloudUpload = mdiCloudUpload;

    this.tabs = [
      { icon: this.mdiFile, tooltip: "Write" },
      { icon: this.mdiTestTube, tooltip: "Test and Compile" },
      { icon: this.mdiCloudUpload, tooltip: "Deploy and call" },
    ];
    this.initialize();
  },
  setup() {
    const contractStore = useContractStore();

    // console.log("project contract: ",contractStore.contract)
    const $q = useQuasar();
    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
      contractStore,
    };
  },
  methods: {
    async initialize() {
      // this.contract = await this.$store.state.contract;
      // console.log("contract", this.contractStore);
      // return this.contract;
    },
    changeActiveTab(i) {
      if (i == 2) {
        this.getManifest();
      }
    },
    getManifest() {
      this.emitter.emit("getManifest", undefined);
    },
  },
};
</script>

<style >
</style>
