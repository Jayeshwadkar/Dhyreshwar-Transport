// vite.config.js
import { defineConfig } from "file:///D:/webx71/vishwa/DhayreshwarTransport/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/webx71/vishwa/DhayreshwarTransport/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import mdx from "file:///D:/webx71/vishwa/DhayreshwarTransport/frontend/node_modules/@mdx-js/rollup/index.js";
import pluginRewriteAll from "file:///D:/webx71/vishwa/DhayreshwarTransport/frontend/node_modules/vite-plugin-rewrite-all/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    { enforce: "pre", ...mdx() },
    react({
      include: /\.(mdx|js|jsx|ts|tsx)$/,
      jsxImportSource: "@emotion/react",
      jsxRuntime: "classic"
    }),
    pluginRewriteAll()
  ],
  resolve: {
    alias: [
      { find: "@assets", replacement: "/src/assets" },
      { find: "@components", replacement: "/src/components" },
      { find: "@modules", replacement: "/src/modules" },
      { find: "@redux", replacement: "/src/redux" },
      { find: "@router", replacement: "/src/router" },
      { find: "@services", replacement: "/src/services" },
      { find: "@ui-controls", replacement: "/src/ui-controls" },
      { find: "@style", replacement: "/src/style" }
    ]
  },
  server: {
    port: 5001
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mui/")) {
              return id.toString().split("node_modules/")[1].split("/")[1].toString();
            }
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWJ4NzFcXFxcdmlzaHdhXFxcXERoYXlyZXNod2FyVHJhbnNwb3J0XFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3ZWJ4NzFcXFxcdmlzaHdhXFxcXERoYXlyZXNod2FyVHJhbnNwb3J0XFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93ZWJ4NzEvdmlzaHdhL0RoYXlyZXNod2FyVHJhbnNwb3J0L2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgbWR4IGZyb20gXCJAbWR4LWpzL3JvbGx1cFwiO1xyXG5pbXBvcnQgcGx1Z2luUmV3cml0ZUFsbCBmcm9tIFwidml0ZS1wbHVnaW4tcmV3cml0ZS1hbGxcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgeyBlbmZvcmNlOiBcInByZVwiLCAuLi5tZHgoKSB9LFxyXG4gICAgcmVhY3Qoe1xyXG4gICAgICBpbmNsdWRlOiAvXFwuKG1keHxqc3xqc3h8dHN8dHN4KSQvLFxyXG4gICAgICBqc3hJbXBvcnRTb3VyY2U6IFwiQGVtb3Rpb24vcmVhY3RcIixcclxuICAgICAganN4UnVudGltZTogXCJjbGFzc2ljXCIsXHJcbiAgICB9KSxcclxuICAgIHBsdWdpblJld3JpdGVBbGwoKSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiBbXHJcbiAgICAgIHsgZmluZDogXCJAYXNzZXRzXCIsIHJlcGxhY2VtZW50OiBcIi9zcmMvYXNzZXRzXCIgfSxcclxuICAgICAgeyBmaW5kOiBcIkBjb21wb25lbnRzXCIsIHJlcGxhY2VtZW50OiBcIi9zcmMvY29tcG9uZW50c1wiIH0sXHJcbiAgICAgIHsgZmluZDogXCJAbW9kdWxlc1wiLCByZXBsYWNlbWVudDogXCIvc3JjL21vZHVsZXNcIiB9LFxyXG4gICAgICB7IGZpbmQ6IFwiQHJlZHV4XCIsIHJlcGxhY2VtZW50OiBcIi9zcmMvcmVkdXhcIiB9LFxyXG4gICAgICB7IGZpbmQ6IFwiQHJvdXRlclwiLCByZXBsYWNlbWVudDogXCIvc3JjL3JvdXRlclwiIH0sXHJcbiAgICAgIHsgZmluZDogXCJAc2VydmljZXNcIiwgcmVwbGFjZW1lbnQ6IFwiL3NyYy9zZXJ2aWNlc1wiIH0sXHJcbiAgICAgIHsgZmluZDogXCJAdWktY29udHJvbHNcIiwgcmVwbGFjZW1lbnQ6IFwiL3NyYy91aS1jb250cm9sc1wiIH0sXHJcbiAgICAgIHsgZmluZDogXCJAc3R5bGVcIiwgcmVwbGFjZW1lbnQ6IFwiL3NyYy9zdHlsZVwiIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MDAxLFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQG11aS9cIikpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gaWRcclxuICAgICAgICAgICAgICAgIC50b1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCJub2RlX21vZHVsZXMvXCIpWzFdXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCIvXCIpWzFdXHJcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaWRcclxuICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgIC5zcGxpdChcIm5vZGVfbW9kdWxlcy9cIilbMV1cclxuICAgICAgICAgICAgICAuc3BsaXQoXCIvXCIpWzBdXHJcbiAgICAgICAgICAgICAgLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1UsU0FBUyxvQkFBb0I7QUFDblcsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUNoQixPQUFPLHNCQUFzQjtBQUU3QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxFQUFFLFNBQVMsT0FBTyxHQUFHLElBQUksRUFBRTtBQUFBLElBQzNCLE1BQU07QUFBQSxNQUNKLFNBQVM7QUFBQSxNQUNULGlCQUFpQjtBQUFBLE1BQ2pCLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQSxJQUNELGlCQUFpQjtBQUFBLEVBQ25CO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxFQUFFLE1BQU0sV0FBVyxhQUFhLGNBQWM7QUFBQSxNQUM5QyxFQUFFLE1BQU0sZUFBZSxhQUFhLGtCQUFrQjtBQUFBLE1BQ3RELEVBQUUsTUFBTSxZQUFZLGFBQWEsZUFBZTtBQUFBLE1BQ2hELEVBQUUsTUFBTSxVQUFVLGFBQWEsYUFBYTtBQUFBLE1BQzVDLEVBQUUsTUFBTSxXQUFXLGFBQWEsY0FBYztBQUFBLE1BQzlDLEVBQUUsTUFBTSxhQUFhLGFBQWEsZ0JBQWdCO0FBQUEsTUFDbEQsRUFBRSxNQUFNLGdCQUFnQixhQUFhLG1CQUFtQjtBQUFBLE1BQ3hELEVBQUUsTUFBTSxVQUFVLGFBQWEsYUFBYTtBQUFBLElBQzlDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUNmLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixnQkFBSSxHQUFHLFNBQVMsT0FBTyxHQUFHO0FBQ3hCLHFCQUFPLEdBQ0osU0FBUyxFQUNULE1BQU0sZUFBZSxFQUFFLENBQUMsRUFDeEIsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUNaLFNBQVM7QUFBQSxZQUNkO0FBQ0EsbUJBQU8sR0FDSixTQUFTLEVBQ1QsTUFBTSxlQUFlLEVBQUUsQ0FBQyxFQUN4QixNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQ1osU0FBUztBQUFBLFVBQ2Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
