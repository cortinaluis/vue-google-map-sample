# vue-google-map-sample

vue-cli + Google Map + d3 (for SVG overlay example)

## 1. Overview

### What I did

1. Using [vue-cli (v3.0)](https://github.com/vuejs/vue-cli) to create a skeltal project.
2. Setup Google Map using [google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader).
3. Using [d3 (v5)](https://d3js.org/) to plot an overlay layer as SVG.

### More on What I actually did

Here is how `view/map/template.html` looks like:

```
<div class="my-google-map">
    <google-map-loader :api-key="apiKey" :config="config">
        <template slot-scope="{ google, map }">
            <spot v-for="(spot,i) in spots" :key="i" :google="google" :map="map" :spot="spot" />
            <map-overlay-test :google="google" :map="map" />
        </template>
    </google-map-loader>
</div>
```

Because we want to wait for Google Map API to be ready,
we use the component `component/google_map_loader`,
which is basically a wrapper for [google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader)
with its template providing a simple slot like this:

```
<div class="google-map-loader">
    <div id="map"></div>
    <template v-if="!!this.google && !!this.map">
        <slot :google="google" :map="map" />
    </template>
</div>
```

Where its `<slot>` passing slot properties, namely "google" and "map",
back to `view/map/template.html`.  
As you can see, within `view/map/template.html`,
it is utilizing the provided `google` and `map`,
this time, to two of the following child components:

1. **&lt;spot&gt;** (which is defined in `components/spot`)
2. **&lt;map-overlay-test&gt;** (which is defined in `components/map_overlay_test`)

For the former iterates an array, called `spots`,
for each the location is rendered as a marker within `components/spot`.

For the later, when `google` and `map` is given,
adds a new Google Overlay View to the map,
and projects a SVG rendered overlay of certain places:

```
export default {
  name: 'map-overlay-test',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
  },
  mounted() {
    const self = this;
    const overlay = new this.google.maps.OverlayView();
    overlay.setMap(this.map);
    overlay.onAdd = function onAdd() {
      d3.select(this.getPanes().overlayLayer).append('div').attr('class', 'mLayer');
      this.draw = drawFactory(self.google);
    };
  },
};
```

### Sample Geo-Coordinates for d3 SVG Overlay

For a given coordinates defined in a `geojson` file,
projects them as SVG using [d3 v5](https://d3js.org/) on a Google Overlay layer.  
Currently has three of the following spots (in Singapore) for the overlay.

```
Bugis MRT: 103.8534648, 1.3008724
Raffles Hotel: 103.8522904, 1.2948883
Blu Jaz Cafe: 103.8567434, 1.3006284
```

### Tips + More Details

#### (a) d3 v4 uses "stream"

[Since v4, d3 uses "stream" for all the map projection handlings](https://github.com/d3/d3-geo#streams).  
Hence, the following projection convertor being used for path generator:  
(found in `components/map_overlay_test/index.js`)

```
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
```

and this is where the above is in use:

```
const projection = this.getProjection();
const projector = projectorFactory(google, projection, { padding: DEFAULT_PADDING_SIZE });
const pathGenerator = d3.geoPath().projection(projector);
```

#### (b) Delete SVG element upon every "draw"

Notice, we have the following:  
(found in `components/map_overlay_test/index.js`)

```
const layer = d3.select('.mLayer');
layer.select('.msvg').remove();
```

Where `.msvg` is my arbituary class name given to the overlay &lt;svg&gt; element we have.  
I'm deleting the &lt;svg&gt; element everytime the overlay is updated,
because otherwise, the overlay remains when we drag the map around.



## 2. Notes

### Installed Node Modules

```
npm install --save google-maps-api-loader
npm install --save d3
npm install --save ramda

npm install --save-dev json-loader
npm install --save-dev html-loader
```

### Importing Files

#### *.geojson

To utilize any `*.geojson` file at build time, we need `json-loader`.  
Also, needs the following in `vue.config.js`.  
(create new `vue.config.js` if you haven't created one)

```
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.geojson$/,
          loader: 'json-loader',
        },
      ],
    },
  },
};
```

#### *.html

Since I use separate "html" and "css" files instead of using `*.vue` files  
for Vue components, I need `html-loader`.
Also, you need the following in your `vue.config.js` file.

```
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.html$/,
          loader: 'html-loader',
          // include: [resolve('src')],
          options: {
            minimize: false
          }
        },
      ],
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
      }
    },
  },
};
```

#### *.styl

Importing `*.styl` should work just fine without any changes on your build settings.


