export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: "crime-frontend",
        htmlAttrs: {
            lang: "en"
        },
        meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { hid: "description", name: "description", content: "" }
        ],
        link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: ["~/plugins/injects"],

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

    http: {
        proxy: true
    },

    proxy: {
        "/api": "https://crime-spotter-backend.herokuapp.com/",
        "/external/ip": {
            target: "http://ip-api.com/json/",
            pathRewrite: { "^/external/ip": "" }
        }
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {},

    server: {
        host: "0.0.0.0",
        port: process.env.PORT || 80
    }
};