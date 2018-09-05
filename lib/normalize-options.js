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

const normalizeOptions = (options) => {
  if (!isObject(options)) {
    throw new Error('options argument should be defined as an object')
  }

  return {
    guide: options.guide ? normalizeGuideOptions(options.guide) : {}
  }
}

exports.normalizeOptions = normalizeOptions
