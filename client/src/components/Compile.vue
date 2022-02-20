<template 
>
  <v-container fluid class="">
    <h3 class="pl-3">Compile and test</h3>
    <div class="mt-8">
      <div class="pl-3">
        <p>Test</p>
        <v-btn
          class="primary"
          @click="test"
          :disabled="btnTesting"
          :loading="btnTesting"
          >Test</v-btn
        >
      </div>
      <v-divider class="my-5"></v-divider>
      <div class="pl-3">
        <p>Compile</p>
        <v-btn
          class="primary"
          @click="compile"
          :disabled="btnCompiling"
          :loading="btnCompiling"
          >Compile</v-btn
        >
      </div>
    </div>
  </v-container>
</template>

<script>
import socketService from "./socketService";
import { bus } from "../main";

export default {
  name: "CompileView",
  props: ["contract"],
  data: () => ({
    btnCompiling: false,
    btnTesting: false,
  }),
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      socketService.socket.on("logEnd", (data) => {
        this.btnCompiling = false;
        this.btnTesting = false;
         bus.$emit("refreshView", undefined);
         let params = [
            "End of output",
            "success",
            3000,
          ];
          this.sendNotification(params);
      });
    },
    async compile() {
      console.log("compile");
      bus.$emit("clearLogs", undefined);
      let command = this.contract.type === "Rust"? "cargo build --target wasm32-unknown-unknown --release --target-dir ../target" :"npm run build"
      let data = {
        command: command,
        contract: this.contract,
      };
      socketService.socket.emit("compile", data);
      this.btnCompiling = true;
    },
    async test() {
      console.log("test");
      bus.$emit("clearLogs", undefined);
      let command = this.contract.type === "Rust"? "cargo test --target-dir ../target" : "npm run test --no-color"
      let data = {
        command: command,
        contract: this.contract,
      };
      socketService.socket.emit("test", data);
      this.btnTesting = true;
    },
    sendNotification(params) {
      bus.$emit("showNotification", params);
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
.border-l {
  border-left: 2px solid black !important;
}

.center {
  margin: auto;
}
</style>