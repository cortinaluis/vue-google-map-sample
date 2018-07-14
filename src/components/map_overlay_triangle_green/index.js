/**
 * Adding a simple green triangle overlay to Google map without using d3.
 */
import template from './template.html';

// Singapore Botanic Gardens: [103.8137249, 1.3138451]
// Singapore Zoo: [103.7908343, 1.4043539]
// Punggol Park: [103.8955356, 1.377199]
import data from '../../assets/json/without_d3.geojson';

const map_style = {
  fillColor:      '#40b500',
  fillOpacity:    0.3,
  strokeColor:    '#305000',
  strokeOpacity:  0.2,
  strokeWeight:   1,
};

let saved = [];

export default {
  name: 'map-overlay-without-d3',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  watch: {
    show(val) {
      this.hideOverlay();
      if (val) {
        this.showOverlay();
      }
    }
  },
  mounted() {
    this.showOverlay();
  },
  methods: {
    showOverlay() {
      const { map } = this;
      saved = map.data.addGeoJson(data);
      map.data.setStyle(map_style);
    },
    hideOverlay() {
      const { map } = this;
      saved.forEach((coord) => {
        map.data.remove(coord);
      });
    },
  },
};

