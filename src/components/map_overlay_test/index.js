import * as d3 from 'd3';

import template from './template.html';
import './style.styl';

const DEFAULT_PADDING_SIZE = 5000;
const DEFAULT_FILL_COLOR = '#ff0000';
const DEFAULT_OPACITY = 0.65;

const features = [ // '../../assets/json/locations.geojson'
    {
      type: 'Feature',
      id: 0,
      properties: { name: 'Singapore Sample' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.8534648, 1.3008724],
            [103.8522904, 1.2948883],
            [103.8567434, 1.3006284],
            [103.8534648, 1.3008724]
          ]
        ]
      }
    }
];

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

const drawFactory = google => function draw() {
  const projection = this.getProjection();
  const projector = projectorFactory(google, projection, { padding: DEFAULT_PADDING_SIZE });
  const pathGenerator = d3.geoPath().projection(projector);

  const layer = d3.select('.mLayer');
  layer.select('.msvg').remove();

  const svg = layer.append('svg').attr('class', 'msvg');
  const g = svg.append('g').attr('class', 'mLayerGroup');

  g.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr('d', (d) => {
      const c = pathGenerator(d);
      // See if we have the generator command...
      // console.log(`  c: ${c}`);
      return c;
    })
    .attr('class', (d) => {
      const { id: index } = d || {};
      return `test-path-${index}`;
    })
    .style('fill', DEFAULT_FILL_COLOR)
    .style('opacity', DEFAULT_OPACITY);
};

export default {
  name: 'MapOverlayTest',
  template,
  props: {
    google: Object, // Provided by "components/GoogleMapLoader.vue".
    map: Object, // Provided by "components/GoogleMapLoader.vue".
  },
  mounted() {
    try {
      const self = this;
      const overlay = new this.google.maps.OverlayView();
      overlay.setMap(this.map);
      overlay.onAdd = function onAdd() {
        d3.select(this.getPanes().overlayLayer).append('div').attr('class', 'mLayer');
        this.draw = drawFactory(self.google);
      };
    } catch (err) {
      console.error(err);
    }
  },
};

