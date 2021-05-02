<template>
  <div class="map-container" :class="{ fullscreen: fullscreen }">
    <client-only>
      <div v-show="false" id="invisible-chart"></div>
      <!-- <polygon-analysis ref="chart"></polygon-analysis> -->
      <l-map ref="map" :zoom="14">
        <l-tile-layer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          :noWrap="true"
          v-if="!darkMode"
        ></l-tile-layer>
        <l-tile-layer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          :noWrap="true"
          v-else
        ></l-tile-layer>
      </l-map>
    </client-only>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
import PolygonAnalysis from "./PolygonAnalysis.vue";
import Chart from "chart.js";

interface LMap extends Element {
  mapObject: L.Map;
}

interface MarkerClusterGroup extends L.LayerGroup {}

@Component
export default class MapContainer extends Vue {
  @Prop() ip: string;
  lastLayer: L.Polygon | L.Rectangle;
  crimeGroup: MarkerClusterGroup;
  crimeObjects: Array<any>;
  stationGroup: L.LayerGroup;
  fullscreen: boolean = false;
  darkMode: boolean = false;
  html;

  $refs!: {
    map: LMap;
    chart: any;
  };

  created() {}

  // Set up map after mounted
  async mounted() {
    let geoInfo = await this.$http.$get(`/external/ip/${this.ip}`);
    this.crimeGroup = this.$L.markerClusterGroup().addTo(this.getMap());
    this.stationGroup = this.$L.layerGroup().addTo(this.getMap());
    this.panMapTo([geoInfo.lat, geoInfo.lon]);
    this.initialiseToolbar();
    this.getMap().on("pm:create", this.resolveCrimes);
    this.$root.$on("goToAddress", (coords) => {
      this.goToAddress(coords);
    });
    this.$root.$on("triggerDarkMode", (darkMode) => {
      this.darkMode = darkMode;
    });
  }

  // Resolves all crimes when a polygon has been created while deleting the old polygons
  async resolveCrimes(e) {
    this.replaceLastLayer(e.layer);
    console.log(this.calculatePolygonArea(this.getLastPolygonCoords()));
    // Limit polygon area to 500000 (arbitrary number found from minimal testing)
    if (this.calculatePolygonArea(this.getLastPolygonCoords()) > 500000) {
      this.$toast.show({
        type: "danger",
        title: "Error",
        message: "Area too big",
      });
      this.crimeGroup.clearLayers();
      this.stationGroup.clearLayers();
      return;
    }
    await this.markCrimesInLastLayer();
    await this.loadPoliceStations();
    this.analyseLastLayer();
  }

  waitForNextTick = (vm) =>
    new Promise<void>((resolve) => vm.$nextTick(() => resolve()));

