const path = require('path')
const glob = require('glob').sync

// This plugin adds support for globs like "./**/*" to import an entire directory
// We can use this to import arbitrary files or Stimulus controllers and ActionCable channels
const railsPlugin = (options = {}) => ({
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
      const files = (
        glob(args.pluginData.path, {
          cwd: args.pluginData.resolveDir,
        })
      ).sort().filter(path => path.endsWith('.js'));

      const importerCode = `
        ${files
          .map((module, index) => `import * as module${index} from '${module}'`)
          .join(';')}
        const modules = [${files
          .map((module, index) => `module${index}`)
          .join(',')}];
        export default modules;
        export const filenames = [${files
          .map((module) => `'${module}'`)
          .join(',')}]
      `;

      return { contents: importerCode, resolveDir: args.pluginData.resolveDir };
    });
  },
});

module.exports = railsPlugin
