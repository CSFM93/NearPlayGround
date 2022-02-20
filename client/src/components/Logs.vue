<template>
  <v-container>
    <v-tabs>
      <v-tab>Logs</v-tab>
      <v-tab-item class="">
        <div class="mt-3 logContainer">
          <p v-for="(item, i) in items" :key="i" class="ml-5 mb-0" style="white-space: pre-wrap">
            {{ item }}
          </p>
        </div>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import socketService from "./socketService";
import { bus } from "../main";
export default {
  name: "CompileView",
  data: () => ({
    items: [],
  }),
  created() {
    this.initialize();
    bus.$on("clearLogs", (data) => {
      this.items = [];
    });
    bus.$on("log", (data) => {
      this.items.push(data)
    });
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
