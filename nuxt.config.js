export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: "Crime Spotter",
        htmlAttrs: {
            lang: "en"
        },
        meta: [
            { charset: "utf-8" },
            { hid: "description", name: "description", content: "" },
            { name: "viewport", content: "width=device-width, initial-scale=1, minimum-scale=1"}
        ],
        link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
        script: [{
            src: "/script/speak.js"
        }]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: ["~/plugins/injects",
                { src: "~/plugins/actioncable", ssr: false },
                { src: "~/plugins/vuechartjs", ssr: false },
                "~/plugins/debounce"
            ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/typescript
        "@nuxt/typescript-build",
        // https://go.nuxtjs.dev/tailwindcss
        "@nuxtjs/tailwindcss"
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        "@nuxt/http",
        "@nuxtjs/proxy",
        "nuxt-leaflet", ["nuxt-tailvue", { toast: true }]
    ],

    // ! FIX PURGE AFTER PROJECT FINISHES
    purgeCSS: {
        enabled: false
    },

    http: {
        proxy: true
    },

    proxy: {
        "/api": {
            target: "https://crime-spotter-backend.herokuapp.com/",
            pathRewrite: { "^/api": "" }
        },
        "/external/ip": {
            target: "http://ip-api.com/json/",
            pathRewrite: { "^/external/ip": "" }
        }
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        postcss: {
            preset: {
                features: {
                    // Fixes: https://github.com/tailwindcss/tailwindcss/issues/1190#issuecomment-546621554
                    "focus-within-pseudo-class": false
                }
            }
        }
    },

    server: {
        host: "0.0.0.0",
        port: process.env.PORT || 80
    }
};