  async analyseLastLayer() {
    var crimeMap = {};
    // ! Probably change this to use crime objects
    this.crimeGroup.getLayers().forEach((crimeMarker: any) => {
      crimeMap[crimeMarker.options.title] = crimeMap[crimeMarker.options.title]
        ? crimeMap[crimeMarker.options.title] + 1
        : 1;
    });
    // ! Really ugly but basically only way I could think of
    this.lastLayer.once("click", () => {
      let canvas = document.createElement("canvas");
      canvas.style.width = "400px";
      canvas.style.height = "450px";
      this.lastLayer.bindPopup(canvas);
      this.lastLayer.openPopup();
      let crimeMapKeys = Object.keys(crimeMap);
      let colors = new Array(crimeMapKeys.length)
        .fill(0)
        .map(() => [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ]);
      console.log(colors);

      new Chart(canvas, {
        type: "bar",
        data: {
          labels: crimeMapKeys.map((name) =>
            name
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          ),
          datasets: [
            {
              label: "Crimes",
              data: crimeMapKeys.map((crime) => crimeMap[crime]),
              borderColor: colors.map(
                (color) => `rgb(${color[0]},${color[1]},${color[2]})`
              ),
              backgroundColor: colors.map(
                (color) => `rgb(${color[0]},${color[1]},${color[2]},0.5)`
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Amount of crimes in the highlighted area",
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  autoSkip: false,
                },
              },
            ],
          },
        },
      });
      this.lastLayer.on("click", () => this.lastLayer.openPopup());
    });
  }

  initialiseToolbar() {
    this.getMap().pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawPolyline: false,
      drawMarker: false,
      drawCircleMarker: false,
      cutPolygon: false,
      dragMode: false,
      editMode: false,
      oneBlock: true,
    });
    this.getMap().pm.Toolbar.createCustomControl({
      name: "fullscreen",
      title: "Fullscreen",
      onClick: () => {
        this.fullscreen = !this.fullscreen;
        // Hacky way to wait after DOM update
        setTimeout(() => this.getMap().invalidateSize(), 50);
      },
      className: "icon-maximise",
      block: "options",
      toggle: false,
    });
    this.getMap().pm.Toolbar.createCustomControl({
      name: "filter",
      title: "Filter By",
      className: "icon-filter",
      // Very inefficient but cba
      actions: [
        {
          text: "All",
          onClick: () => this.filterMarkers("all"),
        },
        {
          text: "Anti Social Behavior",
          onClick: () => this.filterMarkers("anti-social-behaviour"),
        },
        {
          text: "Bicycle Theft",
          onClick: () => this.filterMarkers("bicycle-theft"),
        },
        {
          text: "Burglary",
          onClick: () => this.filterMarkers("burglary"),
        },
        {
          text: "Criminal damage and arson",
          onClick: () => this.filterMarkers("criminal-damage-arson"),
        },
        {
          text: "Drugs",
          onClick: () => this.filterMarkers("drugs"),
        },
        {
          text: "Other theft",
          onClick: () => this.filterMarkers("other-theft"),
        },
        {
          text: "Possession of weapons",
          onClick: () => this.filterMarkers("possession-of-weapons"),
        },
        {
          text: "Public order",
          onClick: () => this.filterMarkers("public-order"),
        },
        {
          text: "Robbery",
          onClick: () => this.filterMarkers("robbery"),
        },
        {
          text: "Shoplifting",
          onClick: () => this.filterMarkers("shoplifting"),
        },
        {
          text: "Theft from the person",
          onClick: () => this.filterMarkers("theft-from-the-person"),
        },
        {
          text: "Vehicle crime",
          onClick: () => this.filterMarkers("vehicle-crime"),
        },
        {
          text: "Violence and sexual offences",
          onClick: () => this.filterMarkers("violent-crime"),
        },
        {
          text: "Other crime",
          onClick: () => this.filterMarkers("other-crime"),
        },
      ],
      block: "options",
    });

    this.getMap().pm.Toolbar.createCustomControl({
      name: "darkMode",
      title: "Dark mode",
      onClick: () => {
        this.darkMode = !this.darkMode;
      },
      className: "icon-moon",
      block: "options",
      toggle: false,
    });
  }

  filterMarkers(category) {
    this.crimeGroup.clearLayers();
    category == "all"
      ? this.crimeObjects.forEach(this.markCrime)
      : this.crimeObjects
          .filter((crime) => crime.category == category)
          .forEach(this.markCrime);
  }

  // Sends polygon to crime api and marks all the crimes recieved on the map
  async markCrimesInLastLayer() {
    this.crimeGroup.clearLayers();
    let crimes: Array<any> = await this.$http.$get(
      `/api/crime/crime?poly=${this.getLastPolygonCoords().join(":")}`
    );
    this.crimeObjects = crimes;
    crimes.forEach(this.markCrime);
  }

  markCrime(crime) {
    {
      let text =
        `
        <b>Crime Type:</b> ${crime.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}<br>
        <b>Date:</b> ${crime.crime_date}<br>
        <b>Street:</b> ${crime.street}<br>
        <b>Outcome:</b> ${
          crime.outcome_status == null ? "Not resolved" : crime.outcome_status
        }
        <br>` +
        (crime.outcome_status == null
          ? ""
          : `<b>Outcome Date:</b> ${crime.outcome_date}`);
      // Hacky way to extract text for TTS
      let dummy = document.createElement("div");
      dummy.innerHTML = `<div>${text}</div>`;

      text =
        `<button onclick="speak(\`${dummy.innerText}\`)" class="bg-grey-dark hover:bg-grey text-grey-darkest font-bold py-1 px-1 rounded inline-flex items-center">
          <i class="icon-volume"></i>
        </button><br>` + text;
      this.addMarker(
        [crime.latitude, crime.longitude],
        text,
        crime.category,
        this.crimeGroup
      );
    }
  }

  async loadPoliceStations() {
    this.stationGroup.clearLayers();
    let centroid = this.getPolygonCentroid(this.getLastPolygonCoords()),
      nearestStations = await this.$http.$get(
        `https://www.met.police.uk/api/v1/en-GB/policestationresults/getnearestpolicestationresults/json?lat=${
          centroid[0]
        }&lng=${centroid[1]}&numberOfResults=5&_=${Math.round(
          Date.now() / 1000
        )}`
      );
    nearestStations.forEach((station) => {
      this.addMarker(
        [station.latitude, station.longitude],
        `<b>Station Name: </b> ${station.policeStationName}<br>
      <b>Police Force: </b> ${station.policeForceName}<br>
      <b>Address: </b> ${station.address
        .replaceAll("\n", "")
        .replaceAll("<p>&nbsp;</p>", "")}<br>
      <b>Opening Times: </b> ${station.openingTimes
        .replaceAll("\n", "")
        .replaceAll("<p>&nbsp;</p>", "")} 
      `,
        "station",
        this.stationGroup
      );
    });
  }

  // Create circular polygon with 10 points and then place it on the map
  createCircularPolygon(center, radius = 100) {
    var unproject = this.getMap().layerPointToLatLng.bind(this.getMap()),
      projectedCentroid = this.getMap().latLngToLayerPoint.bind(this.getMap())(
        center
      ),
      angle = 0.0,
      points = [];

    for (var i = 0; i < 11; i++) {
      angle -= (Math.PI * 2) / 10;
      var point = new this.$L.Point(
        projectedCentroid.x + radius * Math.cos(angle),
        projectedCentroid.y + radius * Math.sin(angle)
      );
      points.push(unproject(point));
    }
    this.replaceLastLayer(this.$L.polygon(points));
    this.lastLayer.addTo(this.getMap());
  }

  // Replace last polygon with new polygon
  replaceLastLayer(newLayer) {
    if (this.lastLayer != undefined) this.getMap().removeLayer(this.lastLayer);
    this.lastLayer = newLayer;
  }

  // Get the latlngs of the current polygon
  getLastPolygonCoords() {
    return (this.lastLayer.getLatLngs()[0] as Array<{
      lat;
      lng;
    }>).map((latlng) => [latlng.lat, latlng.lng]);
  }

  // Get center of polygon
  getPolygonCentroid(points: Array<Array<number>>): Array<number> {
    var x = points.map((point) => point[0]),
      y = points.map((point) => point[1]),
      cx = (Math.min(...x) + Math.max(...x)) / 2,
      cy = (Math.min(...y) + Math.max(...y)) / 2;
    return [cx, cy];
  }

  // Map getter
  getMap = () => this.$refs.map.mapObject;

  // Pan to coords specified and mark crimes in a circular area around the coords
  async goToAddress(coords) {
    this.panMapTo(coords);
    this.createCircularPolygon(coords);
    await this.markCrimesInLastLayer();
    await this.loadPoliceStations();
    this.analyseLastLayer();
  }

  // Pan map to set coords
  panMapTo(coords) {
    this.getMap().panTo(coords);
  }

  // Add marker at specified coord with html text
  addMarker(coords, text, type, group) {
    this.$L
      .marker(coords, {
        title: type,
        icon: this.$L.icon({
          iconUrl: `markers/${type}.png`,
          iconSize: [55 / 1.5, 84 / 1.5],
          iconAnchor: [27.5 / 1.5, 84 / 1.5],
          popupAnchor: [1, -34],
        }),
      })
      .bindPopup(text)
      .addTo(group);
  }

  calculatePolygonArea(points) {
    let area = 0;
    let lowerIndex;
    let middleIndex;
    let upperIndex;

    for (let i = 0; i < points.length; i++) {
      if (i === points.length - 2) {
        lowerIndex = points.length - 2;
        middleIndex = points.length - 1;
        upperIndex = 0;
      } else if (i === points.length - 1) {
        lowerIndex = points.length - 1;
        middleIndex = 0;
        upperIndex = 1;
      } else {
        lowerIndex = i;
        middleIndex = i + 1;
        upperIndex = i + 2;
      }

      const p1lon = points[lowerIndex][1];
      const p2lat = points[middleIndex][0];
      const p3lon = points[upperIndex][1];
      area +=
        (p3lon / Math.PI / 180 - p1lon / Math.PI / 180) *
        Math.sin(p2lat / Math.PI / 180);
    }
    area *= (6378137 * 6378137) / 2;

    return Math.abs(area);
  }
}
</script>

<style>
@import "leaflet.markercluster/dist/MarkerCluster.css";
@import "leaflet.markercluster/dist/MarkerCluster.Default.css";

.leaflet-popup {
  max-width: 600px;
}

.icon-compass {
  background-image: url("/icons/compass.svg");
}

.icon-maximise {
  background-image: url("/icons/maximise.svg");
}

.icon-filter {
  background-image: url("/icons/filter.svg");
}

.icon-moon {
  background-image: url("/icons/moon.svg");
}

.icon-volume {
  background-image: url("/icons/volume.svg");
  height: 24px;
  width: 24px;
}

.button-container.active .leaflet-pm-actions-container {
  display: grid;
  z-index: 10;
}

.fullscreen {
  position: absolute !important;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  margin: 0px !important;
}

.map-container {
  z-index: 0;
  flex-basis: 100%;
  margin-left: 5%;
  margin-right: 5%;
  background-color: green;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 660px;
}
</style>
