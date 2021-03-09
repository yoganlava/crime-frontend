<template>
  <div class="map-container">
    <client-only>
      <l-map ref="map" :zoom="14">
        <l-tile-layer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        ></l-tile-layer>
      </l-map>
    </client-only>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
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

    this.$root.$on("goToAddress", coords => {
      this.goToAddress(coords);
    });
  }

  async removeLastLayer(e) {
    this.replaceLastLayer(e.layer);
    await this.markCrimesInLastLayer();
  }

  async markCrimesInLastLayer() {
    let crimes: Array<any> = await this.$http.$get(
      `https://data.police.uk/api/crimes-street/all-crime?poly=${this.getLastPolygonCoords().join(
        ":"
      )}`
    );
    this.markerGroup.clearLayers();
    crimes.forEach(crime => {
      this.addMarker(
        [crime.location.latitude, crime.location.longitude],
        crime.category
      );
    });
  }

  createCircularPolygon(center, radius = 100) {
    var project = this.getMap().latLngToLayerPoint.bind(this.getMap()),
      unproject = this.getMap().layerPointToLatLng.bind(this.getMap()),
      projectedCentroid = project(center),
      angle = 0.0,
      points = [];

    for (var i = 0; i < 10; i++) {
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

  replaceLastLayer(newLayer) {
    if (this.lastLayer != undefined)
      this.getMap().removeLayer(this.lastLayer);
    this.lastLayer = newLayer;
  }

  getLastPolygonCoords() {
    return (this.lastLayer.getLatLngs()[0] as Array<{
      lat;
      lng;
    }>).map(latlng => [latlng.lat, latlng.lng]);
  }

  getMap = () => this.$refs.map.mapObject;

  async goToAddress(coords) {
    this.panMapTo(coords);
    this.createCircularPolygon(coords);
    await this.markCrimesInLastLayer();
  }

  panMapTo(coords) {
    this.getMap().panTo(coords);
  }

  addMarker(coords, text) {
    this.$L
      .marker(coords, {
        title: text
      })
      .bindPopup(text)
      .addTo(this.markerGroup);
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
