<template>
  <div>
    <q-splitter v-model="splitterModel" style="width: 25vw; height: 92vh">
      <template v-slot:before>
        <q-tabs v-model="tab" vertical class="text-teal">
          <q-tab :name="tab1.tooltip" label="" v-for="(tab1, i) in tabs" :key="i">
            <q-icon :name="tab1.icon" size="lg" />
            <q-tooltip>{{ tab1.tooltip }}</q-tooltip>
          </q-tab>

          <q-tab name="alarms" :icon="mdiTestTube" />
          <q-tab name="movies" :icon="mdiCloudUpload" />
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
            <TreeView  :contract="storeContract.contract" />
          </q-tab-panel>

          <q-tab-panel name="Test and Compile" style="height: 92">
            <div class="text-h4 q-mb-md">Alarms</div>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
          </q-tab-panel>

          <q-tab-panel name="Deploy and call" style="height: 92vh">
            <div class="text-h4 q-mb-md">Movies</div>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
          </q-tab-panel>
        </q-tab-panels>
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

import { mdiFile } from "@quasar/extras/mdi-v6";
import { mdiTestTube } from "@quasar/extras/mdi-v6";
import { mdiCloudUpload } from "@quasar/extras/mdi-v6";

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
    tab: ref("Write"),
    splitterModel: ref(20),
    activeTab: null,
    contract: {},
    tabs: [],
  }),
  async created() {
    this.tabs = [
      { icon: mdiFile, tooltip: "Write" },
      { icon: mdiTestTube, tooltip: "Test and Compile" },
      { icon: mdiCloudUpload, tooltip: "Deploy and call" },
    ];
    this.initialize();
  },
  setup() {
    const storeContract = useContractStore();
    const $q = useQuasar();
    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
      storeContract,
    };
  },
  methods: {
    async initialize() {
      // this.contract = await this.$store.state.contract;
      console.log("contract", this.storeContract);

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
