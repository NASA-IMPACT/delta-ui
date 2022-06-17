const { Resolver } = require('@parcel/plugin');
const { default: ThrowableDiagnostic } = require('@parcel/diagnostic');
const path = require('path');
const fs = require('fs-extra');
const fg = require('fast-glob');
const matter = require('gray-matter');
const hash = require('object-hash');

function loadDeltaConfig() {
  try {
    const configPath = fs.realpathSync(process.env.DELTA_CONFIG_PATH);
    return {
      configPath,
      result: require(configPath),
      root: path.dirname(configPath)
    };
  } catch (error) {
    const configPath = fs.realpathSync(
      path.join(__dirname, '../mock/delta.config.js')
    );
    return {
      isDev: true,
      configPath: configPath,
      result: require(configPath),
      root: path.dirname(configPath)
    };
  }
}

async function loadOptionalContent(logger, root, globPath, type) {
  try {
    const loadPath = path.resolve(root, globPath);
    const paths = await fg(loadPath);
    const data = await Promise.all(
      paths.map(async (p) => {
        const content = await fs.readFile(p, 'utf-8');
        let frontMatterData;
        try {
          // Pass an empty options object to avoid data being cached which is a
          // problem if there is an error. When an error happens the data is
          // cached as empty and no error are thrown the second time.
          frontMatterData = matter(content, {}).data;
        } catch (error) {
          logger.error({
            message: error.message,
            codeFrames: [
              {
                filePath: p,
                code: error.mark.buffer,
                codeHighlights: [
                  {
                    start: {
                      line: error.mark.line,
                      column: error.mark.column
                    },
                    end: {
                      line: error.mark.line,
                      column: error.mark.column
                    }
                  }
                ]
              }
            ]
          });
          return null;
        }

        if (!frontMatterData.id) {
          logger.error({
            message: `Missing "id" on ${type} ${path.basename(p)}`,
            hints: ['Add an "id" property to the file\'s frontmatter.']
          });
        }

        if (frontMatterData.published === false) return null;

        return frontMatterData;
      })
    );
    return {
      data: data.filter(Boolean),
      globPath: loadPath,
      filePaths: paths
    };
  } catch (error) {
    logger.warn({
      message: `Path for "${type}" not found. This will result in an empty list.`,
      hints: [`Provide a path for "${type}" in your delta.config.js`]
    });
    return {
      data: [],
      globPath: '',
      filePaths: []
    };
  }
}

/**
 * Stringify the given object so that it can be used in the delta/thematics
 * module.
 *
 * We need to support functions in the yaml frontmatter so that some of the
 * values can be dynamically calculated. This would for example be:
 *
 *   id: some-id
 *   name: Some name
 *   datetime: (date) => date - 5 years // pseudo code
 *
 * Although evaluating functions could be supported by the yaml parser the
 * parcel module resolver must return the module contents as a string and
 * converting javascript back to source is complicated. The solution is to not
 * touch the function code, but instead remove the quotes so it is no longer a
 * string but javascript code. As this is exported as code it will be parsed
 * when the module is imported.
 *
 * This is done in a couple of steps:
 * 1) To define that the text in the yaml is javascript the user has to add `::js`
 *   id: some-id
 *   name: Some name
 *   datetime: ::js (date) => date - 5 years
 *
 * 2) When we're stringifying the frontmatter to json, if we're dealing with a
 *    function we add another ::js at the end. The result is:
 *   '{ "id": "some-id", "name": "Some name", "datetime": "::js (date) => date - 5 years ::js" }'
 *
 * 3) The last step is to use the ::js guards to remove the quotes around the
 *    function. When the module exports this it will be valid javascript code.
 *
 * @param {obj} data The object to stringify.
 * @param {string} filePath The path of the file where the data comes from.
 * @returns string
 */
function stringifyDataFns(data, filePath) {
  const jsonVal = JSON.stringify(data, (k, v) => {
    if (typeof v === 'string') {
      if (v.match(/^(\r|\n\s)*::js/gim)) {
        return `${v} ::js`;
      }

      // Handle file requires
      if (v.startsWith('::file')) {
        const p = v.replace(/^::file ?/, '');
        // file path is relative from the mdx file. Make it relative to this
        // module, so it works with the require.
        const absResourcePath = path.resolve(path.dirname(filePath), p);
        const relResourceFromModule = path.relative(__dirname, absResourcePath);
        // Export as a js expression so that is picked up below.
        return `::js require('${relResourceFromModule}') ::js`;
      }
    }
    return v;
  });

  const regex = new RegExp('(" *::js)(?:(?!::js).)+(::js")', 'gm');
  const matches = jsonVal.matchAll(regex);

  // Stringified version of the string after all replacements.
  let newVal = '';
  // Index of the last match.
  let index = 0;
  for (const match of matches) {
    // Anything before the match is left as is.
    newVal += jsonVal.substring(index, match.index);
    // Store the last index so we can keep the content from this match till the
    // next match, during the next iteration.
    index = match.index + match[0].length;
    // Replace the ::js indicator and any new lines.
    newVal += match[0]
      .replaceAll(/("::js *| *::js")/gi, '')
      .replaceAll('\\n', '\n');
  }
  // Add the rest from the last match.
  newVal += jsonVal.substring(index);

  return newVal;
}

