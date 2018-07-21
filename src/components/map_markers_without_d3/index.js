/* eslint no-unused-vars: [1] */
import template from './template.html';

export default {
  name: 'map-markers-without-d3',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  data() {
    return {
      instances: [],
      markers: [
        { name: 'Blu Jaz Cafe', lng: 103.8567434, lat: 1.3006284 },
        { name: 'Candour Coffee', lng: 103.8557405, lat: 1.2960791 },
        { name: 'Bugis MRT', lng: 103.8534648, lat: 1.3008724 },
        { name: 'Book Point', lng: 103.8525092, lat: 1.2969103 },
        { name: 'Singapore Zoo', lng: 103.7908343, lat: 1.4043539 },
        { name: 'Punggol Park', lng: 103.8955356, lat: 1.377199 }
      ],
    };
  },
  watch: {
    show(val) {
      this.instances.forEach((ins) => {
        ins.setVisible(val);
      });
    },
  },
  mounted() {
    const { map, markers } = this;
    const { Marker } = this.google.maps;
    const visibility = !!this.show;
    markers.forEach(({ name: title, lat, lng }) => {
      const position = { lat, lng };
      const marker = new Marker({ title, map, position });
      marker.setVisible(visibility);
      this.instances.push(marker);
    });
  },
};
