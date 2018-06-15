<template>
  <div class="google-map-loader">
    <div id="map"></div>
    <template v-if="!!this.google && !!this.map">
      <!--
          Provides "google" and "map" to <template />
          defined in "views/MyGoogleMap.vue" in which
          both scope variables are again passed
          down to "components/Spot.vue".
          (needed for "Spot.vue" to place each marker)
        -->
      <slot :google="google" :map="map" />
    </template>
  </div>
</template>

<script>
/* eslint no-unused-vars: [1] */
import GoogleMapsApiLoader from 'google-maps-api-loader';

export default {
  name: 'GoogleMapLoader',
  props: {
    config: Object,
    apiKey: String,
  },
  data() {
    return {
      google: null,
      map: null,
    };
  },
  mounted() {
    const { apiKey, config } = this;
    if (apiKey && config) {
      GoogleMapsApiLoader({ apiKey }).then((google) => {
        const el = this.$el.querySelector('#map');
        const { maps: { Map } } = google;
        if (!el) throw new Error('No container for the map.');
        if (!Map) throw new Error('No "google.maps.Map".');
        this.google = google;
        this.map = new Map(el, config);
      }).catch((err) => {
        console.error(err);
      });
    }
  },
};
</script>

<style scoped lang="stylus">
#map
  height: 100vh
  width: 100%
</style>
