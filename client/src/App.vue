<template>
  <v-app>
    <component v-bind:is="layout">
      <router-view></router-view>
    </component>
  </v-app>
</template>



<script>
import SocketService from './components/socketService';

export default {
  name: "Home",
  computed: {
    layout() {
      //  console.log("meta", this.$route.meta.layout);
      return this.$route.meta.layout;
    },
  },
  created() {
    this.$vuetify.theme.dark = true;
    SocketService.setupSocketConnection()
    console.log('Base url: ',process.env.VUE_APP_BASE_URL)
    
  },
  methods: {
   
  },
};
</script>