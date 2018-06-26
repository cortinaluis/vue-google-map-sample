<template>
  <div class="my-google-map">
    <google-map-loader :api-key="apiKey" :config="config">
      <!--
          This template bellow will be deployed to <slot />
          defined in "components/GoogleMapLoader.vue".
          Notice how "components/GoogleMapLoader.vue"
          provides you newly created "google" and "map" in return.
          Also, notice we are directly passing "spot"
          to "components/Spot.vue".
        -->
      <template slot-scope="{ google, map }">
        <spot v-for="(spot,i) in spots" :key="i" :google="google" :map="map" :spot="spot" />
      </template>
    </google-map-loader>
  </div>
</template>

<script>
/* eslint no-unused-vars: [1] */
import GoogleMapLoader from '@/components/GoogleMapLoader.vue';
import Spot from '@/components/Spot.vue';

const API_KEY = 'AIzaSyDtDdWEh0tzu4bbIic4Sa68iPOgYbkF3h8';
const CENTER_SPOT = { name: 'Raffles Hotel', lat: 1.2953139, lng: 103.8524867 };
const DEFAULT_ZOOM = 16;
const SPOT_LIST = [
  { name: 'Blu Jaz', lat: 1.3006019, lng: 103.8587765 },
  { name: 'Candour Coffee', lat: 1.2960791, lng: 103.8557405 },
  { name: 'Book Point', lat: 1.2969103, lng: 103.8525092 },
];

export default {
  name: 'MyGoogleMap',
  data() {
    return {
      apiKey: API_KEY,
      spots: SPOT_LIST,
      config: {
        zoom: DEFAULT_ZOOM,
        center: CENTER_SPOT,
      },
    };
  },
  components: {
    GoogleMapLoader,
    Spot,
  },
};
</script>
