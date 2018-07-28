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

As described above, you can tell the project structure is about the same
as the one [vue-cli (v3.0)](https://github.com/vuejs/vue-cli) originally creates
except for `vue.config` (for separate html loading)
and `.eslintrc.js` (for custom ESLint rules).

Also, I managed to have a directory per component instead of having a single `*.vue` file,
each of such directory holds `index.js`, `template.html`, and `style.styl`.
This is just a matter of preference,
and they both fundamentally work the same.
(some related tips are covered in [3-4. Importing Files](#import_files)).


### 2-1. Installed Node Modules

Bellow are the external NPM modules installed:

```
npm install --save google-maps-api-loader
npm install --save d3
npm install --save ramda

npm install --save-dev json-loader
npm install --save-dev html-loader
```

### 2-2. Google Map, Related Features, and Vue Components

The main discussion here is to how we implement Google Map on Vue projects,
and how we handle map features using [d3](https://d3js.org/).
As for the map feature samples,
I chose "Markers" and "Overlay Layers"
because they are commonly chosen for Google map examples.

Before we move on, let's first take a look at how we load a Google map.

Here's how `view/map` template looks like:

view/map/template.html:

```
<google-map-loader :map-elem-id="mapElemId" :api-key="apiKey" :config="config" :is-ready="isReady">
    <template slot="map-base">
        <div v-bind:id="mapElemId" />
    </template>
    <template slot="map-others" slot-scope="{ google, map }">
        <map-markers-without-d3 :google="google" :map="map" :show="show.markers_without_d3" />
        <map-markers :google="google" :map="map" :show="show.markers" />
        <map-overlay-without-d3 :google="google" :map="map" :show="show.overlay_without_d3" />
        <map-overlay-red-triangle :google="google" :map="map" :show="show.overlay_red_triangle" />
        <map-overlay-singapore :google="google" :map="map" :show="show.overlay_singapore" />
    </template>
</google-map-loader>
```

So, we have `components/google_map_loader` component here.
`components/google_map_loader` is just a wrapper for
[google-maps-api-loader](https://github.com/laurencedorman/google-maps-api-loader),
and it does nothing other than loading a Google map
(although I pass `isReady` function as a prop to this component,
which is totally not necessary, for I'm just using it to find out
whether the map is loaded in order to resize the map when ready)

When `components/google_map_loader` component is loaded,
we really don't have to worry about how we sync the load,
but we basically wait for Vue to do the job for us.

Because we need certain configurations in order to load a Google map,
we pass `mapElemId`, `apiKey`, and `config`.

Notice, within `components/google_map_loader`,
we have 2 slot template defined,
both having names: `map-base` and `map-others`.
They meant to fill the corresponding named-slots
that are defined within  `components/google_map_loader`.

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

Back to `view/map/template.html`,
we notice that &lt;slot-scope&gt; is in use.
When receiving the retruned object from `components/google_map_loader`,
&lt;slot-scope&gt; allows us to destructure the object,
this time, into 2 separate props, namely, `google` and `map`.

Like this:

```
    <template slot="map-others" slot-scope="{ google, map }">
        <map-markers-without-d3 :google="google" :map="map" :show="show.markers_without_d3" />
        <map-markers :google="google" :map="map" :show="show.markers" />
        <map-overlay-without-d3 :google="google" :map="map" :show="show.overlay_without_d3" />
        <map-overlay-red-triangle :google="google" :map="map" :show="show.overlay_red_triangle" />
        <map-overlay-singapore :google="google" :map="map" :show="show.overlay_singapore" />
    </template>
```

Notice also, as we get `google` and `map`,
now it's sort of *bypassing* these 2 props,
to 5 of the following components:

Component 1: `components/map_marker_without_d3`  
Component 2: `components/map_marker`  
Component 3: `components/map_overlay_without_d3`  
Component 3: `components/map_overlay_red_triangle`  
Component 4: `components/map_overlay_singapore`

I could have limit the number of examples,
but I thought it would help you understand better
if I gave you comparisons
between the one *NOT* using d3 and the one using d3.


#### Component 1: "components/map_marker_without_d3"

This is a demonstration just to show you that you can plot markers without d3.

components/map_markers_without_d3/index.js:

```
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
```

#### Component 2: "components/map_markers"

This is an example using d3 (to implement markers on the map).
When `google` and `map` is given, it adds a new Google Overlay layer to the map,
and projects a SVG rendered overlay.

components/map_markers/index.js:

```
export default {
  name: 'map-markers',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  data() {
    return {
      markers: [
        { name: 'Raffles Hotel', lng: 103.8522904, lat: 1.2948883 },
        { name: 'Singapore Botanic Gardens', lng: 103.8137249, lat: 1.3138451 },
        { name: 'Changi Airport Singapore', lng: 103.9893421, lat: 1.3644256 },
      ],
    };
  },
  watch: {
    show(val) {
      const el = document.body.querySelector(`.${layerName(BASE_KEY)}`);
      if (el) {
        el.style.visibility = val ? 'visible' : 'hidden';
      }
    },
  },
  mounted() {
    const { google, map, markers } = this;
    setMarkers({ google, map, markers, show: !!this.show, key: BASE_KEY });
  },
};
```

Just in case you wonder what `setMarkers` does,
here's the definition
(along with some related functions,
but changed the order for the ease of read):

components/map_markers/index.js:  

```
const setMarkers = compose(
  setOverlay,
  (o) => {
    const {
      google, markers, layer_name, svg_name, group_name, group_name_circle,
    } = o || {};
    return {
      ...o,
      draw: function draw() {
        const projection = this.getProjection();
        const translate = translateFactory({ google, projection });
        const layer = d3.select(`.${layer_name}`);
        layer.select(`.${svg_name}`).remove();
        const svg = layer.append('svg').attr('class', svg_name);
        const g = svg.append('g').attr('class', group_name);
        g.selectAll('path')
          .data(markers)
          .enter()
          .append('g')
          .attr('transform', translate)
          .attr('class', group_name_circle)
          .append('circle')
          .attr('r', radius)
          .style('fill', fill)
          .style('opacity', opacity);
        g.selectAll('.label')
          .data(markers)
          .enter()
          .append('text')
          .text(d => d.name)
          .attr('class', 'label')
          .attr('transform', translate)
          .attr('dy', () => '-.5em')
          .attr('fill', label_fill)
          .style('opacity', label_opacity)
          .style('text-anchor', 'middle');
      },
    };
  },
  initOverlay,
);

const initOverlay = (o) => {
  const { key } = o || {};
  return {
    ...o,
    layer_name:         layerName(key),
    svg_name:           svgName(key),
    group_name:         groupName(key),
    group_name_circle:  groupNameCircle(key),
  };
};

const setOverlay = (o) => {
  const { google, map, layer_name, draw, show = false } = o || {};
  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);
  overlay.onAdd = function onAdd() {
    d3.select(this.getPanes().overlayLayer)
      .append('div')
      .attr('class', layer_name)
      .style('position', 'absolute')
      .style('visibility', show ? 'visible' : 'hidden');
    this.draw = draw;
  };
  return o;
};

const translateFactory = ({ google, projection, options }) => (d) => {
  const { padding = DEFAULT_PADDING_SIZE } = options || {};
  const { lat = 0, lng = 0 } = d || {};
  const p = new google.maps.LatLng(lat, lng);
  const { x = 0, y = 0 } = projection.fromLatLngToDivPixel(p) || {};
  return `translate(${x + padding},${y + padding})`;
};
```


#### Component 3: "components/map_overlay_without_d3"

This is another example for the use of Geojson, however, without d3.  
Quite straigt forward, isn't it?

components/map_overlay_without_d3/index.js:

```
export default {
  name: 'map-overlay-without-d3',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  watch: {
    show(val) {
      this.hideOverlay();
      if (val) {
        this.showOverlay();
      }
    }
  },
  mounted() {
    this.hideOverlay();
    if (this.show) {
      this.showOverlay();
    }
  },
  methods: {
    showOverlay() {
      const { map } = this;
      saved = map.data.addGeoJson(data);
      map.data.setStyle(map_style);
    },
    hideOverlay() {
      const { map } = this;
      saved.forEach((coord) => {
        map.data.remove(coord);
      });
    },
  },
};
```


#### Component 4: "components/map_overlay_red_triangle"
#### Component 5: "components/map_overlay_singapore"

When `google` and `map` is given, it adds a new Google Overlay layer to the map,
and projects a SVG rendered overlay,
loading a simple polygon in Geojson format (defined within JS directly)  
(altered the order of definitions for ease of reading)

components/map_overlay_red_triangle/index.js:

```
export default {
  name: 'map-overlay-red-triangle',
  template,
  props: {
    google: Object, // Provided by "components/google_map_loader".
    map: Object, // Provided by "components/google_map_loader".
    show: Boolean, // Given directly from "views/map".
  },
  watch: {
    show(val) {
      const layer_name = layerName(BASE_KEY);
      const el = document.body.querySelector(`.${layer_name}`);
      if (el) {
        el.style.visibility = val ? 'visible' : 'hidden';
      }
    },
  },
  mounted() {
    const { google, map } = this;
    set({ google, map, show: !!this.show, key: BASE_KEY });
  },
};

const set = compose(
  setOverlay,
  drawFactory,
  initOverlay
);

const drawFactory = (o) => {
  const {
    google, layer_name, svg_name, group_name, path_name,
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
        .data(features)
        .enter()
        .append('path')
        .attr('d', projector)
        .attr('class', path_name) // Function deteminines class name by "i" given.
        .style('fill', fill)
        .style('opacity', opacity);
    },
  };
};

const initOverlay = (o) => {
  const { key } = o || {};
  return {
    ...o,
    layer_name:  layerName(key),
    svg_name:    svgName(key),
    group_name:  groupName(key),
    path_name:   pathName(key),
  };
};

const setOverlay = (o) => {
  const { google, map, layer_name, draw, show = false } = o || {};
  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);
  overlay.onAdd = function onAdd() {
    d3.select(this.getPanes().overlayLayer)
      .append('div')
      .attr('class', layer_name)
      .style('position', 'absolute')
      .style('visibility', show ? 'visible' : 'hidden');
    this.draw = draw;
  };
  return o;
};
```


## 3. Tips (on other issues)

### 3-1. Coordinates to "stream", to d3 PATH.

[Since v4, d3 uses "stream" for all the map projection handlings](https://github.com/d3/d3-geo#streams).
Hence, we need the following function to convert (1) coodinates to a stream, and (2) stream to d3 path:

Component 2: `components/map_marker`  
Component 3: `components/map_overlay_red_triangle`  
Component 4: `components/map_overlay_singapore`

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
