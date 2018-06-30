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
    return { spot: null }; // Not necessary.
  },
  mounted() {
    const { map } = this;
    const { Marker } = this.google.maps;
    const { name: title, lat, lng } = this.marker || {};
    const position = { lat, lng };
    // It isn't really necessary to asssin
    // the marker to "this.spot"
    // since we don't use this elsewhere in Vue components,
    // but assigning it anyways to prevent ESLint errors.
    this.spot = new Marker({ title, map, position });
  },
};
