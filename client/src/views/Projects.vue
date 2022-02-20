<template>
  <v-data-table
    :headers="headers"
    :items="rows"
    sort-by="name"
    class="elevation-2 mt-8"
    :key="$route.fullPath"
  >
    <template v-slot:top>
      <v-toolbar flat color="dark">
        <v-toolbar-title>Contracts</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="400px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
              :disabled="btnLoading"
              :loading="btnLoading"
              >New Contract</v-btn
            >
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row v-for="(value, key) in editedItem" v-bind:key="key">
                  <v-col cols="12" sm="6" md="8">
                    <v-text-field
                      v-model="editedItem[key]"
                      :label="key"
                      v-if="key !== 'id' && key !== 'type'"
                    ></v-text-field>
                    <v-select
                      v-else-if="key === 'type'"
                      v-model="editedItem[key]"
                      :items="projectTypes"
                      label="Contract type"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-btn icon color="success" class="" @click="viewProject(item)">
        <v-icon small>mdi-eye</v-icon>
      </v-btn>
      <v-btn
        icon
        color="red"
        class="ml-2"
        :disabled="btnDelete"
        :loading="btnDelete"
        @click="deleteItem(item)"
      >
        <v-icon small color="red">mdi-delete</v-icon>
      </v-btn>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
  </v-data-table>
</template>



<script>
import * as nearAPI from "near-api-js";
import { v4 as uuidv4 } from "uuid";
import actions from "../components/actions";

import { bus } from "../main";
export default {
  name: "Contracts",
  data: () => ({
    dialog: false,
    btnDelete: false,
    btnLoading: false,
    tableKey: "key",
    contract: {},
    account: {},
    projectTypes: ["Rust", "AssemblyScript"],
    headers: [
      { text: "ID", value: "id" },
      { text: "Contract name", value: "name" },
      { text: "Type", value: "type" },
      { text: "Contract owner", value: "owner" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    rows: [],
    editedIndex: -1,
    editedItem: {
      id: "",
      name: "",
      type: "",
    },
    defaultItem: {
      id: "",
      name: "",
      type: "",
    },
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
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
  },
  methods: {
    async initialize() {
      this.contract = new nearAPI.Contract(
        this.account,
        "c8.nino1993.testnet",
        {
          viewMethods: ["getContracts"],
          changeMethods: ["removeContract", "addContract"],
          sender: this.account,
        }
      );

      try {
        let contracts = await this.contract.getContracts({
          accountId: this.account.accountId,
        });
        console.log("contracts found: ", contracts);
        if (contracts.length > 0) {
          // this.row = null
          this.rows = [];
          this.rows.push(...contracts);
          setTimeout(() => {
            this.tableKey = "newdddddd";
          }, 5000);
          console.log("rows: ", this.rows);
        }
      } catch (error) {
        console.log(`error: ${error}`);
      }
    },
    editItem(item) {
      this.editedIndex = this.rows.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async deleteItem(item) {
      const index = this.rows.indexOf(item);
      this.btnDelete = true;
      confirm("Are you sure you want to delete this contract?") &&
        (await this.contract.removeContract({ id: item.id }));
      let data = { contract: item };
      actions.deleteProjectDirectory(data);
      this.rows.splice(index, 1);
      let params = ["Contract deleted successfuly", "success", 3000];
      this.sendNotification(params);
      this.btnDelete = false;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    async save() {
      let item = JSON.parse(JSON.stringify(this.editedItem));
      item.id = uuidv4();
      item.owner = this.account.accountId;
      this.btnLoading = true;
      this.close();

      try {
        await this.contract
          .addContract({ id: item.id, name: item.name, type: item.type })
          .then(async (res) => {
            console.log(res);
            let data = { contract: item };
            await actions.createProjectDirectory(data).then((res) => {
              if (res) {
                let params = ["Project created successfuly", "success", 3000];
                this.sendNotification(params);
              } else {
                let params = [
                  "Failed to create project directory",
                  "red",
                  3000,
                ];
                this.sendNotification(params);
              }
            });
            this.rows.push(item);
            let params = ["Project created successfuly", "success", 3000];
            this.sendNotification(params);
          });
        this.btnLoading = false;
      } catch (error) {
        let params = ["Failed to add project", "red", 3000];
        this.sendNotification(params);

        this.btnLoading = false;
      }
    },
    async viewProject(item) {
      let route = "project";
      await this.$store.commit("setContract", item);
      this.$route.params.projectName = item.name;
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch((error) => {
          //  console.log(error);
        });
      }
    },
    sendNotification(params) {
      bus.$emit("showNotification", params);
    },
  },
};
</script>