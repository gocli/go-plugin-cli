import isString from './is-string'
import isObject from './is-object'

const isEmpty = value => {
  if (!value) return true

  if (isString(value)) {
    if (!value.trim()) return true
    return false
  }

  if (Array.isArray(value)) {
    if (!value.length) return true
    return false
  }

  if (isObject(value)) {
    if (!Object.keys(value).length) return true
    return false
  }

  return false
}
export default isEmpty
