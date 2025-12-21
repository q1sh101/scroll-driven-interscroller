import { defineConfig } from 'vite';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import nunjucks from 'vite-plugin-nunjucks';

export default defineConfig({
  plugins: [
    tailwindcss(),
    nunjucks({
      templatesDir: path.resolve(process.cwd(), 'src/html'),
      nunjucksConfigure: { noCache: true }
    }),
    {
      name: 'move-public-to-assets',
      closeBundle() {
        const buildDir = path.resolve('dist');
        const assetsDir = path.resolve('dist/assets');
        
        // Ensure assets directory exists
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }
        
        // Move public folders to assets
        const publicFolders = ['images', 'fonts']; // Add any other public folders you have
        
        publicFolders.forEach(folder => {
          const sourcePath = path.resolve(buildDir, folder);
          const targetPath = path.resolve(assetsDir, folder);
          
          if (fs.existsSync(sourcePath)) {
            // Move folder to assets
            if (fs.existsSync(targetPath)) {
              fs.rmSync(targetPath, { recursive: true, force: true });
            }
            fs.renameSync(sourcePath, targetPath);
          }
        });
        
        // HTML paths
        const htmlPath = path.resolve('dist/index.html');
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, 'utf8');
          
          // Remove module attributes
          html = html.replace(/\s*type="module"/g, '');
          html = html.replace(/\s*crossorigin/g, '');
          
          // asset paths to relative
          html = html.replace(/src="\/assets\//g, 'src="assets/');
          html = html.replace(/href="\/assets\//g, 'href="assets/');
          
          // public file paths - move them to assets folder
          publicFolders.forEach(folder => {
            const regex = new RegExp(`(src|href)="${folder}/`, 'g');
            html = html.replace(regex, `$1="assets/${folder}/`);
          });
          
          // CSS background image paths in Tailwind classes
          html = html.replace(/url\(['"]\.\.\/\.\.\/images\//g, "url('assets/images/");
          html = html.replace(/url\(['"]images\//g, "url('assets/images/");
          html = html.replace(/url\(['"]fonts\//g, "url('assets/fonts/");
          
          fs.writeFileSync(htmlPath, html);
          console.log('Fixed HTML paths to point to assets/');
        }
        
        // CSS font paths
        const cssDir = path.resolve('dist/assets/css');
        if (fs.existsSync(cssDir)) {
          const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
          
          cssFiles.forEach(cssFile => {
            const cssPath = path.resolve(cssDir, cssFile);
            let css = fs.readFileSync(cssPath, 'utf8');

            // font paths with multiple regex patterns
            css = css.replace(/url\(\/fonts\//g, "url(../fonts/");
            css = css.replace(/url\(['"]\/fonts\//g, "url('../fonts/");
            css = css.replace(/url\(\"\/fonts\//g, "url(\"../fonts/");
            css = css.replace(/url\('\/fonts\//g, "url('../fonts/");
            
            // images paths too
            css = css.replace(/url\(\/images\//g, "url(../images/");
            css = css.replace(/url\(['"]\/images\//g, "url('../images/");

            fs.writeFileSync(cssPath, css);
          });
        }
      }
    }
  ],
  root: '.',
  publicDir: 'public',
  server: { open: true },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0];
          if (/\.(css)$/.test(name ?? '')) return 'assets/css/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  }
});