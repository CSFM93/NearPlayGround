<template>
  <div>
    <div class="q-mx-xl">
      <div class="q-mt-xl">
        <div class="row">
          <div class="col-5 q-pt-xl">
            <p style="" class="text-h4">
              Near Smart Contracts development in your browser
            </p>
            <p style="font-size: 1.3em" class="q-mt-md">
              Write, test, compile, deploy, and call your Smart Contracts in any
              computer with an internet connection.
            </p>
          </div>
          <div class="col">
            <iframe
              width="100%"
              style="height: 70vh; width: 100%"
              class="vid-top"
              allowfullscreen="1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="YouTube video player"
              controls
              loop
              src="https://www.youtube.com/embed/qhUrogx9YuU"
            ></iframe>
          </div>
        </div>
      </div>

      <q-separator class="q-mt-xl" />

      <div class="q-mt-xl row justify-center centers">
        <div class="col-2">
          <div class="row justify-center centers">
            <img
              class=""
              style="height: 8vw; width: 8vw"
              src="/assets/images/icons8-write-60.png"
            />
          </div>
          <p class="q-mt-md text-center">Write</p>
        </div>
        <div class="col-2">
          <div class="row justify-center centers">
            <img
              class=""
              style="height: 8vw; width: 8vw"
              src="/assets/images/icons8-experiment-64.png"
            />
          </div>
          <p class="q-mt-md text-center">Test and Compile</p>
        </div>
        <div class="col-2">
          <div class="row justify-center centers">
            <img
              class=""
              style="height: 8vw; width: 8vw"
              src="/assets/images/icons8-upload-to-cloud-64.png"
            />
          </div>
          <p class="q-mt-md text-center">Deploy and Call</p>
        </div>
      </div>

      <div class="q-mt-xl">
        <div class="q-mt-xl">
          <h5 class="q-mt-2 text-center">
            Write Smart contracts using Rust or AssemblyScript with our starter
            templates.
          </h5>
        </div>
        <div class="q-mt-md">
          <div class="row justify-center centers">
            <img
              class="img-border"
              style="height: 40vw; width: 80vw"
              src="/assets/images/write.png"
            />
          </div>
        </div>
      </div>

      <div class="q-mt-xl">
        <div class="q-mt-xl">
          <h5 class="q-mt-xl text-center">
            Run your unit tests and compile the contract.
          </h5>
        </div>
        <div class="q-mt-md">
          <div class="row justify-center centers">
            <img
              class="img-border"
              style="height: 40vw; width: 80vw"
              src="/assets/images/test.png"
            />
          </div>
        </div>
      </div>

      <div class="q-mt-xl q-mb-xl">
        <div class="q-mt-xl">
          <h5 class="q-mt-xl text-center">
            Deploy the contract to your account and call it's functions.
          </h5>
        </div>
        <div class="q-mt-md">
          <div class="row justify-center centers">
            <img
              class="img-border"
              style="height: 40vw; width: 80vw"
                src="/assets/images/call.png"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
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
        this.emitter.emit("showNotification", [
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