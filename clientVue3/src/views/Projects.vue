<template>
  <div class="q-mx-md">
    <q-table
      title="Contracts"
      dense
      class="q-mt-lg"
      :rows="rows"
      :columns="columns"
      row-key="name"
    >
      <template v-slot:top class="">
        <div class="col-2 q-table__title q-my-lg">Contracts</div>

        <q-space />
        <q-btn
          class="q-my-lg"
          color="primary"
          label="New Contract"
          :disable="btnLoading"
          :loading="btnLoading"
          @click="openDialog"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            color="green"
            icon="visibility"
            @click="viewProject(props.row)"
          />
          <q-btn
            flat
            color="red"
            icon="delete"
            :disabled="btnDelete"
            :loading="btnDelete"
            @click="deleteItem(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="dialog" @hide="onDialogHide">
      <q-card class="cardForm" style="height: 60vh; width: 50vw">
        <q-card-section>
          <div class="text-h6 text-center">New contract</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="save" class="q-gutter-md">
            <q-input
              filled
              v-model="editedItem.name"
              label="Contract name"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
            <q-select
              outlined
              v-model="editedItem.type"
              label="Contract Type"
              :options="projectTypes"
            />
          </q-form>
        </q-card-section>
        <q-card-actions class="row justify-center centers">
          <q-btn @click="save" label="Save" color="primary" type="submit" />
          <q-btn
            @click="close"
            label="Cancel"
            color="primary"
            class="q-ml-xl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>



<script>
import { v4 as uuidv4 } from "uuid";
import actions from "../components/actions";
import { useQuasar } from "quasar";

import { ref } from "vue";

import { useContractStore } from "@/stores/contract";
import socketService from "../components/socketService";

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
    columns: [
      {
        name: "ID",
        align: "left",
        label: "ID",
        field: (row) => row.id,
        sortable: true,
      },

      {
        name: "name",
        align: "left",
        label: "Contract name",
        field: (row) => row.name,
        sortable: true,
      },
      {
        name: "type",
        align: "left",
        label: "Type",
        field: (row) => row.type,
        sortable: true,
      },
      {
        name: "owner",
        align: "left",
        label: "Contract owner",
        field: (row) => row.owner,
        sortable: true,
      },
      {
        name: "actions",
        align: "center",
        label: "Actions",
        field: (row) => row.id,
        sortable: false,
      },
    ],
    rows: [],
    editedIndex: -1,
    editedItem: {
      id: "",
      name: "a31.csfm1993.testnet",
      type: "Rust",
    },
    defaultItem: {
      id: "",
      name: "a31.csfm1993.testnet",
      type: "Rust",
    },
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
  },
  setup() {
    const $q = useQuasar();
    const contractStore = useContractStore();

    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
      contractStore,
    };
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  mounted() {
    this.emitter.emit("getAccount");
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
  },
  methods: {
    onDialogHide() {
      this.dialog = false;
    },
    openDialog() {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
    },
    async initialize() {
      socketService.socket.on("log", (data) => {
        console.log("log", JSON.stringify(data, null, 2));
      });
      try {
        let data = { accountId: this.account.accountId };
        let contracts = await actions.getContracts(data);
        console.log("contracts found: ", contracts);
        if (contracts.length > 0) {
          this.rows = [];
          this.rows.push(...contracts);
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
      console.log("delete: ", item.id);
      const index = this.rows.indexOf(item);
      this.btnDelete = true;
      confirm("Are you sure you want to delete this contract?") &&
        (await actions.removeContract({
          contractId: item.id,
          accountId: this.account.accountId,
        }));
      let data = { contract: item };
      actions.deleteProjectDirectory(data);
      this.rows.splice(index, 1);
      this.showNotification("Contract deleted successfully", "positive");
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
      console.table(item);

      try {
        let data = { accountId: this.account.accountId, contract: item };
        await actions.addContract(data).then(async (res) => {
          console.log(res);
          let data = { contract: item };

          await actions.createProjectDirectory(data).then((res) => {
            if (res) {
              this.showNotification("Project created successfully", "positive");
            } else {
              this.showNotification(
                "Failed to create project directory",
                "negative"
              );
            }
          });
          this.rows.push(item);
        });
        this.btnLoading = false;
      } catch (error) {
        this.showNotification("Failed to add project", "negative");
        this.btnLoading = false;
      }
    },
    async viewProject(item) {
      let route = "contract";

      await this.contractStore.setContract(item);
      this.$route.params.contractId = item.id;
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch((error) => {});
      }
    },
  },
};
</script>