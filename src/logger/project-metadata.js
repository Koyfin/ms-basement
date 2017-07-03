const fs = require('fs')
const path = require('path')

const getProjectMetadata = () => {
  let mainModuleName
  let pathToPackage

  const projectMetadataOnError = { name: 'unknown', version: 'unknown' }

  try {
    mainModuleName = require.main.paths.find((modulesPath) => {
      pathToPackage = path.resolve(modulesPath, '..', 'package.json')
      try {
        fs.accessSync(pathToPackage)
      } catch (e) {
        return false
      }
      return true
    })
  } catch (e) {
    return projectMetadataOnError
  }

  return (mainModuleName)
    // eslint-disable-next-line global-require, import/no-dynamic-require
    ? require(pathToPackage)
    : projectMetadataOnError
}

module.exports = getProjectMetadata()
