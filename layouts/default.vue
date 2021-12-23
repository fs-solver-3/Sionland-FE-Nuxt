<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :clipped="clipped" fixed app>
      <v-list class="mx-auto img-center">
        <v-list-item>
          <v-list-item-content class="title text-center">
            <v-list-item-title>User Profile</v-list-item-title>
            <br />
            <v-list-item-subtitle>
              {{ $store.state.userInfo.name }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              {{ $store.state.userInfo.email }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              {{ $store.state.userInfo.userAddress }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <br />

      <v-row align="center" justify="space-around" rounded>
        <span style="color: black">
          Sion Tokens : {{ $store.state.userInfo.balance }}
        </span>
      </v-row>

      <br />
      <v-divider></v-divider>
      <br />

      <v-row align="center" justify="space-around" rounded>
        <span style="color: black"
          >Lands : {{ $store.state.userInfo.lands.length }}
        </span>
      </v-row>

      <br />
      <v-divider></v-divider>
      <br />

      <v-row align="center" justify="space-around" rounded>
        <span style="color: black">
          {{ $store.state.userInfo.lands }}
        </span>
      </v-row>

      <br />
      <v-divider></v-divider>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-row class="mt-4" align="center" justify="space-around" rounded>
        <v-btn color="red darken-4" elevation="9" rounded>
          log out
          <v-icon right> mdi-export </v-icon>
        </v-btn>
      </v-row>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-img src="/icon.png" max-height="60" max-width="90" contain></v-img>

      <v-spacer />
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <div v-show="!loged" color="blue">
            <v-btn color="blue" @click="loginMetaMask">
              <v-icon>mdi-wallet</v-icon>
              Connect
            </v-btn>
          </div>

          <div v-show="loged" v-bind="attrs" v-on="on">
            {{ clientAdress }}
            <v-avatar>
              <v-icon> mdi-account-circle </v-icon>
            </v-avatar>
          </div>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>LogOut</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
      <v-dialog v-model="dialogLogin" persistent max-width="400px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Login</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="userData.name"
                    label="Name"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Email"
                    v-model="userData.email"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="login()">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import { getBalance, getLandsBatch, marketPlaceEvents } from "../utils/web3";
export default {
  data() {
    return {
      dialogLogin: true,
      userData: {
        userAddress: "",
        name: "",
        email: "",
        balance: 0,
        lands: []
      },
      clipped: false,
      clientAdress: "",
      loged: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Sion Lands",
          to: "/lands"
        },
        {
          icon: "mdi-chart-bubble",
          title: "Air Ballons",
          to: "/airBallons"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Vuetify.js"
    };
  },
  async mounted(){
    let dir;
    let ctx = this;
    marketPlaceEvents();
    if (window.ethereum.selectedAddress == undefined) {
      this.loged = false;
    } else {
      dir = window.ethereum.selectedAddress;
      this.userData.userAddress = dir;
      this.userData.balance = await getBalance(dir);
      this.userData.lands = await getLandsBatch(dir);
      this.$store.commit("UPDATE_USERINFO", this.userData);
      this.clientAdress = dir.slice(0, 5) + ".." + dir.slice(-3);
      this.loged = true;
    }
    window.ethereum.on("accountsChanged", function(accounts) {
      if (accounts[0] == undefined) {
        ctx.loged = false;
      } else {
        dir = accounts[0];
        if(this.userData){
          this.userData.balance = getBalance(dir);
          this.userData.lands = getLandsBatch(dir);
          this.$store.commit("UPDATE_USERINFO", this.userData);
        }
        ctx.clientAdress = dir.slice(0, 5) + ".." + dir.slice(-3);
        ctx.loged = true;
      }
    });
  },
  computed: {
  //   ...mapGetters("userInfo", ["userAddress"])
  },
  methods: {
    async loginMetaMask() {
      try {
        if (typeof window.ethereum === "undefined")
          alert("MetaMask not installed  :(");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        let dir = window.ethereum.selectedAddress;
        this.clientAdress = dir.slice(0, 5) + ".." + dir.slice(-3);
        this.userData.userAddress = dir;
        this.userData.balance = await getBalance(dir);

        this.userData.lands = await getLandsBatch(dir);
        this.$store.commit("UPDATE_USERINFO", this.userData);
        //this.dialogLogin = true

        this.loged = true;
      } catch (error) {
        console.log(error);
        this.loged = false;
      }
    },
    async login() {          
      this.dialogLogin = false;
    }
  }
};
</script>
