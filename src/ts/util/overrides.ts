import { onLocationChange } from "./location"


export function overrideFunctions() {
  // remove whitespace when inserting HTML
  const _insertAdjacentHTML = Element.prototype.insertAdjacentHTML
  Element.prototype.insertAdjacentHTML = function(position, text) {
    _insertAdjacentHTML.call(this, position, text.trim())
  }

  // remove "t" search parameter (probably used for tracking?)
  // https://twitter.com/Outrojules/status/1543220843995619328?s=20&t=fCFEatQ_iAtlyiHQCWCxoQ
  const _selectNodeContents = Range.prototype.selectNodeContents
  Range.prototype.selectNodeContents = function(node) {
    node.textContent = node.textContent.replace(/&t=.*$/, "")
    _selectNodeContents.call(this, node)
  }

  const _push = History.prototype.pushState
  History.prototype.pushState = function() {
    _push.apply(this, arguments)
    onLocationChange("push")
  }

  const _replace = History.prototype.replaceState
  History.prototype.replaceState = function() {
    _replace.apply(this, arguments)
    onLocationChange("replace")
  }
}
