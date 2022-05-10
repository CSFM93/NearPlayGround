<template>
  <div>
    <q-layout container style="height: 100vh" class="">
      <q-header elevated>
        <q-toolbar class="bg-dark t-bar">
          <q-toolbar-title
            class="cursor-pointer text-primary"
            @click="navigateTo('home')"
          >
            Near Playground</q-toolbar-title
          >
          <template v-if="isAuthenticated">
            <div class="">
              <p no-caps class="q-pt-md text-center text-subtitle1">
                {{ nearAddress }}
              </p>
            </div>
            <div class="q-ml-md">
              <q-btn
                no-caps
                class="text-primary text-subtitle1"
                flat
                @click="navigateTo('contracts')"
                >Contracts</q-btn
              >
            </div>
            <div class="q-ml-md">
              <q-btn
                no-caps
                class="text-negative text-subtitle1"
                @click="logout"
                flat
                >Sign out</q-btn
              >
            </div>
          </template>
          <template v-else>
            <q-btn no-caps class="text-primary" @click="dialog = true" flat
              >Sign in</q-btn
            >
            <q-dialog v-model="dialog" @hide="onDialogHide">
              <q-card class="cardForm">
                <q-card-section>
                  <div class="text-h6 text-center">
                    Enter your Near account ID
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-form @submit="save" class="q-gutter-md">
                    <q-input
                      filled
                      v-model="username"
                      label="Near account username:"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    />
                  </q-form>
                </q-card-section>
                <q-card-actions class="justify-center centers">
                  <q-btn
                    @click="login"
                    label="Log in"
                    type="submit"
                    color="primary"
                  >
                  </q-btn>
                </q-card-actions>
              </q-card>
            </q-dialog>
          </template>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <RouterView />
      </q-page-container>
    </q-layout>
  </div>
</template>



<script>
import SocketService from "./components/socketService";
import { useQuasar } from "quasar";

// NAVBAR
import "near-api-js/dist/near-api-js.min.js";
const { connect, keyStores, WalletConnection } = window.nearApi;
const keyStore = new keyStores.BrowserLocalStorageKeyStore();

const config = {
  networkId: "testnet",
  keyStore,
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

let near;
let wallet;
let account;
let subAccounts = [];
// NAVBAR

export default {
  name: "App",
  computed: {},
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
    };
  },
  created() {
    SocketService.setupSocketConnection();
    this.initialize();
  },
  mounted() {
    this.emitter.on("getAccount", async (name) => {
      console.log("get account: ", name);

      this.emitter.emit("sendAccount", account);
    });

    this.emitter.on("getSubAccount", async (name) => {
      console.log("get sub account: ", name);
      let subAccount = await this.loadSubAccount(name);
      console.log("subAccount Retrieved", subAccount);
      this.emitter.emit("sendAccount", subAccount);
    });

    this.emitter.on("createSubAccount", async (name) => {
      console.log("create sub account: ", name);
      await this.createSubAccount(name);
      console.log("subAccounts", subAccounts);
    });

    this.emitter.on("deploy", async (data) => {
      console.log(data);
      this.deployContract(data.binary, data.subAccountID);
    });
  },
  data: () => ({
    username: "",
    btnLoginLoading: false,
    btnLoginLoading: false,
    dialog: false,
    drawer: null,
    user: {},
    btnLoginLoading: false,
    isAuthenticated: false,
    nearAddress: "",
    snackbar: false,
    timeout: 2000,
    snackbarText: "",
    snackbarColor: "",
  }),
  methods: {
    onDialogHide() {
      this.dialog = false;
    },
    navigateTo(route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch((error) => {});
      }
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    async login() {
      this.btnLoginLoading = true;
      wallet.requestSignIn(this.username, "Near Playground");
    },
    async logout() {
      localStorage.clear();

      await wallet.signOut();
      this.isAuthenticated = false;

      this.showNotification("Logout sucessfull", "positive");
    },
    handleCurrentUser() {},
    async initialize() {
      try {
        near = await connect(config);
        wallet = new WalletConnection(near);

        if (wallet.isSignedIn()) {
          account = wallet.account();
          let state = await account.state();
          console.log("state: ", state);
          account.createAndDeployContract;

          this.nearAddress = account.accountId;
          this.showNotification(
            `Welcome back ${account.accountId}`,
            "positive"
          );
          this.username = account.accountId;
          this.isAuthenticated = true;

          let query = {
            param: [],
          };
          this.$router.replace({
            query: query,
          });
          this.emitter.emit("sendAccount", account);
        } else {
          console.log("is signed in ?", wallet.isSignedIn());
          this.setAccount({});
          this.isAuthenticated = false;
        }
      } catch (error) {
        console.log("error while signing in: ", error);
      }
    },
    openLink(url) {
      window.open(url, "_blank");
    },
  },
};
</script>

<style scoped>
.cardForm {
  width: 70vw;
  height: 40vh;
}

.t-bar {
  z-index: 1000000 !important;
}
</style>