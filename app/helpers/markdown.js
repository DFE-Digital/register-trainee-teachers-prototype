const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { marked } = require('marked')
const { gfmHeadingId } = require('marked-gfm-heading-id')

// Configure marked with GitHub Flavored Markdown heading IDs
marked.use(gfmHeadingId())

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false
})

/**
 * Reads and parses a markdown file with frontmatter
 * @param {string} filePath - Absolute path to the markdown file
 * @returns {Object} Object containing frontmatter data and rendered HTML
 */
const parseMarkdownFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    const html = marked(content)

    return {
      frontmatter: data,
      html,
      content
    }
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error)
    throw error
  }
}

/**
 * Gets all markdown files in a directory
 * @param {string} dirPath - Absolute path to the directory
 * @param {string} [extension='.md'] - File extension to look for
 * @returns {Array} Array of file paths
 */
const getMarkdownFiles = (dirPath, extension = '.md') => {
  try {
    const files = fs.readdirSync(dirPath)
    return files
      .filter(file => file.endsWith(extension) || file.endsWith('.html.md'))
      .map(file => path.join(dirPath, file))
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

/**
 * Gets all subdirectories in a directory
 * @param {string} dirPath - Absolute path to the directory
 * @returns {Array} Array of directory names
 */
const getSubdirectories = (dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
    return items
      .filter(item => item.isDirectory())
      .map(item => item.name)
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

/**
 * Builds navigation items from markdown files in a directory
 * @param {string} dirPath - Absolute path to the directory
 * @param {string} baseUrl - Base URL for the links
 * @param {string} [currentPath] - Current path to determine active state
 * @returns {Array} Array of navigation items
 */
const buildNavigationFromFiles = (dirPath, baseUrl, currentPath = '') => {
  const files = getMarkdownFiles(dirPath)

  return files.map(filePath => {
    const { frontmatter } = parseMarkdownFile(filePath)
    const fileName = path.basename(filePath, '.html.md').replace('.md', '')
    const href = fileName === 'index' ? baseUrl : `${baseUrl}/${fileName}`

    return {
      text: frontmatter.title || fileName,
      href,
      weight: frontmatter.weight || 999,
      active: currentPath === href
    }
  }).sort((a, b) => a.weight - b.weight)
}

/**
 * Gets available versions from a documentation directory
 * @param {string} docPath - Path to the documentation directory (e.g., 'docs/api')
 * @param {string} viewsPath - Base views path
 * @returns {Array} Array of version objects with name and path
 */
const getVersions = (docPath, viewsPath) => {
  const fullPath = path.join(viewsPath, docPath)
  const subdirs = getSubdirectories(fullPath)

  // Filter for version directories (e.g., v2025.0)
  const versions = subdirs
    .filter(dir => dir.startsWith('v'))
    .map(dir => ({
      name: dir,
      path: `/${docPath}/${dir}`
    }))
    .sort()
    .reverse() // Most recent version first

  return versions
}

/**
 * Recursively gets all markdown files in a directory tree
 * @param {string} dirPath - Absolute path to the directory
 * @param {string} baseUrl - Base URL for the links
 * @param {string} basePath - Base path to calculate relative paths
 * @returns {Array} Array of navigation items with nested structure
 */
const getAllMarkdownFilesRecursive = (dirPath, baseUrl, basePath) => {
  const items = []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    // First, process markdown files in the current directory
    const markdownFiles = entries
      .filter(entry => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.html.md')))
      .map(entry => {
        const filePath = path.join(dirPath, entry.name)
        try {
          const { frontmatter } = parseMarkdownFile(filePath)
          const fileName = entry.name.replace('.html.md', '').replace('.md', '')

          // Calculate relative path from basePath
          const relativePath = path.relative(basePath, dirPath)
          const urlPath = relativePath ? `${baseUrl}/${relativePath}` : baseUrl
          const href = fileName === 'index' ? urlPath : `${urlPath}/${fileName}`

          return {
            text: frontmatter.title || fileName,
            href: href.replace(/\\/g, '/'), // Normalize path separators
            weight: frontmatter.weight || 999,
            isFile: true
          }
        } catch (error) {
          return null
        }
      })
      .filter(item => item !== null)

    items.push(...markdownFiles)

    // Then, process subdirectories
    const subdirs = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))

    for (const subdir of subdirs) {
      const subdirPath = path.join(dirPath, subdir.name)
      const subdirItems = getAllMarkdownFilesRecursive(subdirPath, baseUrl, basePath)

      if (subdirItems.length > 0) {
        items.push({
          text: subdir.name,
          items: subdirItems,
          isDirectory: true
        })
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }

  return items.sort((a, b) => (a.weight || 999) - (b.weight || 999))
}

module.exports = {
  parseMarkdownFile,
  getMarkdownFiles,
  getSubdirectories,
  buildNavigationFromFiles,
  getVersions,
  getAllMarkdownFilesRecursive
}
