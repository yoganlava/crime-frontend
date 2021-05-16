<template>
  <div class="map-container" :class="{ fullscreen: fullscreen }">
    <client-only>
      <div v-show="false" id="invisible-chart"></div>
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
import Chart from "chart.js";

interface LMap extends Element {
  mapObject: L.Map;
}

interface MarkerClusterGroup extends L.LayerGroup {}

@Component
export default class MapContainer extends Vue {
  // IP of user
  @Prop() ip: string;
  // Current polygon
  lastLayer: L.Polygon | L.Rectangle;
  // Crime Markers
  crimeGroup: MarkerClusterGroup;
  // Current crimes loaded
  crimeObjects: Array<any>;
  // Police Station markers
  stationGroup: L.LayerGroup;
  fullscreen: boolean = false;
  darkMode: boolean = false;

  $refs!: {
    map: LMap;
    chart: any;
  };
  /**
   * Get location of IP and pan to location
   * Also do some initialisation
   */
  async mounted() {
    // Get gelocation of IP
    let geoInfo = await this.$http.$get(`/external/ip/${this.ip}`);
    this.crimeGroup = this.$L.markerClusterGroup().addTo(this.getMap());
    this.stationGroup = this.$L.layerGroup().addTo(this.getMap());
    // pan to geolocation
    this.panMapTo([geoInfo.lat, geoInfo.lon]);
    this.initialiseToolbar();
    // set up listeners
    this.getMap().on("pm:create", this.resolveCrimes);
    this.$root.$on("goToAddress", (coords) => {
      this.goToAddress(coords);
    });
    this.$root.$on("triggerDarkMode", (darkMode) => {
      this.darkMode = darkMode;
    });
  }
  /**
   * Get all crimes in an area and display it on the map
   * @param {LeafletEvent} e
   */
  async resolveCrimes(e: L.LeafletEvent) {
    this.replaceLastLayer(e.layer);
    // Limit polygon area to 280000000 (arbitrary number found from minimal testing)
    if (this.calculatePolygonArea(this.getCurrentPolygonCoords()) > 280000000) {
      // Show error toast
      this.$toast.show({
        type: "danger",
        title: "Error",
        message: "Area too big",
      });
      // Clear the markers
      this.crimeGroup.clearLayers();
      this.stationGroup.clearLayers();
      return;
    }
    await this.markCrimesInLastLayer();
    await this.loadPoliceStations();
    this.analyseLastLayer();
  }

  // Wait for next vue tick
  waitForNextTick = (vm) =>
    new Promise<void>((resolve) => vm.$nextTick(() => resolve()));

