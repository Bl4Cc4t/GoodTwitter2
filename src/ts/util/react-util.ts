import { Logger } from "./logger"


const _logger = new Logger("react-util")


export function getReactPropByName<T>(element: Element, propName: string): T | null {
  const key = Object.keys(element).find(e => e.startsWith("__reactProps"))

  if (!key) {
    _logger.error(`Element has no react props: `, element)
    return null
  }

  const reactProps = element[key] as ReactProps
  const result = _getReactPropByName<T>(reactProps, propName)

  if (result == null)
    _logger.error(`Error getting react prop "${propName}" from element: `, element)

  return result
}


function _getReactPropByName<T>(reactProps: ReactProps, propName: string): T | null {
  if (Object.keys(reactProps).includes(propName))
    return reactProps[propName] as T

  if (!reactProps.children || typeof reactProps.children == "function")
    return null

  if (!Array.isArray(reactProps.children))
    return _getReactPropByName<T>(reactProps.children.props, propName)

  for (let e of reactProps.children.flat().filter(e => !!e) || []) {
    const result = _getReactPropByName<T>(e.props, propName)
    if (result != null)
      return result
  }

  return null
}
