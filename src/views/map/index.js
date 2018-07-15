/* eslint no-unused-vars: [1] */
import GoogleMapLoader from '@/components/google_map_loader';
import MapMarkersWithoutD3 from '@/components/map_markers_without_d3';
import MapMarkersD3 from '@/components/map_markers_d3';
import MapOverlayWithoutD3 from '@/components/map_overlay_without_d3';
import MapOverlayD3Triangle from '@/components/map_overlay_d3_triangle';
import MapOverlayD3Singapore from '@/components/map_overlay_d3_singapore';

import template from './template.html';
import './style.styl';

import map_styles from './map_styles.json';

const mapElemId = 'my-google-map';
const apiKey = 'AIzaSyDtDdWEh0tzu4bbIic4Sa68iPOgYbkF3h8';
const center = { name: 'Raffles Hotel', lat: 1.2953139, lng: 103.8524867 };
const zoom = 10.75;

const DEFAULT_CHECK_LIST = [
  'markers_without_d3',
  'markers_d3',
  'overlay_without_d3',
  'overlay_d3_triangle',
  'overlay_d3_singapore'
];

export default {
  name: 'MyGoogleMap',
  template,
  data() {
    return {
      mapElemId,
      apiKey,
      config: { zoom, center, styles: map_styles },
      checklist: [],
      show: {},
    };
  },
  components: {
    GoogleMapLoader,
    MapMarkersWithoutD3,
    MapMarkersD3,
    MapOverlayWithoutD3,
    MapOverlayD3Triangle,
    MapOverlayD3Singapore,
  },
  watch: {
    checklist(arr = []) {
      DEFAULT_CHECK_LIST.forEach((key) => {
        this.show[key] = false;
      });
      arr.forEach((key) => {
        this.show[key] = true;
      });
    }
  },
  mounted() {
    this.checklist = [];
  },
  methods: {
    isReady() {
      const el = this.$el.querySelector(`#${this.mapElemId}`);
      if (el) {
        const height = Math.trunc(window.innerHeight * 0.75);
        console.log(`Set the height for "${this.mapElemId}" being: ${height}px`);
        el.style.height = `${height}px`;
      }
      setTimeout(() => {
        DEFAULT_CHECK_LIST.forEach((key) => {
          this.show[key] = true;
          this.checklist.push(key);
        });
      }, 500);
    }
  },
};
