/* eslint no-unused-vars: [1] */
import GoogleMapLoader from '@/components/google_map_loader';
import MapMarkers from '@/components/map_markers';
// import MapMarker from '@/components/map_marker';
// import MapMarkerWithoutD3 from '@/components/map_marker_without_d3';
import MapOverlay from '@/components/map_overlay';
import MapOverlayWithoutD3 from '@/components/map_overlay_without_d3';

import template from './template.html';
import './style.styl';

import map_styles from './map_styles.json';

const mapElemId = 'my-google-map';
const apiKey = 'AIzaSyDtDdWEh0tzu4bbIic4Sa68iPOgYbkF3h8';
const center = { name: 'Raffles Hotel', lat: 1.2953139, lng: 103.8524867 };
const zoom = 10.75;

// This is for the one using d3.
const markers = [
  { name: 'Raffles Hotel', lng: 103.8522904, lat: 1.2948883 },
  { name: 'Singapore Botanic Gardens', lng: 103.8137249, lat: 1.3138451 },
  { name: 'Changi Airport Singapore', lng: 103.9893421, lat: 1.3644256 },
];

// This is for the one w/o using d3.
const markers_without_d3 = [
  { name: 'Blu Jaz Cafe', lng: 103.8567434, lat: 1.3006284 },
  { name: 'Candour Coffee', lng: 103.8557405, lat: 1.2960791 },
  { name: 'Bugis MRT', lng: 103.8534648, lat: 1.3008724 },
  { name: 'Book Point', lng: 103.8525092, lat: 1.2969103 }
];

export default {
  name: 'MyGoogleMap',
  template,
  data() {
    return {
      mapElemId,
      apiKey,
      markers,
      markers_without_d3,
      config: { zoom, center, styles: map_styles },
    };
  },
  components: {
    GoogleMapLoader,
    MapMarkers,
    // MapMarker,
    MapOverlay,
    // MapMarkerWithoutD3,
    MapOverlayWithoutD3,
  },
  methods: {
    isReady() {
      const el = this.$el.querySelector(`#${this.mapElemId}`);
      if (el) {
        const height = Math.trunc(window.innerHeight * 0.8);
        console.log(`Set the height for "${this.mapElemId}" being: ${height}px`);
        el.style.height = `${height}px`;
      }
    }
  },
};
