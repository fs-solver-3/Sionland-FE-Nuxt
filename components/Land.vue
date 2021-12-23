<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      {{ item.hexID }}
    </v-card-title>
    
    <v-card-text>
      <v-row align="center">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>{{
              item.infoWeather.weather[0].description
            }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-col class="text-h3"> {{ item.infoWeather.main.temp }}&deg;C </v-col>
        <v-col>
          <v-list-item>
            <v-list-item-icon>
              <v-icon
                >mdi-arrow-up-bold mdi-rotate-{{
                  wintdeg(item.infoWeather.wind.deg)
                }}</v-icon
              >
            </v-list-item-icon>
            <v-list-item-subtitle
              >{{
                item.infoWeather.wind.speed * 3.6
              }}
              km/h</v-list-item-subtitle
            >
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-water</v-icon>
            </v-list-item-icon>
            <v-list-item-subtitle
              >{{ item.infoWeather.main.humidity }}%</v-list-item-subtitle
            >
          </v-list-item>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text>
      <p>Coordinates :</p>
      <div class="text--primary">
        Lng: {{ item.coordinates[1] }}
        <br />
        Lat: {{ item.coordinates[0] }}
      </div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn
        class="mx-2"
        fab
        dark
        small
        color="blue"
        :href="item.googleMaps"
        target="_blank"
      >
        <v-icon> mdi-google-maps </v-icon>
      </v-btn>
      <v-btn
        class="mx-2"
        fab
        dark
        small
        color="blue"
        :href="item.mapWaze"
        target="_blank"
      >
        <v-icon> mdi-waze </v-icon>
      </v-btn>
      <!--<v-btn class="mx-2" fab dark small color="blue" @click="getWeather(item)">
        <v-icon> mdi-weather-partly-rainy </v-icon>
      </v-btn>-->
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    item: {},
  },
  methods: {
    wintdeg(deg) {
      let arr = [0, 45, 90, 135, 180, 225, 270, 315];
      return arr[Math.round((deg % 360) / 45)];
    },
    async getWeather(land) {
      land.showWeather = !land.showWeather;
      //actualizar en store
      let infoWeather = await this.$axios.$get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${land.coordinates[1]}&lon=${land.coordinates[0]}&appid=704e6c6ad29a17b1a787bd035c725346&units=metric`
      );
    },
  },
};
</script>

<style>
</style>
