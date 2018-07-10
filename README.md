# vue-google-map-sample

vue-cli + Google Map + d3 (for SVG overlay example)

## 1. Overview

This is a sample project to illustrate the use of Google Map
on [vue-cli](https://github.com/vuejs/vue-cli) generated project.  
Specifically, how to render an overlay layer as SVG using [d3](https://d3js.org/).

[Demo](http://tokyo800.jp/minagawah/vue-google-map-sample/#/map)


## 2. What I did

1. Using [vue-cli (v3.0)](https://github.com/vuejs/vue-cli) to create a skeltal project.
2. Setup Google Map using [google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader).
3. Using [d3 (v5)](https://d3js.org/) to render overlay layers as SVG.

So, the project structure is fairly about the same
compared to the original structure
[vue-cli (v3.0)](https://github.com/vuejs/vue-cli) initally generates
except for `vue.config` (for separate html loading)
and `.eslintrc.js` (for custom ESLint rules).

I also renamed `*.vue` files, and instead created
an independent directory for each component,
each of which stores `index.js`, `template.html`, and `style.styl`.
But, this is no big deal because this is about how it appears
when managing files, and they fundamentally work the same
(some related tips are discussed in [3-4. Importing Files](#import_files)).


### 2-1. Installed Node Modules

```
npm install --save google-maps-api-loader
npm install --save d3
npm install --save ramda

npm install --save-dev json-loader
npm install --save-dev html-loader
```


### 2-2. Google Map, Related Features, and Vue Components

The main discussion here is to how we implement Google Map on Vue projects,
and how we handle map related features using [d3](https://d3js.org/).
For the features, I chose "Markers" and "Overlay Layers".
However, before we go on discussing about this,
let us first take a look at how we load Google Map.
This is how the template for `view/map` look like:

view/map/template.html:

```
<div id="map">
    <google-map-loader :map-elem-id="mapElemId" :api-key="apiKey" :config="config" :is-ready="isReady">
        <template slot="map-base">
            <div v-bind:id="mapElemId" />
        </template>
        <template slot="map-others" slot-scope="{ google, map }">
            <map-marker v-for="(marker,i) in markers" :key="i" :google="google" :map="map" :marker="marker" />
            <map-overlay :google="google" :map="map" />
        </template>
    </google-map-loader>
</div>
```

So, we are loading `components/google_map_loader` here.
Well, `components/google_map_loader` is basically just a wrapper for
[google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader),
and loading Google Map is the only job it's got.
As we load `components/google_map_loader` as a Vue component,
we don't need to worry about how to sync the load,
but it automatically do the job for you.

For `components/google_map_loader` needs configurations in order to load Google Map,
we pass `mapElemId`, `apiKey`, and `config`.
Where `isReady` isn't really necessary, but I'm passing this function
for `components/google_map_loader` to call it upon the map instantiation
and `view/map` can tell when the map is ready (I have some map resizing job).

Notice also, that we have 2 templates defined above for named-slots, `map-base` and `map-others`.
These 2 templates are meant to fill the corresponding
named-slots within in `components/google_map_loader`.  
And, it looks like this:

components/google_map_loader/template.html:

```
<div id="google-map-loader">
    <slot name="map-base"></slot>
    <template v-if="!!this.google && !!this.map">
        <slot name="map-others" :google="google" :map="map" />
    </template>
</div>
```

Let's take a closer look at `view/map/template.html` again.
When `components/google_map_loader` is ready,
it will export 2 props: `google` and `map`.
For `view/map` uses &lt;slot-scope&gt; (with an object destructure)
can now receives these props.  
Like this:

```
        <template slot-scope="{ google, map }">
            <map-marker v-for="(marker,i) in markers" :key="i" :google="google" :map="map" :marker="marker" />
            <map-overlay :google="google" :map="map" />
        </template>
```

Notice also, as it receives `google` and `map` from the wrapper component,
it is now *bypassing* these 2 props, this time, to two of the following child components:

Component 1: `components/map_marker`  
Component 2: `components/map_overlay`

#### Component 1: "components/map_marker"

For this component, `views/map` iterates an array called `markers`,
each of which contains geo-coordinates for a certain marker,
and will be eventually rendered as a marker on the map
according to the implementations defined in `components/map_marker`.

view/map/index.js:

```
const markers = [
  { name: 'Blu Jaz Cafe', lng: 103.8567434, lat: 1.3006284 },
  { name: 'Candour Coffee', lng: 103.8557405, lat: 1.2960791 },
  { name: 'Bugis MRT', lng: 103.8534648, lat: 1.3008724 },
  { name: 'Book Point', lng: 103.8525092, lat: 1.2969103 },
  { name: 'Raffles Hotel', lng: 103.8522904, lat: 1.2948883 },
  { name: 'Singapore Botanic Gardens', lng: 103.8137249, lat: 1.3138451 },
  { name: 'Changi Airport Singapore', lng: 103.9893421, lat: 1.3644256 },
];
```

components/map_marker/index.js:

```
export default {
  name: 'map-marker',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    marker: Object, // Given directly from "views/map".
  },
  data() {
    return { spot: null };
  },
  mounted() {
    const { map } = this;
    const { Marker } = this.google.maps;
    const { name: title, lat, lng } = this.marker || {};
    const position = { lat, lng };
    this.spot = new Marker({ title, map, position });
  },
};
```

#### Component 2: "components/map_overlay"

For this, when `google` and `map` is given,
adds a new Google Overlay layer to the map,
and projects a SVG rendered overlay of certain places:

components/map_overlay/index.js:

```
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
```

Bellow is one of the overlay definitions (among 2 defined)
to show you how d3 SVG overlay is created:

components/overlay_layer/index.js:  
(altered the order of definitions for ease of reading)

```
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

const initOverlay = key => (o = {}) => ({
  ...o,
  ...{
    key,
    layer_name:    getLayerName(key),
    svg_name:      getSvgName(key),
    group_name:    getGroupName(key),
    path_name:     getPathName(key),
    fill:          getFillColor(key),
    stroke:        getStrokeColor(key),
    opacity:       getOpacity(key),
    label_fill:    getLabelFillColor(key),
    label_opacity: getLabelOpacity(key),
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

const getLayerName = key => (key && `layer-${key}`) || 'mlayer';
const getSvgName = key => (key && `svg-${key}`) || 'msvg';
const getGroupName = key => (key && `group-${key}`) || 'mgroup';
const getPathName = key => d => (`path-${key}${(d && d.id && `-${d.id}`) || ''}`);

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

const getLabelFillColor = (mapping => (key => mapping[key]))({
  singapore: '#101010',
});

const getLabelOpacity = (mapping => (key => mapping[key]))({
  singapore: 0.6,
});

```


## 3. Tips (on other issues)

### 3-1. Coordinates to "stream", to d3 PATH.

[Since v4, d3 uses "stream" for all the map projection handlings](https://github.com/d3/d3-geo#streams).
Hence, we need the following function to convert (1) coodinates to a stream, and (2) stream to d3 path:

components/map_overlay/index.js:

```
const projectorFactory = ({ google, projection, options }) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const point = function pointStream(lng, lat) {
    const p = new google.maps.LatLng(lat, lng);
    const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(p) || {};
    this.stream.point(x + padding, y + padding);
  };
  return d3.geoPath().projection(d3.geoTransform({ point }));
};
```

and bellow is where the above function is in use:

```
const projection = this.getProjection();
const projector = projectorFactory({ google, projection });
```

### 3-2. Delete SVG element upon every "draw"

I'm deleting the &lt;svg&gt; element everytime the overlay is updated,
otherwise the overlay remains when we drag the map around.

components/map_overlay/index.js:

```
const layer = d3.select(`.${layer_name}`);
layer.select(`.${svg_name}`).remove();
```


### 3-3. Weird Clipping on Overlay Layer

Look at the bellow description in `components/map_overlay/style.styl`:

```
svg
    position: absolute
    top: -5000px
    left: -5000px
    width: 9000px
    height: 9000px
```

We intentionally shift all the SVG elements by -5000px.
This is to prevent a weird clipping on Google Overlay view
whenever dragging the map around.
At the time we render the actual overlay,
we set "top" and "left" back to the original position by adding 5000px.

```
    this.stream.point(x + padding, y + padding);
```


<a name="import_files"></a>
### 3-4. Importing Files

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


## 4. License

[LICENSE](./LICENSE)
