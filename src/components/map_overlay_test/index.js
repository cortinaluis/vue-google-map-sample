/* eslint object-curly-newline: [0] */
import { compose } from 'ramda';
import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

// http://global.mapit.mysociety.org/area/973041.html
import singapore_central_geojson from '../../assets/json/singapore_central_973041.geojson';

const DEFAULT_PADDING_SIZE = 5000;
const PATH_SETTINGS = {
  fill: { simple: '#ff0000', central: '#009090' },
  opacity: { simple: 0.4, central: 0.4 }
};

const data = {
  // A sample set of coordinates, with its shape being a triangle.
  simple: [
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
  ],
  // Another set of coordinates, this time, for Singapore's Central region.
  central: [
    {
      type: 'Feature',
      properties: { name: 'Singapore Central Area' },
      geometry: singapore_central_geojson,
    }
  ],
};

const getLayerName = key => (key && `layer-${key}`) || 'mlayer';
const getSvgName = key => (key && `svg-${key}`) || 'msvg';
const getGroupName = key => (key && `group-${key}`) || 'mgroup';
const getPathName = key => d => (`path-${key}${(d && d.id && `-${d.id}`) || ''}`);

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

const makeOverlaySimple = compose(
  setOverlay,
  (o = {}) => {
    const { google } = o;
    const key = 'simple';
    const layer_name = getLayerName(key);
    const svg_name = getSvgName(key);
    const group_name = getGroupName(key);
    const fill = PATH_SETTINGS.fill[key];
    const opacity = PATH_SETTINGS.opacity[key];
    const draw = function draw() {
      const layer = d3.select(`.${layer_name}`);
      layer.select(`.${svg_name}`).remove();
      const svg = layer.append('svg').attr('class', svg_name);
      const g = svg.append('g').attr('class', group_name);
      const projection = this.getProjection();
      const projector = projectorFactory({ google, projection });
      g.selectAll('path')
        .data(data[key])
        .enter()
        .append('path')
        .attr('d', projector)
        .attr('class', getPathName(key))
        .style('fill', fill)
        .style('opacity', opacity);
    };
    return { ...o, key, draw };
  },
);

const makeOverlaySingaporeCentral = compose(
  setOverlay,
  (o = {}) => {
    const { google } = o;
    const key = 'central';
    const layer_name = getLayerName(key);
    const svg_name = getSvgName(key);
    const group_name = getGroupName(key);
    const fill = PATH_SETTINGS.fill[key];
    const opacity = PATH_SETTINGS.opacity[key];
    const draw = function draw() {
      const layer = d3.select(`.${layer_name}`);
      layer.select(`.${svg_name}`).remove();
      const svg = layer.append('svg').attr('class', svg_name);
      const g = svg.append('g').attr('class', group_name);
      const projection = this.getProjection();
      const projector = projectorFactory({ google, projection });
      g.selectAll('path')
        .data(data[key])
        .enter()
        .append('path')
        .attr('d', projector)
        .attr('class', getPathName(key))
        .style('fill', fill)
        .style('opacity', opacity);
    };
    return { ...o, key, draw };
  },
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
    makeOverlaySimple({ google, map });
    makeOverlaySingaporeCentral({ google, map });
  },
};

