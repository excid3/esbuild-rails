const path = require('path')
const { globSync } = require('glob')

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
      // [ 'accounts_controller.js', ... ]
      let files = (
        globSync(args.pluginData.path, {
          cwd: args.pluginData.resolveDir,
        })
      )

      // Filter to match the import
      files = files.sort().filter(path => options.matcher.test(path));

      // Transform to controller names
      // [ 'accounts', ... ]
      const controllerNames = files
          .map((module) => module
            .replace(/_controller.[j|t]s$/, "")
            .replace(/^controllers\//, "") // do not namespace controllers in controllers directory
            .replace(/\.\.\//, "") // do not use parent folder anotation for controller name
            .replace(/\//g, "--")
            .replace(/_/g, '-')
          )

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
