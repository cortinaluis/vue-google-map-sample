/* eslint no-unused-vars: [1] */
import template from './template.html';

export default {
  name: 'Spot',
  template,
  props: {
    google: Object, // Provided by "components/GoogleMapLoader.vue".
    map: Object, // Provided by "components/GoogleMapLoader.vue".
    spot: Object, // Given directly from "views/MyGoogleMap.vue".
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
