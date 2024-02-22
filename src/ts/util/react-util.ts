import { Logger } from "./logger"


const _logger = new Logger("react-util")


export function reactPropExists(element: Element, propName: string): boolean {
    const key = Object.keys(element).find(e => e.startsWith("__reactProps"))

    if (!key)
        _logger.error(`Element has no react props: `, element)

    const reactProps = element[key] as ReactProps
    return _getReactPropByName(reactProps, propName)[0]
}

function* recursiveComponents2(instance, element) {
    if (instance.stateNode == element)
        yield instance
    if (instance.sibling)
        yield* recursiveComponents2(instance.sibling, element)
    if (instance.child)
        yield* recursiveComponents2(instance.child, element)
}

export function getReactPropByName<T>(element: Element, propName: string, quiet = false): T | null {
    const key = Object.keys(element).find(e => e.startsWith("__reactProps"))

    if (!key) {
        if (!quiet)
            _logger.error(`Element has no react props: `, element)
        return null
    }

    // @ts-ignore
    const root = document.querySelector("#react-root")._reactRootContainer._internalRoot.current

    let result: [boolean, T | null] = [false, null]
    for (let component of recursiveComponents2(root, element)) {
        result = _getReactPropByName<T>(component.pendingProps, propName)
        if (result[0])
            break

        result = _getReactPropByName<T>(component.props || [], propName)
        if (result[0])
            break
    }

    if (!result[0] && !quiet)
        _logger.error(`Error getting react prop "${propName}" from element: `, element)

    return result[1]
}

export function getRootReactPropByName<T>(propName: string, quiet = false): T | null {
    const root = document.querySelector("#react-root")
    // @ts-ignore
    const component = root._reactRootContainer._internalRoot.current.child

    let result: [boolean, T | null] = [false, null]
    result = _getReactPropByName<T>(component.pendingProps, propName)

    if (!result[0])
        result = _getReactPropByName<T>(component.props || [], propName)

    if (!result[0] && !quiet)
        _logger.error(`Error getting react prop "${propName}" from element:`, root, component)

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