function generateImports(data, paths) {
  // {
  //   id1: {
  //     data: {},
  //     content: () => MDX
  //   },
  //   id2: {
  //     data: {},
  //     content: () => MDX
  //   }
  // }
  const imports = data
    .map((o, i) =>
      o.id
        ? `'${o.id}': {
          data: ${stringifyDataFns(o, paths[i])},
          content: () => import('${path.relative(__dirname, paths[i])}')
        }`
        : null
    )
    .filter(Boolean);

  return `{
    ${imports.join(',\n')}
  }`;
}

module.exports = new Resolver({
  async resolve({ specifier, logger }) {
    if (specifier.startsWith('delta/thematics')) {
      const { isDev, result, root, configPath } = loadDeltaConfig();

      if (isDev) {
        logger.warn({
          message:
            'Could not find delta.config.js. Currently using development data.',
          hints: [
            'If you are running the UI repo directly this is expected',
            'Otherwise, create a delta.config.js file in your project config root.'
          ],
          documentationURL:
            'https://github.com/NASA-IMPACT/delta-config/blob/develop/docs/CONFIGURATION.md'
        });
      }

      // Load thematics.
      if (!result.thematics) {
        throw new ThrowableDiagnostic({
          diagnostic: {
            message: 'Path for "thematics" not found.',
            hints: ['Provide a path for "thematics" in your delta.config.js']
          }
        });
      }

      // Thematics is not optional, but the check is done above.
      const thematicsData = await loadOptionalContent(
        logger,
        root,
        result.thematics
      );

      const datasetsData = await loadOptionalContent(
        logger,
        root,
        result.datasets,
        'datasets'
      );

      const discoveriesData = await loadOptionalContent(
        logger,
        root,
        result.discoveries,
        'discoveries'
      );
      // Internal fix for dataset layers having the same id so multiple layers from the same dataset can be loaded
      datasetsData.data = datasetsData.data.map((ds) => {
        return {
          ...ds,
          layers: ds.layers.map((layer, idx) => {
            return layer.compare?.idx
              ? {
                  ...layer,
                  compare: {
                    ...layer.compare,
                    uiLayerId: `${layer.compare.layerId}-${hash({ idx })}`
                  },
                  // making hash depending on layer id and index of layer - at least index should be unique
                  uiLayerId: `${layer.id}-${hash({ idx })}`
                }
              : {
                  ...layer,
                  // making hash depending on layer id and index of layer - at least index should be unique
                  uiLayerId: `${layer.id}-${hash({ idx })}`
                };
          })
        };
      });

      // Figure out how to structure:
      // - export thematics, datasets and discoveries with their content. (frontmatter and mdx)
      // - Export list of thematics with datasets and discoveries (only frontmatter)

      const moduleCode = `
        export const thematics = ${generateImports(
          thematicsData.data,
          thematicsData.filePaths
        )};
        export const datasets = ${generateImports(
          datasetsData.data,
          datasetsData.filePaths
        )};
        export const discoveries = ${generateImports(
          discoveriesData.data,
          discoveriesData.filePaths
        )};

        // Create thematics list.
        // Merge datasets and discoveries with respective thematics.
        const toDataArray = (v) => Object.values(v).map(d => d.data);

        export default toDataArray(thematics).map((t) => {
          const filterFn = (d) => d.id && d.thematics?.includes(t.id);
          return {
            ...t,
            datasets: toDataArray(datasets).filter(filterFn),
            discoveries: toDataArray(discoveries).filter(filterFn)
          };
        });
      `;

      // Store the generated code in a file for debug purposed.
      // The generated file will be gitignored.
      fs.writeFile(
        path.join(__dirname, 'delta-thematic.out.js'),
        `/**
 *
 * WARNING!!!
 *
 * This file is the generated output of the delta/thematic resolver.
 * It is meant only or debugging purposes and should not be loaded directly.
 *
*/
${moduleCode}`
      );

      const resolved = {
        // When resolving the mdx files, parcel looks at the parent file to know
        // where to resolve them from and this file has to exist. However if we
        // use a glob for the file path, parcel doesn't complain that the file
        // doesn't exist.
        filePath: path.join(__dirname, '/delta.js'),
        code: moduleCode,
        invalidateOnFileChange: [
          configPath,
          ...thematicsData.filePaths,
          ...datasetsData.filePaths,
          ...discoveriesData.filePaths
        ],
        invalidateOnFileCreate: [
          { filePath: configPath },
          ...[
            { glob: thematicsData.globPath },
            datasetsData.globPath ? { glob: datasetsData.globPath } : null,
            discoveriesData.globPath ? { glob: discoveriesData.globPath } : null
          ].filter(Boolean)
        ]
      };
      // console.log('resolved', resolved);
      return resolved;
    }

    // Let the next resolver in the pipeline handle
    // this dependency.
    return null;
  }
});
