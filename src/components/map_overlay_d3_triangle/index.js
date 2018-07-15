/* eslint object-curly-newline: [0] */
/* eslint max-len: [0] */
/* eslint prefer-destructuring: [1] */
/**
 * Adding a simple red triangle overlay to Google map using d3.
 */
import { compose } from 'ramda';
import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

const features = [
  {
    type: 'Feature',
    properties: { name: 'Singapore Sample' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [103.8137249, 1.3138451], // Singapore Botanic Gardens
          [103.9893421, 1.3644256], // Changi Airport Singapore
          [103.8522904, 1.2948883], // Raffles Hotel
          [103.8137249, 1.3138451],
        ]
      ]
    }
  }
];

const BASE_KEY = 'triangle-red';

// To prevent the weird overlay clipping while dragging the map around,
// we intentionally shift "top" and "left" of the SVG element (in CSS),
// and later set them back to the original position (in JS).
const DEFAULT_PADDING_SIZE = 5000;

const layerName = key => `layer-${key}`;
const svgName = key => `svg-${key}`;
const groupName = key => `group-${key}`;
const pathName = key => d => (`path-${key}${(d && d.id && `-${d.id}`) || ''}`);

const fill = '#ff0000';
const opacity = 0.4;

/**
 * Provides a projector for path generation.
 * For it's a factory function, you need to first
 * give "google" and "projection" for this function
 * to provide us the function we actually use.
 * @returns {Function}
 */
const projectorFactory = ({ google, projection, options }) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const point = function pointStream(lng, lat) {
    const p = new google.maps.LatLng(lat, lng);
    const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(p) || {};
    this.stream.point(x + padding, y + padding);
  };
  return d3.geoPath().projection(d3.geoTransform({ point }));
};

/**
 * Not really doing anything significant.
 * Just prepares some class and ID names.
 * Called before defining "draw".
 * @returns {Function}
 */
const initOverlay = (o) => {
  const { key } = o || {};
  return {
    ...o,
    layer_name:  layerName(key),
    svg_name:    svgName(key),
    group_name:  groupName(key),
    path_name:   pathName(key),
  };
};

/**
 * @returns {Object}
 */
const setOverlay = (o) => {
  const { google, map, layer_name, draw } = o || {};
  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);
  overlay.onAdd = function onAdd() {
    d3.select(this.getPanes().overlayLayer)
      .append('div')
      .attr('class', layer_name)
      .style('position', 'absolute')
      .style('visibility', 'hidden');
    this.draw = draw;
  };
  return o;
};

/**
 * (1) "initOverlay", (2) defining "draw", (3) and "setOverlay".
 * It basically defines "draw" which will be later
 * set to Google overlay's "onAdd".
 * This is a simple demonstration of setting an overlay
 * having only 3 spots on the map:
 *   1. Singapore Botanic Gardens
 *   2. Changi Airport Singapore
 *   3. Raffles Hotel
 * @returns {Function}
 */
const drawFactory = (o) => {
  const {
    google, layer_name, svg_name, group_name, path_name,
  } = o || {};
  return {
    ...o,
    draw: function draw() {
      // Create a projector for the overlay path generation.
      const projection = this.getProjection();
      const projector = projectorFactory({ google, projection });
      // Every time dragging the map around,
      // removes SVG elements created previously.
      const layer = d3.select(`.${layer_name}`);
      layer.select(`.${svg_name}`).remove();
      // Newly created SVG element to contain the overlay PATH.
      const svg = layer.append('svg').attr('class', svg_name);
      const g = svg.append('g').attr('class', group_name);
      g.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', projector)
        .attr('class', path_name) // Function deteminines class name by "i" given.
        .style('fill', fill)
        .style('opacity', opacity);
    },
  };
};


const set = compose(
  setOverlay,
  drawFactory,
  initOverlay
);

export default {
  name: 'map-overlay-d3-triangle',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  watch: {
    show(val) {
      const layer_name = layerName(BASE_KEY);
      const el = document.body.querySelector(`.${layer_name}`);
      if (el) {
        el.style.visibility = val ? 'visible' : 'hidden';
      }
    },
  },
  mounted() {
    const { google, map } = this;
    set({ google, map, key: BASE_KEY });
  },
};

