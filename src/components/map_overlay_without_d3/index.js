/**
 * Adding a simple green triangle overlay to Google map without using d3.
 */
import template from './template.html';

import data from '../../assets/json/without_d3.geojson';

const map_style = {
  fillColor: '#40b500',
  fillOpacity: 0.3,
  strokeColor: '#305000',
  strokeOpacity: 0.2,
  strokeWeight: 1,
};

export default {
  name: 'map-overlay-without-d3',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
  },
  mounted() {
    const { map } = this;
    map.data.addGeoJson(data);
    map.data.setStyle(map_style);
  },
};

