# esbuild-rails

Rails plugin for Esbuild to help loading Stimulus controllers, ActionCable channels, and other Javascript.

## Usage

Install with npm or yarn

```bash
yarn add esbuild-rails
```

```bash
npm i esbuild-rails
```

Add the plugin to `esbuild.config.js`

```javascript
const rails = require('esbuild-rails');

require("esbuild").build({
  entryPoints: ["application.js"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  watch: watch,
  plugins: [rails()],
}).catch(() => process.exit(1));
```
