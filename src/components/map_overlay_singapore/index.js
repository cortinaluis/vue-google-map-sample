/* eslint object-curly-newline: [0] */
/* eslint no-multi-spaces: [0] */
/* eslint max-len: [0] */
/* eslint prefer-destructuring: [1] */
/**
 * Adding a Singaple regional overlay to Google map using d3.
 */
import { compose } from 'ramda';
import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

// https://data.gov.sg/dataset/master-plan-2014-region-boundary-web
import geojson from '../../assets/json/MP14_REGION_WEB_PL.geojson';

const BASE_KEY = 'singapore';

// To prevent the weird overlay clipping while dragging the map around,
// we intentionally shift "top" and "left" of the SVG element (in CSS),
// and later set them back to the original position (in JS).
const DEFAULT_PADDING_SIZE = 5000;

const { features = [] } = geojson || {};

const colorScale = d3.scaleLinear()
      .domain([1, features.length])
      .interpolate(d3.interpolateHcl)
      .range(['#ff8020', '#40ff00']);

const layerName = key => `layer-${key}`;
const svgName = key => `svg-${key}`;
const groupName = key => `group-${key}`;
const pathName = key => d => (`path-${key}${(d && d.id && `-${d.id}`) || ''}`);
const fill = (d, i) => colorScale(i);

const stroke         = '#604000';
const opacity        = 0.4;
const label_fill     = '#101010';
const label_opacity  = 0.6;

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
 * Provides a transformer (translate) for label positions.
 * Using "d3.polygonCentroid" does not solve the problem
 * because our geojson is expressed in "Multipolygon".
 * Meaning, we must iterate for all the coordinates
 * (each of which is a polygon) to calculate the average
 * for "lat" and "lng" contained,  so that we can use
 * this average as a pseudo centroid for each region.
 * For it's a factory function, you need to first
 * give "google" and "projection" for this function
 * to provide us the function we actually use.
 * @returns {Function}
 */
const labelTranslateFactory = ({ google, projection, options }) => (d) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const { geometry: { coordinates = [] } } = d || {};
  let total = 0;
  let lat_sum = 0;
  let lng_sum = 0;
  coordinates.forEach((outer) => {
    // Weird as it may seem, according to the specification,
    // each array still contains another set of arrays within.
    const [inner] = outer || [];
    if (inner) {
      inner.forEach(([lng = 0, lat = 0]) => {
        lat_sum += lat;
        lng_sum += lng;
        total += 1;
      });
    }
  });
  const p = new google.maps.LatLng(lat_sum / total, lng_sum / total);
  const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(p) || {};
  return `translate(${x + padding},${y + padding})`;
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
 * Once "draw" is defined, then it applies "draw" to "onAdd".
 * Called after defining "draw" function.
 * @returns {Object}
 */
const setOverlay = (o) => {
  const { google, map, layer_name, draw, show = false } = o || {};
  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);
  overlay.onAdd = function onAdd() {
    d3.select(this.getPanes().overlayLayer)
      .append('div')
      .attr('class', layer_name)
      .style('position', 'absolute')
      .style('visibility', show ? 'visible' : 'hidden');
    this.draw = draw;
  };
  return o;
};

/**
 * (1) "initOverlay", (2) defining "draw", (3) and "setOverlay".
 * It basically defines "draw" which will be later
 * set to Google overlay's "onAdd".
 * Given an external GEOJSON data which represents regional boundaries
 * of regions in Singapore, it creates overlay views for each region.
 * Also, plots labels for regional names.
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
        .style('fill', fill) // Function using "colorScale" determines the color by "i" given.
        .style('stroke', stroke)
        .style('opacity', opacity);

      const labelTranslate = labelTranslateFactory({ google, projection });
      g.selectAll('.label')
        .data(features)
        .enter()
        .append('text')
        .text(d => d.properties.Name)
        .attr('class', 'label')
        .attr('transform', labelTranslate)
        .attr('dy', () => '.35em')
        .attr('fill', label_fill)
        .style('opacity', label_opacity)
        .style('text-anchor', 'middle');
    },
  };
};

const set = compose(
  setOverlay,
  drawFactory,
  initOverlay,
);

export default {
  name: 'map-overlay-singapore',
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
    set({ google, map, show: !!this.show, key: BASE_KEY });
  },
};

