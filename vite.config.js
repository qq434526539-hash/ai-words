import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["icon.svg"],
            workbox: {
                runtimeCaching: [{
                        urlPattern: /^https:\/\/api\.dictionaryapi\.dev\/api\/v2\/entries\/en\//,
                        handler: "NetworkFirst",
                        options: { cacheName: "online-dictionary", networkTimeoutSeconds: 5, expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } }
                    }]
            },
            manifest: {
                name: "AI Words",
                short_name: "AI Words",
                description: "个人使用的 AI 英语词汇学习应用",
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/",
                icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
            }
        })
    ],
    resolve: { alias: { "@": "/src" } }
});
