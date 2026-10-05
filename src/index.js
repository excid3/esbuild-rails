const path = require('path')
const { globSync } = require('tinyglobby')

const GLOB_CHARACTER = /[*?[\]{}()]/

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

// The leading segments of a pattern before the first glob character
// './controllers/**/*_controller.js' => './controllers'
function staticBase(pattern) {
  const segments = pattern.split('/')
  return segments.slice(0, segments.findIndex(segment => GLOB_CHARACTER.test(segment))).join('/') || '.'
}

// Paths are built from the pattern's static base as written, the way fast-glob returned them
// [ './controllers/hello_controller.js', '../javascript/controllers/hello_controller.js', ... ]
function glob(pattern, cwd) {
  const base = staticBase(pattern)
  return globSync(pattern, { cwd, absolute: true }).map(file => {
    const relative = path.relative(path.resolve(cwd, base), file).split(path.sep).join('/')
    return base === '.' ? relative : `${base}/${relative}`
  })
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
      let files = glob(args.pluginData.path, args.pluginData.resolveDir)

      const watchedDirs = new Set();
      watchedDirs.add(args.pluginData.resolveDir);

      // Filter to match the import
      files = files.sort().filter(path => options.matcher.test(path));
      
      // Add directories of matched files to watchedDirs
      files.forEach(file => {
        const dir = path.dirname(path.resolve(args.pluginData.resolveDir, file));
        watchedDirs.add(dir);
      });

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

      return { contents: importerCode, resolveDir: args.pluginData.resolveDir, watchDirs: Array.from(watchedDirs) };
    });
  },
});

module.exports = railsPlugin
