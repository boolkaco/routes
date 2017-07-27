'use strict';

module.exports = {
    entry: ["./public/js/init.js",
        "./public/js/switch.js",
        "./public/js/language-popup.js",
        "./public/js/contact-form.js",
        ],
    output: {
        filename: "./public/js/build.js"
    },

    watch: true,
    devtool: "source-map",
    module: {
        loaders: [{
            test: /\.js/,
            loader: 'babel'
        },
            {
                test: /\.json/,
                loader: 'json'
            }]

    }
};