/* eslint no-unused-vars: [1] */
import GoogleMapsApiLoader from 'google-maps-api-loader';

import template from './template.html';
import './style.styl';

export default {
  name: 'GoogleMapLoader',
  template,
  props: {
    config: Object,
    apiKey: String,
  },
  data() {
    return {
      google: null,
      map: null,
    };
  },
  mounted() {
    const { apiKey, config } = this;
    if (apiKey && config) {
      GoogleMapsApiLoader({ apiKey }).then((google) => {
        const el = this.$el.querySelector('#map');
        const { maps: { Map } } = google;
        if (!el) throw new Error('No container for the map.');
        if (!Map) throw new Error('No "google.maps.Map".');
        this.google = google;
        this.map = new Map(el, config);
      }).catch((err) => {
        console.error(err);
      });
    }
  },
};
