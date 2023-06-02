[![npm version](https://badge.fury.io/js/esbuild-rails.svg)](https://badge.fury.io/js/esbuild-rails)

# 🛤 esbuild-rails

Esbuild Rails plugin for easy imports of Stimulus controllers, ActionCable channels, and other Javascript.

This package is designed to be used with [jsbundling-rails](https://github.com/rails/jsbundling-rails).

## ⚙️ Installation

Install with npm or yarn

```bash
yarn add esbuild-rails
```

```bash
npm i esbuild-rails
```

Copy `examples/esbuild.config.mjs` to your git repository or use the following example config:

```javascript
const path = require('path')
const rails = require('esbuild-rails')

require("esbuild").build({
  entryPoints: ["application.js"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  plugins: [rails()],
}).catch(() => process.exit(1))
```

Use npm to add it as the build script (requires npm `>= 7.1`)

```sh
npm set-script build "node esbuild.config.js"
```

or add it manually  in `package.json`

```javascript
"scripts": {
  "build": "node esbuild.config.mjs"
}
```

## 🧑‍💻 Usage

Import a folder using globs:

```javascript
import "./src/**/*"
```

#### Import Stimulus controllers and register them:

```javascript
import { Application } from "@hotwired/stimulus"
const application = Application.start()

import controllers from "./**/*_controller.js"
controllers.forEach((controller) => {
  application.register(controller.name, controller.module.default)
})
```

#### Importing Stimulus controllers from parent folders (ViewComponents, etc)

To import Stimulus controllers from parents in other locations, create an `index.js` in the folder that registers controllers and import the `index.js` location.

For example, we can import Stimulus controller for ViewComponents by creating an `app/components/index.js` file and importing that in your main Stimulus controllers index.

```javascript
// app/javascript/controllers/index.js
import { application } from "./application"

// Import app/components/index.js
import "../../components"
```

```javascript
// app/components/index.js
import { application } from "../javascript/controllers/application"

import controllers from "./**/*_controller.js"
controllers.forEach((controller) => {
  application.register(controller.name, controller.module.default)
})
```

#### Import ActionCable channels:

```javascript
import "./channels/**/*_channel.js"
```

#### jQuery with esbuild:

```bash
yarn add jquery
```

```javascript
// app/javascript/jquery.js
import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery;
```

```javascript
//app/javascript/application.js
import "./jquery"
```

Why does this work? `import` in Javascript is hoisted, meaning that `import` is run _before_ the other code regardless of where in the file they are. By splitting the jQuery setup into a separate `import`, we can guarantee that code runs first. Read more [here](https://exploringjs.com/es6/ch_modules.html#_imports-are-hoisted).

#### jQuery UI with esbuild:

Follow the jQuery steps above.

Download [jQuery UI custom build](https://jqueryui.com/download/) and add it to `app/javascript/jquery-ui.js`

```javascript
import "./jquery-ui"

$(function() {
  $(document).tooltip()
  $("#dialog").dialog()
})
```

A custom build is required because jQueryUI does not support ESM.

## 🙏 Contributing

If you have an issue you'd like to submit, please do so using the issue tracker in GitHub. In order for us to help you in the best way possible, please be as detailed as you can.

## 📝 License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
