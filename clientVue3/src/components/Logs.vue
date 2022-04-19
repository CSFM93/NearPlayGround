<template>
  <div>
    <q-tabs v-model="tab" content-class="items-start">
      <q-tab class="" name="logs">Logs</q-tab>
    </q-tabs>
    <q-tab-panels v-model="tab">
      <q-tab-panel name="logs">
        <p v-for="(item, i) in items" :key="i">
          {{ item }}
        </p>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import socketService from "./socketService";
import { ref } from "vue";

export default {
  name: "Logs",

  data: () => ({
    items: ["hello", "hello", "hello", "hello"],
  }),
  setup(props, context) {
    return {
      tab: ref("logs"),
    };
  },
  created() {
    this.initialize();
    this.emitter.on("clearLogs", (data) => {
      this.items = [];
    });
    this.emitter.on("log", (data) => {
      this.items.push(data);
    });
  },
  mounted() {
    let myTabs = document.getElementsByClassName("q-tabs__content")[2];
    console.log(myTabs)

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
  methods: {
    async initialize() {
      socketService.socket.on("log", (data) => {
        console.log("log", data);
        this.items.push(data);
      });
    },
    navigateTo(route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch((error) => {
          console.log(error);
        });
      }
    },
  },
};
</script>


<style scoped>
.logContainer {
  max-height: 50vh;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>
