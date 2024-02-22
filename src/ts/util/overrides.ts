import { GLOBAL_TOP_OFFSET } from "../constants"
import { onLocationChange } from "./location"


/**
 * Overrides various functions to change the behavior of the site.
 */
export function overrideFunctions(): void {
    // remove whitespace when inserting HTML
    const Element_insertAdjacentHTML = Element.prototype.insertAdjacentHTML
    Element.prototype.insertAdjacentHTML = function(position, text) {
        Element_insertAdjacentHTML.call(this, position, text.trim())
    }

    // remove "t" search parameter (probably used for tracking?)
    // https://twitter.com/Outrojules/status/1543220843995619328?s=20&t=fCFEatQ_iAtlyiHQCWCxoQ
    const Range_selectNodeContents = Range.prototype.selectNodeContents
    Range.prototype.selectNodeContents = function(node) {
        node.textContent = node.textContent.replace(/&t=.*$/, "")
        Range_selectNodeContents.call(this, node)
    }

    // Node removal interception
    const Node_removeChild = Node.prototype.removeChild
    Node.prototype.removeChild = function<T extends Node>(child: T): T {
        // prevent removal of untranslated tweet texts in timeline
        if (child instanceof HTMLElement && child.dataset.testid == "tweetText") {
            return child
        }
        return Node_removeChild.call(this, child)
    }

    // location change: push
    const History_push = History.prototype.pushState
    History.prototype.pushState = function() {
        History_push.apply(this, arguments)
        onLocationChange("push")
    }

    // location change: replace
    const History_replace = History.prototype.replaceState
    History.prototype.replaceState = function() {
        History_replace.apply(this, arguments)
        onLocationChange("replace")
    }

    // adjust scrollBy with GLOBAL_TOP_OFFSET
    const window_scrollBy = unsafeWindow.scrollBy
    unsafeWindow.scrollBy = function() {
        if (arguments.length == 2) {
            const x = arguments[0]
            const y = arguments[1] - GLOBAL_TOP_OFFSET
            window_scrollBy.apply(this, [x, y])
        } else {
            const options = arguments[0]
            options.top -= GLOBAL_TOP_OFFSET
            window_scrollBy.apply(this, [options])
        }
    }
}
