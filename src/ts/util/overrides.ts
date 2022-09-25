import { onLocationChange } from "./location"
import { saveTweetResponse } from "./tweet"


/**
 * Overrides various functions to change the behavior of the site.
 */
export function overrideFunctions() {
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


  // XMLHttpRequest interception
  const XMLHttpRequest_open = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function() {
    if (new URL(arguments[1]).pathname.match(/\/(adaptive\.json|TweetDetail|HomeLatestTimeline|UserTweets)/)) {
      this.addEventListener("readystatechange", () => {
        if (this.readyState === XMLHttpRequest.DONE) {
          saveTweetResponse(JSON.parse(this.responseText))
        }
      })
    }
    XMLHttpRequest_open.apply(this, arguments)
  }
}
