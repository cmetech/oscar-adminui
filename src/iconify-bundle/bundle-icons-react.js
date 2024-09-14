const { promises: fs } = require('fs')
const path = require('path')

// Assuming @iconify/react is installed
const component = '@iconify/react'
const commonJS = false

const target = path.join(__dirname, 'src/iconify-bundle/icons-bundle-react.js')

;(async function () {
  let bundle = commonJS
    ? "const { addCollection } = require('" + component + "');\n\n"
    : "import { addCollection } from '" + component + "';\n\n"

  // Create directory for output if missing
  await fs.mkdir(path.dirname(target), { recursive: true }).catch(console.error)

  // Load and process Iconify JSON icons
  const jsonSources = [
    require.resolve('@iconify/json/json/mdi.json'),
    {
      filename: require.resolve('@iconify/json/json/line-md.json'),
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ]

  for (const source of jsonSources) {
    const filename = typeof source === 'string' ? source : source.filename
    const content = JSON.parse(await fs.readFile(filename, 'utf8'))

    // If source defines specific icons, filter them
    if (typeof source !== 'string' && source.icons?.length) {
      const filteredIcons = {}
      for (const icon of source.icons) {
        if (content.icons[icon]) {
          filteredIcons[icon] = content.icons[icon]
        }
      }
      content.icons = filteredIcons
    }

    bundle += `addCollection(${JSON.stringify(content)});\n`
    console.log(`Bundled icons from ${filename}`)
  }

  // Define custom prefixes for each directory
  const svgDirectoryConfigs = [
    { dir: 'src/iconify-bundle/svg', prefix: 'custom-svg' },
    { dir: 'src/iconify-bundle/emojis', prefix: 'emoji' }
  ]

  // Process local SVGs with custom prefixes
  for (const { dir, prefix } of svgDirectoryConfigs) {
    const files = await fs.readdir(dir)
    const svgFiles = files.filter(file => file.endsWith('.svg'))
    const icons = {}

    for (const file of svgFiles) {
      const name = path.basename(file, '.svg')
      const content = await fs.readFile(path.join(dir, file), 'utf8')
      icons[name] = { body: content.replace(/<\?xml.*?\?>|<!DOCTYPE.*?>/g, '') }
    }

    bundle += `addCollection({ prefix: '${prefix}', icons: ${JSON.stringify(icons)} });\n`
    console.log(`Bundled ${svgFiles.length} icons from ${dir} with prefix '${prefix}'`)
  }

  // Save to file
  await fs.writeFile(target, bundle, 'utf8')
  console.log(`Saved ${target} (${bundle.length} bytes)`)
})().catch(console.error)