  /**
   * Create analysis popup when clicking on polygon
   */
  async analyseLastLayer() {
    var crimeMap = {};
    this.crimeGroup.getLayers().forEach((crimeMarker: any) => {
      crimeMap[crimeMarker.options.title] = crimeMap[crimeMarker.options.title]
        ? crimeMap[crimeMarker.options.title] + 1
        : 1;
    });
    // Once the polygon has been clicked, initialise the book mark,
    // and replace the listener to a simple popup
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

  /**
   * Initialise the toolbar that appears on the left of the map
   */
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
    // Create fullscreen button
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
    // Create the filter button
    this.getMap().pm.Toolbar.createCustomControl({
      name: "filter",
      title: "Filter By",
      className: "icon-filter",
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
    // Create dark mode
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

  /**
   * Filter markers by type
   * @param {string} category
   */
  filterMarkers(category: string) {
    // clear markers
    this.crimeGroup.clearLayers();
    category == "all"
      ? this.crimeObjects.forEach(this.markCrime)
      : this.crimeObjects
          .filter((crime) => crime.category == category)
          .forEach(this.markCrime);
  }

  /**
   * Clears current markers and then populates with crime within the new polygon
   */
  async markCrimesInLastLayer() {
    this.crimeGroup.clearLayers();
    let crimes: Array<any> = await this.$http.$get(
      `/api/crime/crime?poly=${this.getCurrentPolygonCoords().join(":")}`
    );
    this.crimeObjects = crimes;
    crimes.forEach(this.markCrime);
  }

  /**
   * Mark crime at a point
   * @param {json} crime
   */
  markCrime(crime) {
    let text =
      `
        <b>Crime Type:</b> ${crime.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}<br>
        <b>Date:</b> ${crime.crime_date}<br>
        <b>Location:</b> ${crime.street}<br>
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
    // Add TTS button
    text =
      `<button onclick="speak(\`${dummy.innerText}\`)" class="bg-grey-dark hover:bg-grey text-grey-darkest font-bold py-1 px-1 rounded inline-flex items-center">
          <i class="icon-volume"></i>
        </button><br>` + text;
    // Add marker to map
    this.addMarker(
      [crime.latitude, crime.longitude],
      text,
      crime.category,
      this.crimeGroup
    );
  }

  /**
   * Clear current police stations and load nearest police stations to polygon
   */
  async loadPoliceStations() {
    this.stationGroup.clearLayers();
    // Get center of polygon
    let centroid = this.getPolygonCentroid(this.getCurrentPolygonCoords()),
      //Get police stations closest to center of the polygon
      nearestStations = await this.$http.$get(
        `https://www.met.police.uk/api/v1/en-GB/policestationresults/getnearestpolicestationresults/json?lat=${
          centroid[0]
        }&lng=${centroid[1]}&numberOfResults=5&_=${Math.round(
          Date.now() / 1000
        )}`
      );
    // Add all police stations as markers
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
  /**
   * Create a circular polygon at a point
   * @param {number} center
   * @param {number} radius
   */
  createCircularPolygon(center: Array<number>, radius: number = 100) {
    var unproject = this.getMap().layerPointToLatLng.bind(this.getMap()),
      projectedCentroid = this.getMap().latLngToLayerPoint.bind(this.getMap())(
        center
      ),
      angle = 0.0,
      points = [];
    // Create 10 sided polygon
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

  /**
   * Replace last polygon
   * @param newLayer Polygon to replace with
   */
  replaceLastLayer(newLayer) {
    if (this.lastLayer != undefined) this.getMap().removeLayer(this.lastLayer);
    this.lastLayer = newLayer;
  }
  /**
   * Get coords of current polygon
   * @return {Array<Array<number>>}
   */
  getCurrentPolygonCoords() {
    return (this.lastLayer.getLatLngs()[0] as Array<{
      lat;
      lng;
    }>).map((latlng) => [latlng.lat, latlng.lng]);
  }

  /**
   * Get center of polygon
   * @param {Array<Array<number>>} points
   * @return {Array<number>}
   */
  getPolygonCentroid(points: Array<Array<number>>): Array<number> {
    var x = points.map((point) => point[0]),
      y = points.map((point) => point[1]),
      cx = (Math.min(...x) + Math.max(...x)) / 2,
      cy = (Math.min(...y) + Math.max(...y)) / 2;
    return [cx, cy];
  }

  // Map getter
  getMap = () => this.$refs.map.mapObject;

  /**
   * Pan to coords and mark crimes in the area
   * @param {Array<number>} coords
   */
  async goToAddress(coords: Array<number>) {
    this.panMapTo(coords);
    this.createCircularPolygon(coords);
    await this.markCrimesInLastLayer();
    await this.loadPoliceStations();
    this.analyseLastLayer();
  }
  /**
   * Pan map to supplied coords
   * @param {Array<number>} coords
   */
  panMapTo(coords) {
    this.getMap().panTo(coords);
  }

  /**
   * Add crime market to a location
   * @param {Array<number>} coords
   * @param {string} text
   * @param {string} type
   * @param group
   */
  addMarker(coords, text: string, type: string, group) {
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

  /**
   * Calculate rough polygon area
   * @param {Array<Array<number>>} points
   */
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

      area +=
        ((points[upperIndex][1] * Math.PI) / 180 -
          (points[lowerIndex][1] * Math.PI) / 180) *
        Math.sin((points[middleIndex][0] * Math.PI) / 180);
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
  z-index: 2;
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
