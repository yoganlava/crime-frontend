<template>
  <div class="map-container">
    <client-only>
      <l-map ref="map" :zoom="13" :center="[55.9464418, 8.1277591]">
        <l-tile-layer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        ></l-tile-layer>
      </l-map>
    </client-only>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
// import PM from "@geoman-io/leaflet-geoman-free";
interface LMap extends Element {
  mapObject: L.Map;
}

@Component
export default class MapContainer extends Vue {
  @Prop() ip: string;
  lastLayer: L.Polygon | L.Rectangle;
  markerGroup: L.LayerGroup;

  $refs!: {
    map: LMap;
  };

  async mounted() {
    let geoInfo = await this.$http.$get(`/external/ip/${this.ip}`);
    this.markerGroup = this.$L.layerGroup().addTo(this.getMap());
    this.panMapTo([geoInfo.lat, geoInfo.lon]);
    this.$refs.map.mapObject.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawPolyline: false,
      drawMarker: false,
      drawCircleMarker: false,
      cutPolygon: false
    });

    this.$refs.map.mapObject.on("pm:create", this.removeLastLayer);
  }

  async removeLastLayer(e) {
    if (this.lastLayer != undefined)
      this.$refs.map.mapObject.removeLayer(this.lastLayer);
    this.lastLayer = e.layer;
    await this.markCrimesInLayer(this.lastLayer);
  }

  async markCrimesInLayer(layer: L.Polygon | L.Rectangle) {
    let crimes: Array<any> = await this.$http.$get(
      `https://data.police.uk/api/crimes-street/all-crime?poly=${this.getPolygonCoords().join(
        ":"
      )}`
    );
    console.log(crimes);
    this.markerGroup.clearLayers();
    crimes.forEach(crime => {
      this.addMarker([crime.location.latitude, crime.location.longitude], crime.category);
    });

  }

  getPolygonCoords() {
    return (this.lastLayer.getLatLngs()[0] as Array<{
      lat;
      lng;
    }>).map(latlng => [latlng.lat, latlng.lng]);
  }

  getMap = () => this.$refs.map.mapObject;

  panMapTo(coords) {
    this.getMap().panTo(coords);
  }

  addMarker(coords, text) {
    this.$L.marker(coords, {
      title: text,
    }).bindPopup(text).addTo(this.markerGroup);
  }
}
</script>

<style>
@import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

.map-container {
  z-index: 0;
  flex-basis: 100%;
  margin-left: 10%;
  margin-right: 10%;
  background-color: green;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
