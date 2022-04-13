<template>
  <div>
    <v-app-bar app color="dark" class="tbar" flat>
      <v-toolbar-title
        @click="navigateTo('home')"
        class="primary--text "
        style="cursor: pointer"
        >Near Playground</v-toolbar-title
      >
      <v-spacer></v-spacer>

      <div class="">
        <template v-if="isAuthenticated">
          <v-row>
            <h4 class="mt-1 mr-5">{{ nearAddress }}</h4>
            <v-btn
              class="mr-5 text-color-primary"
              text
              color="primary"
              @click="navigateTo('projects')"
              >Projects</v-btn
            >
            <v-btn @click="logout" text color="error">Sign out</v-btn>
          </v-row>
        </template>
        <template v-else>
          <v-dialog v-model="dialog" max-width="400px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on"
                >Sign in</v-btn
              >
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Sign in</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="8">
                      <v-text-field
                        v-model="username"
                        label="Near account username:"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDialog"
                  >Cancel</v-btn
                >
                <v-btn
                  @click="login"
                  color="primary"
                  :disabled="btnLoginLoading"
                  :loading="btnLoginLoading"
                  >Sign in</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </div>
    </v-app-bar>
  </div>
</template>

<script>

import * as nearAPI from "near-api-js";
console.log(nearAPI)

const { connect, keyStores, WalletConnection, KeyPair, utils } = nearAPI;
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

export default {
  components: {},
  computed: {},
  created() {
    this.initialize();
    this.emitter.on("getAccount", (data) => {
      console.log("get account", account);
      this.emitter.emit("sendAccount", account);
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
    navigateTo(route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch((error) => {
          //  console.log(error);
        });
      }
    },
    async setAccount(value) {
      await this.$store.commit("setAccount", value);
      //   console.log("account", this.$store.state.account);
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    async login() {
      console.log("login", this.username);
      this.btnLoginLoading = true;
      wallet.requestSignIn(this.username, "Near Playground");
    },
    async logout() {
      localStorage.clear();

      console.log("clearing");
      await wallet.signOut();
      console.log(wallet.isSignedIn());
      this.isAuthenticated = false;
      this.setAccount({});
      this.showNotification(["Logout sucessfull", "success", 3000]);
    },
    handleCurrentUser() {
      //   const user = Moralis.User.current();
      //   this.nearAddress = user.get("nearAddress");
      //   if (user) {
      //     this.setUser(user);
      //   }
    },
    async initialize() {
      try {
        near = await connect(config);
        wallet = new WalletConnection(near);

        if (wallet.isSignedIn()) {
          account = wallet.account();

          // let res = await account.deployContract().
          

          let keys = await account.getAccessKeys();
          this.nearAddress = account.accountId;
          this.showNotification([
            `Welcome back ${account.accountId}`,
            "success",
            3000,
          ]);
          this.username = account.accountId;

          this.setAccount(account);
          this.isAuthenticated = true;

          let query = {
            param: [],
          };
          this.$router.replace({
            query: query,
          });
          // console.log(this.$router);
          this.emitter.emit("sendAccount", account);

          
        } else {
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
    showNotification(data) {
      this.snackbarText = data[0];
      this.snackbarColor = data[1];
      this.timeout = data[2];
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.v-main {
  padding: 0px !important;
}

.tbar{
  z-index: 1000000 !important;
}

.container {
  padding-top: 35px !important;
  width: 100vw !important;
}
</style>