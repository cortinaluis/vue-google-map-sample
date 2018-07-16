/* eslint object-curly-newline: [0] */
/* eslint no-multi-spaces: [0] */
/* eslint no-unused-vars: [1] */
import { compose } from 'ramda';
import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

const BASE_KEY = 'popular';

// To prevent the weird overlay clipping while dragging the map around,
// we intentionally shift "top" and "left" of the SVG element (in CSS),
// and later set them back to the original position (in JS).
const DEFAULT_PADDING_SIZE = 5000;

/**
 * Provides a transformer (translate) for marker positions.
 * For it's a factory function, you need to first
 * give "google" and "projection" for this function
 * to provide us the function we actually use.
 * @returns {Function}
 */
const translateFactory = ({ google, projection, options }) => (d) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const { lat = 0, lng = 0 } = d || {};
  const p = new google.maps.LatLng(lat, lng);
  const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(p) || {};
  return `translate(${x + padding},${y + padding})`;
};

const layerName = key => `layer-${key}`;
const svgName = key => `svg-${key}`;
const groupName = key => `group-${key}`;
const groupNameCircle = key => `group-${key}`;

const radius         = '4px';
const fill           = '#d80a1f';
const opacity        = 0.95;
const label_fill     = '#202020';
const label_opacity  = 0.9;

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
    layer_name:         layerName(key),
    svg_name:           svgName(key),
    group_name:         groupName(key),
    group_name_circle:  groupNameCircle(key),
  };
};

/**
 * Once "draw" is defined, then it applies "draw" to "onAdd".
 * Called after defining "draw" function.
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
 * @returns {Function}
 */
const setMarkers = compose(
  setOverlay,
  (o) => {
    const {
      google, markers, layer_name, svg_name, group_name, group_name_circle,
    } = o || {};
    return {
      ...o,
      draw: function draw() {
        // Create a projector for the overlay path generation.
        const projection = this.getProjection();
        const translate = translateFactory({ google, projection });
        // Every time dragging the map around,
        // removes SVG elements created previously.
        const layer = d3.select(`.${layer_name}`);
        layer.select(`.${svg_name}`).remove();
        // Newly created SVG element to contain the overlay PATH.
        const svg = layer.append('svg').attr('class', svg_name);
        const g = svg.append('g').attr('class', group_name);
        g.selectAll('path')
          .data(markers)
          .enter()
          .append('g')
          .attr('transform', translate)
          .attr('class', group_name_circle) // Function deteminines class name by "i" given.
          .append('circle')
          .attr('r', radius)
          .style('fill', fill)
          .style('opacity', opacity);

        g.selectAll('.label')
          .data(markers)
          .enter()
          .append('text')
          .text(d => d.name)
          .attr('class', 'label')
          .attr('transform', translate)
          .attr('dy', () => '-.5em')
          .attr('fill', label_fill)
          .style('opacity', label_opacity)
          .style('text-anchor', 'middle');
      },
    };
  },
  initOverlay,
);

export default {
  name: 'map-markers',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  data() {
    return {
      markers: [
        { name: 'Raffles Hotel', lng: 103.8522904, lat: 1.2948883 },
        { name: 'Singapore Botanic Gardens', lng: 103.8137249, lat: 1.3138451 },
        { name: 'Changi Airport Singapore', lng: 103.9893421, lat: 1.3644256 },
      ],
    };
  },
  watch: {
    show(val) {
      const el = document.body.querySelector(`.${layerName(BASE_KEY)}`);
      if (el) {
        el.style.visibility = val ? 'visible' : 'hidden';
      }
    },
  },
  mounted() {
    const { google, map, markers } = this;
    setMarkers({ google, map, markers, key: BASE_KEY });
  },
};
