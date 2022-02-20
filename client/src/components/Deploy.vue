<template 
>
  <v-container fluid class="">
    <h3 class="pl-3">Deploy</h3>
    <div class="mt-3 justify-center">
      <div class="mt-8">
        <div class="pl-3">
          <h3>Deploy contract</h3>
          <v-btn
            class="primary mt-3"
            @click="deploy"
            :disabled="btnDeploy"
            :loading="btnDeploy"
            >Deploy</v-btn
          >
        </div>
        <v-divider class="my-5"></v-divider>
        <div class="pl-3">
          <h3>Call contract</h3>
          <div class="my-2">
            <h4 class="">View methods</h4>
            <template>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(item, i) in viewMethods"
                  :key="i"
                  text
                >
                  <v-expansion-panel-header>
                    {{ item.name }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div v-for="(arg, j) in item.args" :key="j">
                      <v-text-field
                        v-if="arg.type.toLowerCase() !== 'boolean'"
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :type="
                          arg.type.toLowerCase() === 'string'
                            ? 'text'
                            : 'number'
                        "
                      ></v-text-field>
                      <v-select
                        v-else
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :items="bools"
                      ></v-select>
                    </div>

                    <v-btn
                      class="primary"
                      @click="callContract(i, 'view')"
                      :disabled="btnCall"
                      :loading="btnCall"
                    >
                      Call</v-btn
                    >
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>
          </div>
          <div class="my-2">
            <h4 class="">Change methods</h4>
            <template>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(item, i) in changeMethods"
                  :key="i"
                  text
                >
                  <v-expansion-panel-header>
                    {{ item.name }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div v-for="(arg, j) in item.args" :key="j">
                      <v-text-field
                        v-if="arg.type.toLowerCase() !== 'boolean'"
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :type="
                          arg.type.toLowerCase() === 'string'
                            ? 'text'
                            : 'number'
                        "
                      ></v-text-field>
                      <v-select
                        v-else
                        v-model="arg.default"
                        :label="arg.name + ' : ' + arg.type"
                        :items="bools"
                      ></v-select>
                    </div>

                    <v-btn
                      class="primary"
                      @click="callContract(i, 'change')"
                      :disabled="btnCall"
                      :loading="btnCall"
                    >
                      Call</v-btn
                    >
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>
          </div>
        </div>
      </div>
    </div></v-container
  >
</template>
          

<script>
import actions from "./actions";
import { bus } from "../main";
import * as nearAPI from "near-api-js";

export default {
  name: "Deploy",
  props: ["contract"],
  data: () => ({
    allowToGetManifest: false,
    account: {},
    btnDeploy: false,
    btnCall: false,
    bools: [true, false],
    viewMethods: [],
    changeMethods: [],
  }),
  mounted() {
    bus.$emit("getAccount");
  },
  created() {
    bus.$on("sendAccount", (data) => {
      try {
        console.log("acc", data);
        this.account = data;
        this.initialize();
      } catch (error) {
        console.log("error: ", error);
      }
    });

    bus.$on("getManifest", (data) => {
      console.log("get manifest");
      this.getManifest();
    });
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
        console.log("manifest: ", manifest);
        if (manifest !== undefined) {
          this.viewMethods = manifest.viewMethods;
          this.changeMethods = manifest.changeMethods;
        } else {
          let params = [
            "Failed to retrieved the contract methods, please check the NPGManifest.json",
            "red",
            3000,
          ];
          this.sendNotification(params);
        }
      });
    },
    async deploy() {
      bus.$emit("clearLogs", undefined);
      this.btnDeploy = true;
      const account = this.account;
      try {
        let res = await actions.getContract(this.contract);
        if (res !== undefined) {
          let compiledContract = res;

          await account
            .deployContract(compiledContract)
            .then((res) => {
              // console.log("res", res);
              bus.$emit("log", res);
              let params = [
                `Contract successfully deployed to account ${account.accountId} `,
                "success",
                3000,
              ];
              this.sendNotification(params);
            })
            .catch((error) => {
              console.log("error", error);
              bus.$emit("log", error);
              let params = ["Failed to deploy contract", "red", 3000];
              this.sendNotification(params);
            });
          this.btnDeploy = false;
        }
      } catch (error) {
        console.log("error", error);
        this.btnDeploy = false;
        let params = ["Failed to deploy contract", "red", 3000];
        this.sendNotification(params);
      }
    },
    async callContract(i, type) {
      try {
        this.btnCall = true;
        bus.$emit("clearLogs", undefined);
        let viewMethods = this.viewMethods.map((item) => {
          return item.name;
        });
        let changeMethods = this.changeMethods.map((item) => {
          return item.name;
        });

        console.log("payload: ", this.viewMethods[i]);

        const contract = new nearAPI.Contract(
          this.account,
          this.account.accountId,
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
              if (argType === "string" || argType === "boolean") {
                data[argName] = methodArg.default;
              } else {
                data[argName] = this.parseArg(methodArg);
              }
            }
          }

          console.log("call: ", method, data, contract[method.toString()]);
          let res = await contract[method](data);
          console.log("res: ", res);
          let message = res;
          bus.$emit("log", message);
        } else {
          method = changeMethods[i];
          if (this.changeMethods[i].args.length > 0) {
            for (let j = 0; j < this.changeMethods[i].args.length; j++) {
              let methodArg = this.changeMethods[i].args[j];
              let argName = methodArg.name;
              let argType = methodArg.type.toLowerCase();
              if (argType === "string" || argType === "boolean") {
                data[argName] = methodArg.default;
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
          bus.$emit("log", message);
          console.log("res", res);
        }

        this.btnCall = false;
      } catch (error) {
        this.btnCall = false;
        bus.$emit("log", error);
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
</style>