/* eslint object-curly-newline: [0] */
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

// To prevent the weird overlay clipping when dragging the map around,
// we intentionally shift "top" and "left" of the SVG element,
// and later position them back to the original position.
const DEFAULT_PADDING_SIZE = 5000;

const getLayerName = key => (key && `layer-${key}`) || 'mlayer';
const getSvgName = key => (key && `svg-${key}`) || 'msvg';
const getGroupName = key => (key && `group-${key}`) || 'mgroup';
const getPathName = key => d => (`path-${key}${(d && d.id && `-${d.id}`) || ''}`);

const colorScale = d3.scaleLinear()
      .domain([1, singapore_data.features.length])
      .range(['#ff80de', '#101080']);

const getFillColor = (mapping => (key => mapping[key]))({
  triangle: '#ff0000',
  singapore: '#009090',
});

const getOpacity = (mapping => (key => mapping[key]))({
  triangle: 0.4,
  singapore: 0.4,
});

const projectorFactory = ({ google, projection, options }) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const point = function pointStream(lng, lat) {
    const d = projection.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng));
    const { x = 0, y = 0 } = d || {};
    this.stream.point(x + padding, y + padding);
  };
  return d3.geoPath().projection(
    d3.geoTransform({ point })
  );
};

const initOverlay = key => (o = {}) => ({
  ...o,
  ...{
    key,
    layer_name: getLayerName(key),
    svg_name: getSvgName(key),
    group_name: getGroupName(key),
    fill: getFillColor(key),
    opacity: getOpacity(key),
  },
});

const setOverlay = (o = {}) => {
  const { google, map, key, draw } = o;
  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);
  overlay.onAdd = function onAdd() {
    d3.select(this.getPanes().overlayLayer).append('div').attr('class', getLayerName(key));
    this.draw = draw;
  };
  return o;
};

const setTriangle = compose(
  setOverlay,
  (o = {}) => {
    const { google, key, layer_name, svg_name, group_name, fill, opacity } = o;
    return {
      ...o,
      draw: function draw() {
        const layer = d3.select(`.${layer_name}`);
        layer.select(`.${svg_name}`).remove();
        const svg = layer.append('svg').attr('class', svg_name);
        const g = svg.append('g').attr('class', group_name);
        const projection = this.getProjection();
        const projector = projectorFactory({ google, projection });
        g.selectAll('path')
          .data(triangle_data)
          .enter()
          .append('path')
          .attr('d', projector)
          .attr('class', getPathName(key))
          .style('fill', fill)
          .style('opacity', opacity);
      },
    };
  },
  initOverlay('triangle'),
);

const setSingapore = compose(
  setOverlay,
  (o = {}) => {
    const { google, key, layer_name, svg_name, group_name, fill, opacity } = o;
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
          .data(singapore_data.features)
          .enter()
          .append('path')
          .attr('d', projector)
          .attr('class', getPathName(key))
          .style('fill', (d, i) => colorScale(i) || fill)
          .style('opacity', opacity);
      },
    };
  },
  initOverlay('singapore'),
);

export default {
  name: 'map-overlay-test',
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

