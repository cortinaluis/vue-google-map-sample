# vue-google-map-sample

vue-cli + Google Map + d3 (as an verlay sample)

## 1. Description

### 1-1. vue-cli

First, using "vue-cli" v3.0 to create a skeltal project.  
Second, setup Google Map using "google-maps-api-loader".  
Finally, using "d3" v5 to plot an overlay layer as SVG.

### 1-2. About Google Overlay + d3 SVG features

For a given coordinates defined in a `geojson` file,
projects them as SVG using d3 v5 on a Google Overlay layer.  
Currently has three of the following spots (in Singapore) for the overlay.

```
Bugis MRT: 103.8534648, 1.3008724
Raffles Hotel: 103.8522904, 1.2948883
Blu Jaz Cafe: 103.8567434, 1.3006284
```

## 2. Notes

### 2-1. Installed Node Modules

```
npm install --save google-maps-api-loader
npm install --save d3
npm install --save ramda

npm install --save-dev json-loader
npm install --save-dev html-loader
```

### 2-2. Files Handling

#### (a) *.geojson

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

#### (b) *.html

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

#### (c) *.styl

Importing `*.styl` should work just fine without any changes on your build settings.


