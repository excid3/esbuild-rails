const path = require('path')
const fg = require('fast-glob')

// Transform filenames to controller names
// [ './admin/hello_world_controller.js', ... ]
// [ 'admin--hello-world', ... ]
function convertFilenameToControllerName(filename) {
  return filename
    .replace(/^\.\//, "") // Remove ./ prefix
    .replace(/_controller.[j|t]s$/, "") // Strip _controller.js extension
    .replace(/\//g, "--") // Replace folders with -- namespaces
    .replace(/_/g, '-') //
}

// This plugin adds support for globs like "./**/*" to import an entire directory
// We can use this to import arbitrary files or Stimulus controllers and ActionCable channels
const railsPlugin = (options = { matcher: /.+\..+/ }) => ({
  name: 'rails',
  setup: (build) => {
    build.onResolve({ filter: /\*/ }, async (args) => {
      if (args.resolveDir === '') {
        return; // Ignore unresolvable paths
      }

      return {
        // make sure that imports are properly scoped to directories that are requested from
        // otherwise results get overwritten
        path: path.resolve(args.resolveDir, args.path),
        namespace: 'rails',
        pluginData: {
          path: args.path,
          resolveDir: args.resolveDir,
        },
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'rails' }, async (args) => {
      // Get a list of all files in the directory
      let files = (
        fg.sync(args.pluginData.path, {
          cwd: args.pluginData.resolveDir,
        })
      )

      // Filter to match the import
      files = files.sort().filter(path => options.matcher.test(path));
      const controllerNames = files.map(convertFilenameToControllerName)

      const importerCode = `
        ${files
          .map((module, index) => `import * as module${index} from './${module}'`)
          .join(';')}
        const modules = [${controllerNames
          .map((module, index) => `{name: '${module}', module: module${index}, filename: '${files[index]}'}`)
          .join(',')}]
        export default modules;
      `;

      return { contents: importerCode, resolveDir: args.pluginData.resolveDir };
    });
  },
});

module.exports = railsPlugin
