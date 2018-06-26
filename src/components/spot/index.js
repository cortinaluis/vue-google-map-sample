/* eslint no-unused-vars: [1] */
import template from './template.html';

export default {
  name: 'spot',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    spot: Object, // Given directly from "views/map".
  },
  data() {
    return { marker: null };
  },
  mounted() {
    const { Marker } = this.google.maps;
    const { name: title, lat, lng } = this.spot;
    const position = { lat, lng };
    this.marker = new Marker({ title, map: this.map, position });
  },
};
