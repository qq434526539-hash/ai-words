import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.local.aiwords",
  appName: "AI Words",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
