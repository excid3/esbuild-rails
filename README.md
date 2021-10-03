# 🛤 esbuild-rails

Rails plugin for Esbuild for easy imports of Stimulus controllers, ActionCable channels, and other Javascript.

This package is designed to be used with [jsbundling-rails](https://github.com/rails/jsbundling-rails).

## ⚙️ Installation

Install with npm or yarn

```bash
yarn add esbuild-rails
```

```bash
npm i esbuild-rails
```

Add the plugin to `esbuild.config.js`

```javascript
const path = require('path')
const rails = require('esbuild-rails')

require("esbuild").build({
  entryPoints: ["application.js"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  watch: process.argv.includes("--watch"),
  plugins: [rails()],
}).catch(() => process.exit(1))
```

## 🧑‍💻 Usage

Import a folder using globs:

```javascript
import "./src/**/*"
```

Import Stimulus controllers and register them:

```javascript
import { Application } from "@hotwired/stimulus"
const application = Application.start()

import controllers from "./**/*_controller.js"
controllers.forEach((controller) => {
  application.register(controller.name, controller.module.default)
})
```

Import ActionCable channels:

```javascript
import "./channels/**/*_channel.js"
```

## 🙏 Contributing

If you have an issue you'd like to submit, please do so using the issue tracker in GitHub. In order for us to help you in the best way possible, please be as detailed as you can.


## 📝 License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
