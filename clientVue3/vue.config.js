const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')



module.exports = {
    chainWebpack: config => {
        config.plugin('polyfills').use(NodePolyfillPlugin)
    },
}