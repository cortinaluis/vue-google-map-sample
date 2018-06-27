import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

// http://global.mapit.mysociety.org/area/973041.html
import singapore_central_geojson from '../../assets/json/singapore_central_973041.geojson';

const DEFAULT_PADDING_SIZE = 5000;

const fill_color = { simple: '#ff0000', central: '#00ff90' };
const opacity = { simple: 0.65, central: 0.2 };

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
            [103.8534648, 1.3008724], // Bugis MRT
            [103.8522904, 1.2948883], // Raffles Hotel
            [103.8567434, 1.3006284], // Blu Jaz Cafe
            [103.8534648, 1.3008724]
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

/**
 * @returns {Function}
 */
const projectorFactory = (google, projection, options = {}) => {
  const { padding = 0 } = options;
  const point = function pointStream(lng, lat) {
    const d = projection.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng));
    const { x = 0, y = 0 } = d || {};
    // console.log(`  { lng: ${lng}, lat: ${lat} } --> { x: ${x}, y: ${y} }`);
    this.stream.point(x + padding, y + padding);
  };
  return d3.geoTransform({ point });
};

/**
 * @returns {Function}
 */
const drawFactory = ({ google, key }) => function draw() {
  const projection = this.getProjection();
  const projector = projectorFactory(google, projection, { padding: DEFAULT_PADDING_SIZE });
  const pathGenerator = d3.geoPath().projection(projector);

  const layer = d3.select(`.layer-${key}`);
  layer.select(`.svg-${key}`).remove();

  const svg = layer.append('svg').attr('class', `svg-${key}`);
  const g = svg.append('g').attr('class', `group-${key}`);

  g.selectAll('path')
    .data(data[key])
    .enter()
    .append('path')
    .attr('d', pathGenerator)
    .attr('class', (d) => {
      const { id: index } = d || {};
      return `path-${key}-${index}`;
    })
    .style('fill', fill_color[key])
    .style('opacity', opacity[key]);
};

export default {
  name: 'map-overlay-test',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
  },
  mounted() {
    const { google } = this;
    ['simple', 'central'].forEach((key) => {
      const overlay = new this.google.maps.OverlayView();
      overlay.setMap(this.map);
      overlay.onAdd = function onAdd() {
        d3.select(this.getPanes().overlayLayer).append('div').attr('class', `layer-${key}`)
        this.draw = drawFactory({ google, key });
      };
    });
  },
};

