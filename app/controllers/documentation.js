const path = require('path')
const {
  parseMarkdownFile,
  buildNavigationFromFiles,
  getVersions,
  getSubdirectories,
  getAllMarkdownFilesRecursive
} = require('../helpers/markdown')

const VIEWS_PATH = path.join(__dirname, '../views')

/**
 * Renders a documentation page with navigation and version support
 * @param {string} docType - Documentation type (api, csv, reference-data)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} [subPath=''] - Optional sub-path within the doc type
 */
const renderDocPage = (docType, req, res, subPath = '') => {
  try {
    const docBasePath = `docs/${docType}`
    const fullDocPath = subPath ? `${docBasePath}/${subPath}` : docBasePath
    const markdownPath = path.join(VIEWS_PATH, fullDocPath, 'index.md')

    // Parse the markdown file
    const { frontmatter, html } = parseMarkdownFile(markdownPath)

    // Get available versions
    const versions = getVersions(docBasePath, VIEWS_PATH)

    // Build version navigation for appSecondaryNavigation
    const versionNavigation = versions.map(version => ({
      text: version.name,
      href: version.path,
      active: req.path.includes(version.name)
    }))

    // Build comprehensive sub-pages navigation (all markdown files recursively)
    const docDir = path.join(VIEWS_PATH, fullDocPath)
    let allSubPages = []

    if (docType === 'api') {
      // For API docs, get all pages recursively
      allSubPages = getAllMarkdownFilesRecursive(docDir, `/docs/${docType}`, docDir)
        .filter(item => item.href !== `/docs/${docType}`) // Exclude the main index
    } else {
      // For other doc types, use the simple subdirectory-based navigation
      const subdirs = getSubdirectories(docDir)
      allSubPages = subdirs
        .filter(dir => !dir.startsWith('_'))
        .map(dir => {
          const subIndexPath = path.join(docDir, dir, 'index.md')
          try {
            const { frontmatter: subFrontmatter } = parseMarkdownFile(subIndexPath)
            return {
              text: subFrontmatter.title || dir,
              href: `/docs/${docType}/${subPath ? subPath + '/' : ''}${dir}`,
              weight: subFrontmatter.weight || 999
            }
          } catch (error) {
            return null
          }
        })
        .filter(item => item !== null)
        .sort((a, b) => a.weight - b.weight)
    }

    // Determine current section for navigation
    const currentSection = docType

    res.render(`docs/${docType}/index`, {
      pageTitle: frontmatter.title,
      content: html,
      docType,
      currentSection,
      versions,
      versionNavigation,
      allSubPages,
      currentPath: req.path
    })
  } catch (error) {
    console.error(`Error rendering documentation page: ${docType}/${subPath}`, error)
    res.status(404).render('errors/404', {
      pageTitle: 'Page not found'
    })
  }
}

/**
 * Renders a documentation sub-page (versioned or nested pages)
 * @param {string} docType - Documentation type (api, csv, reference-data)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const renderDocSubPage = (docType, req, res) => {
  try {
    // Extract the sub-path from the URL (everything after /docs/{docType}/)
    const subPath = req.params[0] // This captures the wildcard part
    const docBasePath = `docs/${docType}`

    // Build the full path to the markdown file
    let markdownPath = path.join(VIEWS_PATH, docBasePath, subPath)

    // Check if it's a file or directory
    if (!markdownPath.endsWith('.md')) {
      // Try the .md extension first
      const filePathWithExt = markdownPath + '.md'
      const fs = require('fs')
      if (fs.existsSync(filePathWithExt)) {
        markdownPath = filePathWithExt
      } else {
        // Otherwise, assume it's a directory and look for index.md
        markdownPath = path.join(markdownPath, 'index.md')
      }
    }

    // Parse the markdown file
    const { frontmatter, html } = parseMarkdownFile(markdownPath)

    // Get available versions
    const versions = getVersions(docBasePath, VIEWS_PATH)

    // Build version navigation for appSecondaryNavigation
    const versionNavigation = versions.map(version => ({
      text: version.name,
      href: version.path,
      active: req.path.includes(version.name)
    }))

    // Build comprehensive sub-pages navigation
    // For versioned pages, scan from the version directory
    const versionMatch = subPath.match(/^(v[\d.]+)/)
    const scanPath = versionMatch
      ? path.join(VIEWS_PATH, docBasePath, versionMatch[1])
      : path.join(VIEWS_PATH, docBasePath)

    let allSubPages = []

    if (docType === 'api' && versionMatch) {
      // For API docs, get all pages recursively from the version directory
      allSubPages = getAllMarkdownFilesRecursive(
        scanPath,
        `/docs/${docType}/${versionMatch[1]}`,
        scanPath
      ).filter(item => item.href !== `/docs/${docType}/${versionMatch[1]}`)
    } else if (docType === 'api') {
      // Get all pages from the base API directory
      allSubPages = getAllMarkdownFilesRecursive(
        scanPath,
        `/docs/${docType}`,
        scanPath
      ).filter(item => item.href !== `/docs/${docType}`)
    }

    res.render(`docs/${docType}/index`, {
      pageTitle: frontmatter.title,
      content: html,
      docType,
      versions,
      versionNavigation,
      allSubPages,
      currentPath: req.path
    })
  } catch (error) {
    console.error(`Error rendering documentation sub-page: ${docType}/${req.params[0]}`, error)
    res.status(404).render('errors/404', {
      pageTitle: 'Page not found'
    })
  }
}

// API Documentation Routes
exports.api_get = async (req, res) => {
  // Redirect to the latest version
  const versions = getVersions('docs/api', VIEWS_PATH)
  if (versions.length > 0) {
    res.redirect(versions[0].path)
  } else {
    renderDocPage('api', req, res)
  }
}

exports.api_page_get = async (req, res) => {
  renderDocSubPage('api', req, res)
}

// CSV Documentation Routes
exports.csv_get = async (req, res) => {
  renderDocPage('csv', req, res)
}

exports.csv_page_get = async (req, res) => {
  renderDocSubPage('csv', req, res)
}

// Reference Data Documentation Routes
exports.referenceData_get = async (req, res) => {
  renderDocPage('reference-data', req, res)
}

exports.referenceData_page_get = async (req, res) => {
  renderDocSubPage('reference-data', req, res)
}
