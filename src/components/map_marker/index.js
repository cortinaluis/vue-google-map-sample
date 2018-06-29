/* eslint no-unused-vars: [1] */
import template from './template.html';

export default {
  name: 'map-marker',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    marker: Object, // Given directly from "views/map".
  },
  data() {
    return { spot: null };
  },
  mounted() {
    const { map } = this;
    const { Marker } = this.google.maps;
    const { name: title, lat, lng } = this.marker || {};
    const position = { lat, lng };
    this.spot = new Marker({ title, map, position });
  },
};
