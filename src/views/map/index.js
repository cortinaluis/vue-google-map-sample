/* eslint no-unused-vars: [1] */
import GoogleMapLoader from '@/components/google_map_loader';
import MapMarkersShops from '@/components/map_markers_shops'; // without d3
import MapMarkersPopular from '@/components/map_markers_popular'; // d3
import MapOverlayTriangleGreen from '@/components/map_overlay_triangle_green'; // without d3
import MapOverlayTriangleRed from '@/components/map_overlay_triangle_red'; // d3
import MapOverlaySingapore from '@/components/map_overlay_singapore'; // d3

import template from './template.html';
import './style.styl';

import map_styles from './map_styles.json';

const mapElemId = 'my-google-map';
const apiKey = 'AIzaSyDtDdWEh0tzu4bbIic4Sa68iPOgYbkF3h8';
const center = { name: 'Raffles Hotel', lat: 1.2953139, lng: 103.8524867 };
const zoom = 10.75;

const checklist = [
  'markers_shops', // without d3
  'markers_pop', // d3
  'overlay_triangle_green', // without d3
  'overlay_triangle_red', // d3
  'overlay_singapore' // d3
];

export default {
  name: 'MyGoogleMap',
  template,
  data() {
    return {
      mapElemId,
      apiKey,
      config: { zoom, center, styles: map_styles },
      checklist,
      show: {},
    };
  },
  components: {
    GoogleMapLoader,
    MapMarkersShops,
    MapMarkersPopular,
    MapOverlayTriangleGreen,
    MapOverlayTriangleRed,
    MapOverlaySingapore,
  },
  watch: {
    checklist(arr = []) {
      checklist.forEach((key) => {
        this.show[key] = false;
      });
      arr.forEach((key) => {
        this.show[key] = true;
      });
    }
  },
  methods: {
    isReady() {
      const el = this.$el.querySelector(`#${this.mapElemId}`);
      if (el) {
        const height = Math.trunc(window.innerHeight * 0.75);
        console.log(`Set the height for "${this.mapElemId}" being: ${height}px`);
        el.style.height = `${height}px`;
        checklist.forEach((key) => {
          this.show[key] = true;
        });
      }
    }
  },
};
