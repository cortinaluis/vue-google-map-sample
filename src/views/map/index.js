/* eslint no-unused-vars: [1] */
import GoogleMapLoader from '@/components/google_map_loader';
import Marker from '@/components/marker';
import MapOverlayTest from '@/components/map_overlay_test';

import template from './template.html';
import './style.styl';

const mapElemId = 'my-google-map';
const apiKey = 'AIzaSyDtDdWEh0tzu4bbIic4Sa68iPOgYbkF3h8';
const center = { name: 'Raffles Hotel', lat: 1.2953139, lng: 103.8524867 };
const zoom = 10.5;

const markers = [
  { name: 'Blu Jaz Cafe', lng: 103.8567434, lat: 1.3006284 },
  { name: 'Candour Coffee', lng: 103.8557405, lat: 1.2960791 },
  { name: 'Bugis MRT', lng: 103.8534648, lat: 1.3008724 },
  { name: 'Book Point', lng: 103.8525092, lat: 1.2969103 },
  { name: 'Raffles Hotel', lng: 103.8522904, lat: 1.2948883 },
  { name: 'Singapore Botanic Gardens', lng: 103.8137249, lat: 1.3138451 },
  { name: 'Changi Airport Singapore', lng: 103.9893421, lat: 1.3644256 },
];

export default {
  name: 'MyGoogleMap',
  template,
  data() {
    return {
      mapElemId,
      apiKey,
      markers,
      config: { zoom, center },
    };
  },
  components: {
    GoogleMapLoader,
    Marker,
    MapOverlayTest,
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
