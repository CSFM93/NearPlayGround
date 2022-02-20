<template>
  <v-container>
    <div height="400px" class="mt-10">
      <v-row class="mx-10">
        <v-col cols="4 mt-16">
          <p style="" class="text-h4">
            Near Smart Contracts development in your browser
          </p>
          <p style="" class="text-h7 mt-4">
            Write, test, compile, deploy, and call your Smart Contracts in any
            computer with an internet connection.
          </p>
        </v-col>
        <v-col cols="8">
          <iframe
            height="450px"
            width="100%"
            class="vid-top"
            allowfullscreen="1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="YouTube video player"
            controls
            loop
            src="https://www.youtube.com/embed/qhUrogx9YuU"
          ></iframe>
        </v-col>
      </v-row>
    </div>

    <v-divider class="mt-5"></v-divider>
    <v-row class="mt-5 centerRow">
      <v-col cols="3" class="">
        <div class="">
          <img
            class="ml-10"
            height="100"
            width="100"
            src="/assets/images/icons8-write-60.png"
          />
          <h3 class="mt-3 ml-16">Write</h3>
        </div>
      </v-col>
      <v-col cols="3" class="">
        <div class="">
          <img
            class="ml-10"
            height="100"
            width="100"
            src="/assets/images/icons8-experiment-64.png"
          />
          <h3 class="mt-3 ml-6">Test and Compile</h3>
        </div>
      </v-col>
      <v-col cols="3" class="">
        <div class="">
          <img
            class="ml-10"
            height="100"
            width="100"
            src="/assets/images/icons8-upload-to-cloud-64.png"
          />
          <h3 class="mt-3 ml-6">Deploy and Call</h3>
        </div>
      </v-col>
    </v-row>

    <div class="mt-16">
      <v-row class="mt-16">
        <v-col cols="12">
          <h3 class="mt-2 text-center">
            Write Smart contracts using Rust or AssemblyScript with our starter
            templates.
          </h3>
        </v-col>
      </v-row>
      <v-row class="mt-3" height="500px">
        <v-col cols="12" class="img-border">
          <div class="">
            <img
              class=""
              height="100%"
              width="100%"
              src="/assets/images/write.png"
            />
          </div>
        </v-col>
      </v-row>
    </div>

    <div class="mt-16">
      <v-row class="mt-16">
        <v-col cols="12">
          <h3 class="mt-2 text-center">
            Run your unit tests and compile the contract.
          </h3>
        </v-col>
      </v-row>
      <v-row class="mt-3" height="500px">
        <v-col cols="12" class="img-border">
          <div class="">
            <img
              class=""
              height="100%"
              width="100%"
              src="/assets/images/test.png"
            />
          </div>
        </v-col>
      </v-row>
    </div>

    <div class="mt-16">
      <v-row class="mt-16">
        <v-col cols="12">
          <h3 class="mt-2 text-center">
            Deploy the contract to your account and call it's functions.
          </h3>
        </v-col>
      </v-row>
      <v-row class="mt-3" height="500px">
        <v-col cols="12" class="img-border">
          <div class="">
            <img
              class=""
              height="100%"
              width="100%"
              src="/assets/images/call.png"
            />
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { bus } from "../main";

export default {
  data: () => ({}),
  methods: {
    async navigateTo(route) {
      //  console.log("route");
      let user = await this.$store.state.user;
      //  console.log("user", Object.keys(user).length > 0);
      if (Object.keys(user).length > 0) {
        if (this.$route.name !== route) {
          this.$router.push({ name: route }).catch((error) => {
            //  console.log(error);
          });
        }
      } else {
        bus.$emit("showNotification", [
          "Please use your ethereum account to signin first (Kovan Network only)",
          "red",
          5000,
        ]);
      }
    },
    openSampleSheet() {
      let value =
        "https://docs.google.com/spreadsheets/d/1UGgITdAYQy_xXUaPgsFAYBj2ppH0gjGav25oMaW-6Z8/edit?usp=sharing";
      window.open(value, "_blank");
    },
    showNotification(text, color, timeout) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.timeout = timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.auth {
  min-height: 300;
}

.col-3 {
  border-right: 0px !important;
}

.cols-12 {
  padding: 0px !important;
}

.img-border {
  border: 0.1px #2d2d2d solid;
}

.centerRow {
  padding-left: 20vw;
}
</style>