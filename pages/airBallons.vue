<template>
  <v-container>
    <v-row>
      <v-col v-for="(item, index) in $store.state.userInfo.lands" :key="index">
        <Land :item="item" />
      </v-col>
    </v-row>
    <br />
    <v-row>
      <v-select
        v-model="hexStart"
        @change="getOrigin"
        :items="$store.state.userInfo.lands.map((l) => l.hexID)"
        label="Select land"
        dense
        solo
      ></v-select>
      <v-btn color="blue" @click="loadRoute()"> Go </v-btn>
    </v-row>
    
    <v-row>
      <v-container id="map" fluid fill-heigh style="height: 700px" />
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    hexStart: "",
    hexEnd: "",
    map: {},
    route: {},
    point: {},
    counter: 0,
    steps: 100,
    origin: [-77.032, 38.913],
    destination: [-77.032, 38.913],
    continue: false,
  }),
  methods: {
    async prueba() {},
    getOrigin() {
      const hexO = this.$store.state.userInfo.lands.filter(
        (l) => l.hexID == this.hexStart
      );
      this.origin = hexO[0].coordinates;
    },
    async evalueData() {
      let infoWeather = await this.$axios.$get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${this.origin[1]}&lon=${this.origin[0]}&appid=704e6c6ad29a17b1a787bd035c725346&units=metric`
      );
      let destination = turf.destination(
        this.origin,
        100,
        infoWeather.wind.deg - 360
      );
      this.continue = infoWeather.wind.speed * 3.6 <= 20;
      if (this.continue) {
        this.map.flyTo({
          center: this.origin,
          zoom: 7,
          speed: 1.8,
        });
        this.destination = destination.geometry.coordinates;
      } else {
        alert("crash");
        this.continue = false;
      }
    },
    buildRoute() {
      // Calculate the distance in kilometers between route start/end point.
      const lineDistance = turf.length(this.route.features[0]);

      const arc = [];

      // Number of steps to use in the arc and animation, more steps means
      // a smoother arc and animation, but too many steps will result in a
      // low frame rate

      const canth = lineDistance / 20; // velocidad
      // Draw an arc between the `origin` & `destination` of the two points
      for (let i = 0; i < lineDistance; i += lineDistance / this.steps) {
        const segment = turf.along(this.route.features[0], i, {
          units: "kilometers",
        });
        arc.push(segment.geometry.coordinates);
      }
      return arc;
    },
    async loadRoute() {
      this.counter = 0;
      await this.evalueData();
      if (this.continue) {
        this.point.features[0].geometry.coordinates = this.origin;
        this.map.getSource("point").setData(this.point);
        this.map.setLayoutProperty("point", "visibility", "visible");
        this.route.features[0].geometry.coordinates = [
          this.origin,
          this.destination,
        ];

        this.route.features[0].geometry.coordinates = this.buildRoute();
        this.map.getSource("route").setData(this.route);

        this.animate();
      } 
    },

    animate() {
      const start =
        this.route.features[0].geometry.coordinates[
          this.counter >= this.steps ? this.counter - 1 : this.counter
        ];
      const end =
        this.route.features[0].geometry.coordinates[
          this.counter >= this.steps ? this.counter : this.counter + 1
        ];
      if (!end) {
        this.origin = this.destination;
        this.loadRoute();
      }
      // error
      if (this.counter >= this.steps) {
        this.origin = this.destination;
        this.loadRoute();
      } else {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc
        this.point.features[0].geometry.coordinates =
          this.route.features[0].geometry.coordinates[this.counter];

        // Calculate the bearing to ensure the icon is rotated to match the route arc
        // The bearing is calculated between the current point and the next point, except
        // at the end of the arc, which uses the previous point and the current point
        this.point.features[0].properties.bearing = turf.bearing(
          turf.point(start),
          turf.point(end)
        );

        // Update the source with this new data
        this.map.getSource("point").setData(this.point);

        // Request the next frame of animation as long as the end has not been reached
        if (this.counter < this.steps) {
          requestAnimationFrame(this.animate);
        }
        this.counter = this.counter + 1;
      }
    },
  },
  mounted() {
    const mapboxgl = require("mapbox-gl");
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic3Rvcm1ibGF4IiwiYSI6ImNrb2Z6a2F3bzBib3gyb3BucDV5eG1maXoifQ.BgKgtZQJa5m1xOXGNuJfjw";
    this.map = new mapboxgl.Map({
      container: "map",
      center: [0, 0],
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: 1,
    });
    // A simple line from origin to destination.
    this.route = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      ],
    };

    // A single point that animates along the route.
    // Coordinates are initially set to origin.
    this.point = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [],
          },
        },
      ],
    };

    this.map.on("load", () => {
      // Add a source and layer displaying a point which will be animated in a circle.
      this.map.addSource("route", {
        type: "geojson",
        data: this.route,
      });

      this.map.addSource("point", {
        type: "geojson",
        data: this.point,
      });

      this.map.addLayer({
        id: "route",
        source: "route",
        type: "line",
        paint: {
          "line-width": 2,
          "line-color": "#007cbf",
        },
      });

      this.map.addLayer({
        id: "point",
        source: "point",
        type: "symbol",
        layout: {
          // This icon is a part of the Mapbox Streets style.
          // To view all images available in a Mapbox style, open
          // the style in Mapbox Studio and click the "Images" tab.
          // To add a new image to the style at runtime see
          // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
          "icon-image": "airport-15",
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          visibility: "none",
        },
      });
    });
  },
};
</script>

<style>
</style>

