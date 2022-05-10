<template 
>
  <div fluid class="">
    <div>
      <p class="text-h6 q-pt-md">Deploy and Call</p>
    </div>
    <div class="q-mt-lg">
      <div class="">
        <div class="q-pl-md">
          <p class="text-bold">Deploy contract</p>
          <q-btn
            no-caps
            color="primary"
            @click="createSubAccount"
            :disabled="btnDeploy"
            :loading="btnDeploy"
            >Create sub-account</q-btn
          >
          <q-btn
            class="q-mt-lg"
            no-caps
            color="primary"
            @click="deployContract"
            :disabled="btnDeploy"
            :loading="btnDeploy"
            >Deploy</q-btn
          >
          <q-btn
            class="q-mt-lg"
            no-caps
            color="negative"
            @click="deleteSubAccount"
            :disabled="btnDeploy"
            :loading="btnDeploy"
            >Delete sub-account</q-btn
          >
        </div>
        <q-separator class="q-mt-lg" />

        <div class="q-pl-md">
          <p class="q-mt-lg text-bold">Call contract</p>
          <div class="my-2">
            <p class="">View methods</p>
            <div class="" v-if="viewMethods.length > 0">
              <q-expansion-item
                v-for="(item, i) in viewMethods"
                :key="i"
                :label="item.name"
              >
                <q-card>
                  <q-card-section>
                    <div v-for="(arg, j) in item.args" :key="j">
                      <q-input
                        class="q-mt-sm"
                        filled
                        v-if="arg.type.toLowerCase() !== 'boolean'"
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :type="
                          arg.type.toLowerCase() === 'string'
                            ? 'text'
                            : 'number'
                        "
                      />
                      <q-select
                        class="q-mt-sm"
                        v-else
                        outlined
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :options="booleans"
                      />
                    </div>
                    <q-btn
                      class="q-mt-sm"
                      no-caps
                      color="primary"
                      @click="callContract(i, 'view')"
                      :disable="btnCall"
                      :loading="btnCall"
                      label="Call"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>

          <q-separator class="q-mt-lg q-mx-sm" />

          <div class="q-mt-lg">
            <p class="">Change methods</p>
            <div v-if="changeMethods.length > 0">
              <q-expansion-item
                v-for="(item, i) in changeMethods"
                :key="i"
                :label="item.name"
              >
                <q-card>
                  <q-card-section>
                    <div v-for="(arg, j) in item.args" :key="j">
                      <q-input
                        class="q-mt-sm"
                        filled
                        v-if="arg.type.toLowerCase() !== 'boolean'"
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :type="
                          arg.type.toLowerCase() === 'string'
                            ? 'text'
                            : 'number'
                        "
                      />
                      <q-select
                        class="q-mt-sm"
                        v-else
                        outlined
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :options="booleans"
                      />
                    </div>
                    <q-btn
                      no-caps
                      class="q-mt-sm"
                      color="primary"
                      @click="callContract(i, 'change')"
                      :disable="btnCall"
                      :loading="btnCall"
                      label="Call"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
          

<script>
import actions from "./actions";
import "near-api-js/dist/near-api-js.min.js";
const { Contract } = window.nearApi;


import socketService from "./socketService";

import { useContractStore } from "@/stores/contract";
import { useQuasar } from "quasar";
import { mapState } from "pinia";

