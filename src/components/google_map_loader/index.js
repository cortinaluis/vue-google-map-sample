/* eslint no-unused-vars: [1] */
import GoogleMapsApiLoader from 'google-maps-api-loader';

import template from './template.html';

export default {
  name: 'google-map-loader',
  template,
  props: {
    mapElemId: String,
    config: Object,
    apiKey: String,
    isReady: Function,
  },
  data() {
    return {
      // These 2 will be passed down to "view/map" and then
      // to "component/marker" as slot properties.
      google: null,
      map: null,
    };
  },
  mounted() {
    const { mapElemId = '#map', apiKey, config = {} } = this;
    const el = this.$el.querySelector(`#${mapElemId}`);
    if (!apiKey) throw new Error('No API_KEY.');
    if (!el) throw new Error('No container for the map.');
    GoogleMapsApiLoader({ apiKey }).then((google) => {
      const { maps: { Map } } = google;
      if (!Map) throw new Error('No "google.maps.Map".');
      this.google = google;
      this.map = new Map(el, config);
      this.isReady();
    }).catch((err) => {
      console.error(err);
    });
  },
};
