const isObject = obj => typeof obj === 'object' && obj !== null

const normalizeGuideOptions = (guide) => {
  const normalized = {}

  if (typeof guide === 'function') {
    normalized.beforeCallback = guide
  } else if (isObject(guide)) {
    if (typeof guide.firstMessage === 'string') {
      normalized.firstMessage = guide.firstMessage
    }
    if (typeof guide.beforeCallback === 'function') {
      normalized.beforeCallback = guide.beforeCallback
    }
  }

  return normalized
}

const normalizeCliOptions = (cli) => {
  const normalized = {}

  if (isObject(cli)) {
    if (typeof cli.allowShort !== 'undefined') {
      normalized.allowShort = cli.allowShort
    }
  }

  return normalized
}

const normalizeOptions = (options) => {
  if (!isObject(options)) {
    throw new Error('options argument should be defined as an object')
  }

  return {
    cli: normalizeCliOptions(options.cli),
    guide: normalizeGuideOptions(options.guide)
  }
}

exports.normalizeOptions = normalizeOptions
