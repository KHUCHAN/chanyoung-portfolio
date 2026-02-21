import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom Vite Plugin for local Auto-Save feature
function saveJsonPlugin() {
  return {
    name: 'save-json-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only intercept our specific auto-save API endpoint
        if (req.url === '/api/save-posts' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              // Parse to ensure valid JSON
              const newPagesData = JSON.parse(body);

              const targetFilePath = path.resolve(__dirname, 'src/data/postsData.js');

              // Formatting the JS file nicely
              const fileContent = `export const initialPages = ${JSON.stringify(newPagesData, null, 4)};\n`;

              fs.writeFileSync(targetFilePath, fileContent, 'utf-8');

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Posts data saved successfully to postsData.js' }));
            } catch (error) {
              console.error('Save Auto-JSON Error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), saveJsonPlugin()],
})
