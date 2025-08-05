import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	base: process.env.NODE_ENV === 'production' ? '/msw-controller/' : '/',
	plugins: [
		react({
			jsxRuntime: "automatic",
		}),
	],
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: "dist",
	},
	// 优化依赖预构建
	optimizeDeps: {
		include: ["react", "react-dom"],
	},
});
