# vue-google-map-sample

vue-cli + Google Map + d3 (for SVG overlay example)

## 1. Overview

### What I did

1. Using [vue-cli (v3.0)](https://github.com/vuejs/vue-cli) to create a skeltal project.
2. Setup Google Map using [google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader).
3. Using [d3 (v5)](https://d3js.org/) to plot an overlay layer as SVG.

### More on What I actually did

Here is how the template for `view/map` look like:

```
<div id="map">
    <google-map-loader :map-elem-id="mapElemId" :api-key="apiKey" :config="config" :isReady="isReady">
        <template slot="map-base">
            <div v-bind:id="mapElemId" />
        </template>
        <template slot="map-others" slot-scope="{ google, map }">
            <spot v-for="(spot,i) in spots" :key="i" :google="google" :map="map" :spot="spot" />
            <map-overlay-test :google="google" :map="map" />
        </template>
    </google-map-loader>
</div>
```

Notice, we have 2 templates for *slots* that are defined in `components/google_map_loader`.  
Within `components/google_map_loader`, we have the corresponding slots:

```
<div id="google-map-loader">
    <slot name="map-base"></slot>
    <template v-if="!!this.google && !!this.map">
        <slot name="map-others" :google="google" :map="map" />
    </template>
</div>
```

The job for `components/google_map_loader` is to simply render a Google Map.
It is basically a wrapper for [google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader).
By having `components/google_map_loader` as a separate component,
we can automatically wait for whenever the map is ready.

Let's take a closer look at `view/map` template again.  
As the wrapper component is ready, it is now ready to export its 2 props: `google` and `map`  
For which, `view/map` can receive, using &lt;slot-scope&gt;, these newly created props.  
Like this:

```
        <template slot-scope="{ google, map }">
            <spot v-for="(spot,i) in spots" :key="i" :google="google" :map="map" :spot="spot" />
            <map-overlay-test :google="google" :map="map" />
        </template>
```

Notice also, as it receives `google` and `map` from the wrapper component,
it is now *bypassing* these 2 props, this time, to two of the following child components:

- `components/spot`
- `components/map-overlay-test`

For the former, iterates an array, called `spots`,
each of which contains geo-coordinates for a certain spot,
and is rendered into a marker on the map
according to the rules defined in `components/spot`.

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
    const { google, map } = this;
    makeOverlaySimple({ google, map });
    makeOverlaySingaporeCentral({ google, map });
  },
};
```

Bellow is just an example to illustrate how the d3 overlay is created:

```
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
      const options = { padding: DEFAULT_PADDING_SIZE };
      const pathGenerator = pathGeneratorFactory({ google, projection, options });
      g.selectAll('path')
        .data(data[key])
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .attr('class', getPathName(key))
        .style('fill', fill)
        .style('opacity', opacity);
    };
    return { ...o, key, draw };
  },
);
```


### Tips + More

#### (a) d3 v4 uses "stream"

[Since v4, d3 uses "stream" for all the map projection handlings](https://github.com/d3/d3-geo#streams).
Hence, we need the following function (found in `components/map_overlay_test/index.js`)
to convert (1) coodinates to a stream, and (2) stream to d3 path:

```
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
```

and bellow is where the above function is in use:

```
const projection = this.getProjection();
const projector = projectorFactory({ google, projection });
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


