<template>
  <v-container>
    <v-container id="map" fluid fill-heigh style="height: 700px" />
    <br />
    <br />
    <v-row>
      <v-col v-if="multipleList.length > 0">
        <v-card class="mx-auto" width="300">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h5">Order recap</v-list-item-title>
              <v-list-item-subtitle
                >Lands Seleted: {{ multipleList.length }}</v-list-item-subtitle
              >
              <v-list-item-subtitle class="text--primary"
                >Total: ${{ multipleList.length }}</v-list-item-subtitle
              >
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text></v-list-item-action-text>

              <v-btn color="blue" @click="buylands"> Buy </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="(item, index) in multipleList" :key="index">
        <Land :item="item" />
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import geojson2h3 from "geojson2h3";
import { buyLandsRequest, getBalance, getLandsBatch } from "../utils/web3";
import { mapGetters, mapActions } from 'vuex'
// import  store  from '../store'
export default {
  data: () => ({
    userData: {
        userAddress: "",
        name: "",
        email: "",
        balance: 0,
        lands: []
      },
    dialogWaze: false,
    geoData: {},
    dataHex: {},
    multi: false,
    prueba: "k",
    reveal: false,
    area: "",
    location: "",
    multipleList: [],
    showWeather: false,
  }),
  // computed: {
  //   ...mapGetters(['getUser', 'getUserBalance']),
  // },
  methods: {
    loginBinance() {
      window.BinanceChain.request({ method: "eth_accounts" });
    },
    async buylands() {
      let walletAddress = this.$store.state.userInfo.userAddress;
      let buyLandsIds = [];
      if (this.multipleList) {
        for ( let i=0; i<this.multipleList.length; i++)
        {
          buyLandsIds[i] = this.multipleList[i].hexID;
        }
      }
      await buyLandsRequest(walletAddress, buyLandsIds);
      this.userData.userAddress = walletAddress;
      this.userData.balance = await getBalance(walletAddress);
      this.userData.lands = await getLandsBatch(walletAddress);
      this.$store.commit("UPDATE_USERINFO", this.userData);
    },
  },
  mounted() {
    var ctx = this;
    var geo = navigator.geolocation;
    geo.getCurrentPosition((pos) => {
      console.log(pos);
    });
    const mapboxgl = require("mapbox-gl");
    const h3 = require("h3-js");
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic3Rvcm1ibGF4IiwiYSI6ImNrb2Z6a2F3bzBib3gyb3BucDV5eG1maXoifQ.BgKgtZQJa5m1xOXGNuJfjw";
    var map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 1,
    });
    var view3D = true;

    /* Given a query in the form "lng, lat" or "lat, lng"
     * returns the matching geographic coordinate(s)
     * as search results in carmen geojson format,
     * https://github.com/mapbox/carmen/blob/master/carmen-geojson.md */
    const coordinatesGeocoder = function (query) {
      // Match anything which looks like
      // decimal degrees coordinate pair.
      const matches = query.match(
        /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
      );
      if (!matches) {
        return null;
      }

      function coordinateFeature(lng, lat) {
        return {
          center: [lng, lat],
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          place_name: "Lat: " + lat + " Lng: " + lng,
          place_type: ["coordinate"],
          properties: {},
          type: "Feature",
        };
      }

      const coord1 = Number(matches[1]);
      const coord2 = Number(matches[2]);
      const geocodes = [];

      if (coord1 < -90 || coord1 > 90) {
        // must be lng, lat
        geocodes.push(coordinateFeature(coord1, coord2));
      }

      if (coord2 < -90 || coord2 > 90) {
        // must be lat, lng
        geocodes.push(coordinateFeature(coord2, coord1));
      }

      if (geocodes.length === 0) {
        // else could be either lng, lat or lat, lng
        geocodes.push(coordinateFeature(coord1, coord2));
        geocodes.push(coordinateFeature(coord2, coord1));
      }

      return geocodes;
    };

    // Add the control to the map.
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: coordinatesGeocoder,
        placeholder: "Try: -40, 170",
        marker: false,
        reverseGeocode: true,
        zoom: 18,
      })
    );
    var searchControl = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: false,
    });

    class MultiControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl";
        this._btn = document.createElement("button");
        this._btn.className = "multi mapboxgl-ctrl-geocoder--input";
        this._btn.type = "button";
        this._btn.id = "idmulti";
        this._btn.textContent = "Multiselect";
        this._btn.onclick = function () {
          ctx.multi = !ctx.multi;
        };
        this._container.appendChild(this._btn);
        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    class View3DControl {
      onAdd(map) {
        this._map = map;
        let _this = this;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        this._btn = document.createElement("button");
        this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d";
        this._btn.type = "button";
        this._btn.id = "view3D";
        this._btn.onclick = function () {
          if (view3D) {
            map.setPitch(45);
            _this._btn.className =
              "mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-2d";
          } else {
            map.setPitch(0);
            _this._btn.className =
              "mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d";
          }
          view3D = !view3D;
        };
        this._container.appendChild(this._btn);
        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    const myCustomControl = new MultiControl();
    const myCustomControl3D = new View3DControl();

    // Add the control to the map.
    map.addControl(searchControl);
    map.addControl(myCustomControl3D);

    map.addControl(new mapboxgl.NavigationControl());
    map.on("load", function () {
      var layers = map.getStyle().layers;
      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }
      // The 'building' layer in the Mapbox Streets
      // vector tileset contains building height data
      // from OpenStreetMap.
      map.addLayer(
        {
          id: "add-3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },

        labelLayerId
      );
      searchControl.on("result", (ev) => {
        map.flyTo({
          center: [
            ev.result.geometry.coordinates[0],
            ev.result.geometry.coordinates[1],
          ],
          zoom: 18,
          speed: 1.8,
        });
      });
      map.addSource("hex", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-122.47485823276713, 37.85878356045377],
                    [-122.47504834087829, 37.86196795698972],
                    [-122.47845104316997, 37.86010614563313],
                    [-122.47485823276713, 37.85878356045377],
                  ],
                ],
              },
            },
          ],
        },
      });

      map.addLayer({
        id: "hex",
        type: "fill",
        source: "hex",
        paint: {
          "fill-outline-color": "rgba(0,0,0,0.1)",
          "fill-color": "rgba(0,0,0,0.1)",
        },
      }); // Place polygon under these labels.
      map.on("click", async function (e) {
        var clicked_hex_id = h3.geoToH3(e.lngLat["lat"], e.lngLat["lng"], 12);
        var res = await ctx.$axios.$get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat["lng"]},${e.lngLat["lat"]}.json?access_token=${mapboxgl.accessToken}`
        );
        var info = res.features[0];
        var infoWeather = await ctx.$axios.$get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${e.lngLat["lat"]}&lon=${e.lngLat["lng"]}&appid=704e6c6ad29a17b1a787bd035c725346&units=metric`
        );
        var data = {
          hexID: clicked_hex_id, // use libray h3
          coordinates: [e.lngLat["lng"],e.lngLat["lat"] ] ,
          googleMaps: `https://maps.google.com/?q=${e.lngLat["lat"]},${e.lngLat["lng"]}`,
          infoWeather: infoWeather,
          showWeather: true,
          //location: info.place_name,
          //navigateWaze: `https://www.waze.com/ul?ll=40.75889500%2C-73.98513100&navigate=yes&zoom=17`
          //mapWaze : `https://www.waze.com/ul?ll=${e.lngLat["lat"]}%2C${e.lngLat["lng"]}&navigate=yes&zoom=17`
          mapWaze: `https://waze.com/ul?ll=${e.lngLat["lat"]},{e.lngLat["lng"]}&z=10&navigate=yes`,
        };
        ctx.dataHex = data;

        if (ctx.multi) {
          let listID = ctx.multipleList.map((i) => i.hexID);
          if (listID.includes(clicked_hex_id)) {
            var i = listID.indexOf(clicked_hex_id);
            listID.splice(i, 1);
            ctx.multipleList.splice(i, 1);
          } else {
            ctx.multipleList.push(data);
            listID.push(clicked_hex_id);
          }
          focusMapMult(listID);
        } else {
          ctx.multipleList = [];
          ctx.multipleList.push(data);
          focusMap(clicked_hex_id);
        }
      });
    });
    map.on("zoom", function (e) {
      let zoom = map.getZoom();
      if (zoom > 17) {
        let elemento = document.getElementById("idmulti");
        if (!elemento) {
          map.addControl(myCustomControl);
        }
        var bounds = map.getBounds();
        let coor = [
          [bounds._sw.lng - 0.01, bounds._sw.lat - 0.01],
          [bounds._ne.lng + 0.01, bounds._sw.lat - 0.01],
          [bounds._ne.lng + 0.01, bounds._ne.lat + 0.01],
          [bounds._sw.lng - 0.01, bounds._ne.lat + 0.01],
          [bounds._sw.lng - 0.01, bounds._sw.lat - 0.01],
        ];
        let source = map.getSource("hex");
        const polygon = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coor],
          },
        };

        const hexagons = geojson2h3.featureToH3Set(polygon, 12);
        // -> ['8a2830855047fff', '8a2830855077fff', '8a283085505ffff', '8a283085506ffff']
        var geodata = geojson2h3.h3SetToMultiPolygonFeature(hexagons);
        // -> {type: 'Feature', properties: {}, geometry: {type: 'Polygon', coordinates: [...]}}
        source.setData(geodata);
        map.setLayoutProperty("hex", "visibility", "visible");
      } else {
        map.setLayoutProperty("hex", "visibility", "none");
      }
    });
    function focusMap(hex_id) {
      // Hex to geo
      let hexCenterCoordinates = h3.h3ToGeo(hex_id);
      // Move map focus
      map.flyTo({
        center: [hexCenterCoordinates[1], hexCenterCoordinates[0]],
        zoom: 18,
        speed: 1.8,
      });
      // Plot graphic point into map
      let singleHexGeojson = geojson2h3.h3ToFeature(hex_id);

      const selected_sourceId = "h3-hexes_selected";
      const selected_layerId = `${selected_sourceId}-layer`;
      let selected_source = map.getSource(selected_sourceId);
      if (!selected_source) {
        map.addSource(selected_sourceId, {
          type: "geojson",
          data: singleHexGeojson,
        });
        map.addLayer({
          id: selected_layerId,
          source: selected_sourceId,
          type: "fill",
          interactive: false,
          paint: {
            "fill-outline-color": "#4A90E2",
            "fill-color": "rgba(74,144,226,0.20)",
            "fill-opacity": 1,
          },
        });
        selected_source = map.getSource(selected_sourceId);
      }
      // Update the h3Geo data
      selected_source.setData(singleHexGeojson);
      map.setLayoutProperty(selected_layerId, "visibility", "visible");

      // multiple
    }
    function focusMapMult(multipleLandSelectionList) {
      let featureOfSelectedLands = geojson2h3.h3SetToFeatureCollection(
        multipleLandSelectionList
      );
      const selected_sourceId = "h3-hexes_multi_selected";
      const selected_layerId = `${selected_sourceId}-layer`;
      let selected_source = map.getSource(selected_sourceId);
      if (!selected_source) {
        map.addSource(selected_sourceId, {
          type: "geojson",
          data: featureOfSelectedLands,
        });
        map.addLayer({
          id: selected_layerId,
          source: selected_sourceId,
          type: "fill",
          interactive: false,
          paint: {
            "fill-outline-color": "#ec663c",
            "fill-color": "rgba(249,180,38,0.5)",
            "fill-opacity": 1,
          },
        });
        selected_source = map.getSource(selected_sourceId);
      }
      selected_source.setData(featureOfSelectedLands);
      map.setLayoutProperty(selected_layerId, "visibility", "visible");
    }
  },
};
</script>

<style >
.multi {
  color: #00000094;
  background: white;
  border-radius: 4px;
}

.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}

.mapboxgl-ctrl-pitchtoggle-3d {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+ICAgIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHN0eWxlPSJmb250LXNpemU6IDE0cHg7IGZvbnQtZmFtaWx5OiAnSGVsdmV0aWNhIE5ldWUnLEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmOyBmb250LXdlaWdodDogYm9sZDsgdGV4dC1hbmNob3I6IG1pZGRsZTsiPjNEPC90ZXh0Pjwvc3ZnPg==);
}

.mapboxgl-ctrl-pitchtoggle-2d {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+ICAgIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHN0eWxlPSJmb250LXNpemU6IDE0cHg7IGZvbnQtZmFtaWx5OiAnSGVsdmV0aWNhIE5ldWUnLEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmOyBmb250LXdlaWdodDogYm9sZDsgdGV4dC1hbmNob3I6IG1pZGRsZTsiPjJEPC90ZXh0Pjwvc3ZnPg==);
}
</style>
