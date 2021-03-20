import { NuxtTestOptions } from "@nuxt/test-utils";
import path from "path";

export default (): Partial<NuxtTestOptions> => {
    return {
        server: true,
        setupTimeout: 300000,
        fixture: path.resolve(__dirname, "../"),
        rootDir: path.resolve(__dirname, "../"),
        config: {
            plugins: [
                path.resolve(__dirname, "../plugins/injects"),
                { src: path.resolve(__dirname, "../plugins/actioncable"), ssr: false }
            ],
            components: true,
            buildModules: ["@nuxt/typescript-build", "@nuxtjs/tailwindcss"],

            modules: [
                "@nuxt/http",
                "@nuxtjs/proxy",
                "nuxt-leaflet", ["nuxt-tailvue", { toast: true }]
            ],
            purgeCSS: {
                enabled: false
            },
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
            build: {
                postcss: {
                    preset: {
                        features: {
                            "focus-within-pseudo-class": false
                        }
                    }
                }
            },
            server: {
                host: "0.0.0.0",
                port: process.env.PORT || 80
            }
        }
    };
};