export default {
  name: "Deploy",
  data: () => ({
    allowToGetManifest: false,
    account: {},
    btnDeploy: false,
    btnCall: false,
    booleans: ["true", "false"],
    viewMethods: [],
    changeMethods: [],
  }),
  mounted() {
    // this.emitter.emit("getSubAccount", this.contract.name);
    this.emitter.emit("getAccount", null);
  },
  computed: {
    ...mapState(useContractStore, ["contract"]),
  },
  created() {
    this.emitter.on("sendAccount", (data) => {
      try {
        console.log("acc", data);
        this.account = data;
        this.initialize();
      } catch (error) {
        console.log("error: ", error);
      }
    });

    this.emitter.on("getManifest", (data) => {
      console.log("get manifest");
      this.getManifest();
    });
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
      this.getManifest();
    },
    async getManifest() {
      let data = {
        contract: this.contract,
      };
      actions.getManifest(data).then((manifest) => {
        if (manifest !== undefined) {
          this.viewMethods = manifest.viewMethods;
          this.changeMethods = manifest.changeMethods;
          console.log("manifest: ", manifest);
        } else {
          let params = [
            "Failed to retrieved the contract methods, please check the NPGManifest.json",
            "negative",
          ];
          this.showNotification(params[0], params[1]);
        }
      });
    },
    async deploy() {
      this.emitter.emit("clearLogs", undefined);
      this.btnDeploy = true;
      const account = this.account;
      try {
        let res = await actions.getContract(this.contract);
        if (res !== undefined) {
          let compiledContract = res;
          let data = {
            binary: compiledContract,
            subAccountID: this.contract.name,
          };
          this.emitter.emit("deploy", data);
       
          this.btnDeploy = false;
        }
      } catch (error) {
        console.log("error", error);
        this.btnDeploy = false;
        let params = ["Failed to deploy contract", "negative"];
        this.showNotification(params[0], params[1]);
      }
    },
    async deployContract() {
      console.log("deploy contract");
      this.emitter.emit("clearLogs", undefined);

      let data = {
        masterAccount: this.account.accountId,
        contract: this.contract,
      };
      socketService.socket.emit("deploy", data);
    },
    async createSubAccount() {
      this.emitter.emit("clearLogs", undefined);
      let data = { contract: this.contract };
      socketService.socket.emit("createSubAccount", data);
    },
    async deleteSubAccount() {
      this.emitter.emit("clearLogs", undefined);
      let data = { contract: this.contract };
      socketService.socket.emit("deleteSubAccount", data);
    },
    async callContract(i, type) {
      try {
        this.btnCall = true;
        this.emitter.emit("clearLogs", undefined);
        let viewMethods = this.viewMethods.map((item) => {
          return item.name;
        });
        let changeMethods = this.changeMethods.map((item) => {
          return item.name;
        });

        console.log("payload: ", this.viewMethods[i]);

        const contract = new Contract(
          this.account,
          this.contract.name,
          {
            viewMethods: viewMethods,
            changeMethods: changeMethods,
            sender: this.account,
          }
        );

        let method = "";
        let data = {};
        if (type === "view") {
          method = viewMethods[i];
          if (this.viewMethods[i].args.length > 0) {
            for (let j = 0; j < this.viewMethods[i].args.length; j++) {
              let methodArg = this.viewMethods[i].args[j];
              let argName = methodArg.name;
              let argType = methodArg.type.toLowerCase();
              if (argType === "string") {
                data[argName] = methodArg.default;
              } else if (argType === "boolean") {
                console.log("value", methodArg.default);
                data[argName] = methodArg.default === "true" ? true : false;
              } else {
                data[argName] = this.parseArg(methodArg);
              }
            }
          }

          console.log("call: ", method, data, contract[method.toString()]);
          let res = await contract[method](data);
          console.log("res: ", res);
          let message = res;
          this.emitter.emit("log", message);
        } else {
          method = changeMethods[i];
          if (this.changeMethods[i].args.length > 0) {
            for (let j = 0; j < this.changeMethods[i].args.length; j++) {
              let methodArg = this.changeMethods[i].args[j];
              let argName = methodArg.name;
              let argType = methodArg.type.toLowerCase();
              if (argType === "string") {
                data[argName] = methodArg.default;
              } else if (argType === "boolean") {
                data[argName] = methodArg.default === "true" ? true : false;
              } else {
                data[argName] = this.parseArg(methodArg);
              }
            }
          }
          console.log("call: ", method, data, contract[method.toString()]);
          let res = await contract[method](data);

          let message = `Method: ${method} \n`;
          message += `args: ${JSON.stringify(data)} \n`;
          message += `response: ${res} \n`;
          this.emitter.emit("log", message);
          console.log("res", res);
        }

        this.btnCall = false;
      } catch (error) {
        this.btnCall = false;
        this.emitter.emit("log", error);
        console.log("err: ", error);
      }
    },
    parseArg(arg) {
      switch (arg.type.toLowerCase()) {
        case "float":
          return parseFloat(arg.default);
        case "int":
          return parseInt(arg.default);
      }
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
</style>