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

// To prevent the weird overlay clipping when dragging the map around,
// we intentionally shift "top" and "left" of the SVG element,
// and later position them back to the original position.
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

const projectorFactory = ({ google, projection, options }) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const point = function pointStream(lng, lat) {
    const pt = new google.maps.LatLng(lat, lng);
    const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(pt) || {};
    this.stream.point(x + padding, y + padding);
  };
  return d3.geoPath().projection(d3.geoTransform({ point }));
};

/**
 * To determine the label position for each, we need
 * to find the center of each region.
 * For each region is a "Multipolygon",
 * "coordinates" is composed of multiple polygons,
 * and we need to first find center of each polygon.
 * So, we are creating a temporarry array called "arr"
 * which is a set of center coodinates for each polygon.
 * We will later find out the center from "arr"
 * to obtain the actual center of the whole region.
 */
const labelTranslateFactory = ({ google, projection, options }) => (d) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const { geometry: { coordinates = [] } } = d || {};
  let x = 0;
  let y = 0;
  // "coordinates" is multi-dimensional (for "Multipolygon"),
  // and all of them as a whole represents one region.
  const arr = coordinates.reduce((acc, outer) => {
    // Weird it may be, each of them is an array within an array
    // because that's the spec of "Multipolygon" says.
    const [inner] = outer || [];
    // Now, having: [lat, lng]
    if (inner) {
      // But, when getting the centroid, it becomes: [lng, lat]
      const pt = d3.polygonCentroid(inner);
      // So, needs the original order: [lng, lat] --> [lat, lng]
      acc.push(pt.reverse());
    }
    return acc;
  }, []);
  if (arr.length) {
    let lat = 0;
    let lng = 0;
    if (arr.length === 1) {
      // For a single "Point", just extract "lat" and "lng".
      ([[lat = 0, lng = 0]] = arr);
    } else if (arr.length === 2) {
      // For a "Line", we find the halfway between.
      // Notice, "d3.geoInterpolate" expects: [lng, lat]
      // that's why we're reversing the order.
      arr[0] = arr[0].reverse();
      arr[1] = arr[1].reverse();
      const interpolate = d3.geoInterpolate(arr[0], arr[1]);
      ([lng = 0, lat = 0] = interpolate(0.5));
    } else {
      // For a "Polygon", it is simple.
      ([lat = 0, lng = 0] = d3.polygonCentroid(arr));
    }
    const pt = new google.maps.LatLng(lat, lng);
    ({ x, y } = projection.fromLatLngToDivPixel(pt));
  }
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
          .style('opacity', opacity);
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

