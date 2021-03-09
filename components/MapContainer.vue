<template>
  <div class="map-container">
    <client-only>
      <l-map ref="map" :zoom="14">
        <l-tile-layer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          :noWrap="true"
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

  // Set up map after mounted
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

    this.$refs.map.mapObject.on("pm:create", this.resolveCrimes);

    this.$root.$on("goToAddress", coords => {
      this.goToAddress(coords);
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
        message: "Area too big"
      });
      this.markerGroup.clearLayers();
      return;
    }
    await this.markCrimesInLastLayer();
  }

  // Sends polygon to crime api and marks all the crimes recieved on the map
  async markCrimesInLastLayer() {
    this.markerGroup.clearLayers();
    let crimes: Array<any> = await this.$http.$get(
      `https://data.police.uk/api/crimes-street/all-crime?poly=${this.getLastPolygonCoords().join(
        ":"
      )}`
    );
    crimes.forEach(crime => {
      this.addMarker(
        [crime.location.latitude, crime.location.longitude],
        crime.category,
        crime.category
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
    }>).map(latlng => [latlng.lat, latlng.lng]);
  }

  // Map getter
  getMap = () => this.$refs.map.mapObject;

  // Pan to coords specified and mark crimes in a circular area around the coords
  async goToAddress(coords) {
    this.panMapTo(coords);
    this.createCircularPolygon(coords);
    await this.markCrimesInLastLayer();
  }

  // Pan map to set coords
  panMapTo(coords) {
    this.getMap().panTo(coords);
  }

  // Add marker at specified coord with html text
  addMarker(coords, text, type) {
    this.$L
      .marker(coords, {
        title: text,
        icon: this.$L.icon({
          iconUrl: `markers/${type}.png`,
          iconSize: [55 / 1.5, 84 / 1.5],
          iconAnchor: [27.5 / 1.5, 84 / 1.5],
          popupAnchor: [1, -34]
        })
      })
      .bindPopup(text)
      .addTo(this.markerGroup);
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
