<template 
>
  <div fluid class="">
    <div>
      <p class="text-h6 q-pt-md">Test and compile</p>
    </div>
    <div class="q-mt-lg">
      <div class="q-pl-md">
        <p class="">Test your smart contract</p>
        <q-btn
          no-caps
          color="primary"
          @click="test"
          :disable="btnTesting"
          :loading="btnTesting"
          >Test</q-btn
        >
      </div>

      <q-separator class="q-mt-lg" />

      <div class="q-pt-lg q-pl-md">
        <p>Compile your contract</p>
        <q-btn
          no-caps
          color="primary"
          @click="compile"
          :disable="btnCompiling"
          :loading="btnCompiling"
          >Compile</q-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import socketService from "./socketService";
import { useContractStore } from "@/stores/contract";
import { useQuasar } from "quasar";
import { mapState } from "pinia";

export default {
  name: "CompileView",
  data: () => ({
    btnCompiling: false,
    btnTesting: false,
  }),
  created() {
    this.initialize();
  },
  computed: {
    ...mapState(useContractStore, ["contract"]),
  },
  setup() {
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
  methods: {
    async initialize() {
      console.log(this.contract);
      socketService.socket.on("logEnd", (data) => {
        this.btnCompiling = false;
        this.btnTesting = false;
        this.emitter.emit("refreshView", undefined);
        let params = ["End of output", "positive"];
        this.showNotification(params[0],params[1]);
      });
    },
    async compile() {
      console.log("compile");
      this.emitter.emit("clearLogs", undefined);
      let command =
        this.contract.type === "Rust"
          ? "cargo build --target wasm32-unknown-unknown --release --target-dir ../target"
          : "npm run build";
      let data = {
        command: command,
        contract: this.contract,
      };
      socketService.socket.emit("compile", data);
      this.btnCompiling = true;
    },
    async test() {
      console.log("test");
      this.emitter.emit("clearLogs", undefined);
      let command =
        this.contract.type === "Rust"
          ? "cargo test --target-dir ../target"
          : "npm run test --no-color";
      let data = {
        command: command,
        contract: this.contract,
      };
      socketService.socket.emit("test", data);
      this.btnTesting = true;
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