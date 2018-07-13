/* eslint no-unused-vars: [1] */
import template from './template.html';

export default {
  name: 'map-markers-without-d3',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    markers: Array, // Given directly from "views/map".
    show: Boolean, // Given directly from "views/map".
  },
  data() {
    return {};
  },
  mounted() {
    const { map } = this;
    const { Marker } = this.google.maps;
    this.markers.forEach((marker) => {
      const { name: title, lat, lng } = marker || {};
      const position = { lat, lng };
      const x = new Marker({ title, map, position });
    });
  },
};
