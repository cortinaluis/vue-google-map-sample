/* eslint object-curly-newline: [0] */
/* eslint max-len: [0] */
/* eslint prefer-destructuring: [1] */
import { compose } from 'ramda';
import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

// https://data.gov.sg/dataset/master-plan-2014-region-boundary-web
import singapore_data from '../../assets/json/MP14_REGION_WEB_PL.geojson';

const triangle_data = [
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

const colorScale = d3.scaleLinear()
      .domain([1, singapore_data.features.length])
      .interpolate(d3.interpolateHcl)
      .range(['#ff8020', '#40ff00']);

// To prevent the weird overlay clipping while dragging the map around,
// we intentionally shift "top" and "left" of the SVG element (in CSS),
// and later position them back to the original position (in JS).
const DEFAULT_PADDING_SIZE = 5000;

const getLayerName = key => (key && `layer-${key}`) || 'mlayer';
const getSvgName = key => (key && `svg-${key}`) || 'msvg';
const getGroupName = key => (key && `group-${key}`) || 'mgroup';

/**
 * @returns {Function}
 */
const getPathName = key => d => (`path-${key}${(d && d.id && `-${d.id}`) || ''}`);

/**
 * @returns {string|Function}
 */
const getFillColor = (mapping => (key => mapping[key]))({
  triangle: '#ff0000',
  singapore: (d, i) => colorScale(i),
});

const getStrokeColor = (mapping => (key => mapping[key]))({
  singapore: '#604000',
});

const getOpacity = (mapping => (key => mapping[key]))({
  triangle: 0.4,
  singapore: 0.4,
});

const label_opacity = 0.6;

const latLngToPixelFactory = ({ google, projection }) => (lat, lng) => (
  projection.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng))
);

const projectorFactory = ({ google, projection, options }) => {
  const latLngToPixel = latLngToPixelFactory({ google, projection });
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const point = function pointStream(lng, lat) {
    // const p = new google.maps.LatLng(lat, lng);
    // const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(p) || {};
    const { x = 0, y = 0 } = latLngToPixel(lat, lng);
    this.stream.point(x + padding, y + padding);
  };
  return d3.geoPath().projection(d3.geoTransform({ point }));
};

/**
 * We cannot simply use "d3.polygonCentroid"
 * to determine the center of the region because
 * "Multipolygon" contains multiple polygons within.
 * So, we iterate all the coordinates,
 * to get the average of latitudes and longitudes.
 */
const labelTranslateFactory = ({ google, projection, options }) => (d) => {
  const latLngToPixel = latLngToPixelFactory({ google, projection });
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const { geometry: { coordinates = [] } } = d || {};
  let total = 0;
  const tmp = { lat: 0, lng: 0 };
  coordinates.forEach((outer) => {
    // Weird as it may seem, according to the specification,
    // each array still contains another set of arrays within.
    const [inner] = outer || [];
    if (inner) {
      inner.forEach(([lng = 0, lat = 0]) => {
        tmp.lat += lat;
        tmp.lng += lng;
        total += 1;
      });
    }
  });
  const { x = 0, y = 0 } = latLngToPixel(
    tmp.lat / total, // average of "lat"
    tmp.lng / total // average of "lng"
  );
  return `translate(${x + padding},${y + padding})`;
};

const initOverlay = key => (o = {}) => ({
  ...o,
  ...{
    key,
    layer_name:  getLayerName(key),
    svg_name:    getSvgName(key),
    group_name:  getGroupName(key),
    path_name:   getPathName(key),
    fill:        getFillColor(key),
    stroke:      getStrokeColor(key),
    opacity:     getOpacity(key),
  },
});

const setOverlay = (o) => {
  const { google, map, layer_name, draw } = o || {};
  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);
  overlay.onAdd = function onAdd() {
    d3.select(this.getPanes().overlayLayer)
      .append('div')
      .attr('class', layer_name)
      .style('position', 'absolute');
    this.draw = draw;
  };
  return o;
};

const setTriangle = compose(
  setOverlay,
  (o) => {
    const {
      google, layer_name, svg_name, group_name, path_name, fill, opacity,
    } = o || {};
    return {
      ...o,
      draw: function draw() {
        const projection = this.getProjection();
        const projector = projectorFactory({ google, projection });
        const layer = d3.select(`.${layer_name}`);
        layer.select(`.${svg_name}`).remove();
        const svg = layer.append('svg').attr('class', svg_name);
        const g = svg.append('g').attr('class', group_name);
        g.selectAll('path')
          .data(triangle_data)
          .enter()
          .append('path')
          .attr('d', projector)
          .attr('class', path_name) // Function deteminines class name by "i" given.
          .style('fill', fill)
          .style('opacity', opacity);
      },
    };
  },
  initOverlay('triangle'),
);

const setSingapore = compose(
  setOverlay,
  (o) => {
    const {
      google, layer_name, svg_name, group_name, path_name, stroke, fill, opacity,
    } = o || {};
    return {
      ...o,
      draw: function draw() {
        // mosaikekkan
        console.log('+++++++ draw()');
        const projection = this.getProjection();
        const projector = projectorFactory({ google, projection });
        const labelTranslate = labelTranslateFactory({ google, projection });
        const layer = d3.select(`.${layer_name}`);
        layer.select(`.${svg_name}`).remove();
        const svg = layer.append('svg').attr('class', svg_name);
        const g = svg.append('g').attr('class', group_name);
        g.selectAll('path')
          .data(singapore_data.features)
          .enter()
          .append('path')
          .attr('d', projector)
          .attr('class', path_name) // Function deteminines class name by "i" given.
          .style('fill', fill) // Function using "colorScale" determines the color by "i" given.
          .style('stroke', stroke)
          .style('opacity', opacity);

        g.selectAll('.label')
          .data(singapore_data.features)
          .enter()
          .append('text')
          .text(d => d.properties.Name)
          .attr('class', 'label')
          .attr('transform', labelTranslate)
          .attr('dy', () => '.35em')
          .attr('fill', '#101010')
          .style('text-anchor', 'middle')
          .style('opacity', label_opacity);
      },
    };
  },
  initOverlay('singapore'),
);

export default {
  name: 'map-overlay',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
  },
  mounted() {
    const { google, map } = this;
    setTriangle({ google, map });
    setSingapore({ google, map });
  },
};

