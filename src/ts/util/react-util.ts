import { Logger } from "./logger"


const _logger = new Logger("react-util")


export function getReactPropByName<T>(element: Element, propName: string, quiet = false): T | null {
  const key = Object.keys(element).find(e => e.startsWith("__reactProps"))

  if (!key) {
    if (!quiet)
      _logger.error(`Element has no react props: `, element)
    return null
  }

  const reactProps = element[key] as ReactProps
  const result = _getReactPropByName<T>(reactProps, propName)

  if (!result[0] && !quiet)
    _logger.error(`Error getting react prop "${propName}" from element: `, element)

  return result[1]
}


function _getReactPropByName<T>(reactProps: ReactProps, propName: string): [boolean, T | null] {
  const emptyResult: [boolean, T | null] = [false, null]
  if (!reactProps)
    return emptyResult

  if (Object.keys(reactProps).includes(propName))
    return [true, reactProps[propName] as T]

  if (!reactProps.children || typeof reactProps.children == "function")
    return emptyResult

  if (!Array.isArray(reactProps.children))
    return _getReactPropByName<T>(reactProps.children.props, propName)

  for (let e of reactProps.children.flat().filter(e => !!e) || []) {
    const result = _getReactPropByName<T>(e.props, propName)
    if (result[0])
      return result
  }

  return emptyResult
}
