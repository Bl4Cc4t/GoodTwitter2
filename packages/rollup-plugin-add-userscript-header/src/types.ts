export interface PluginOptions {
  meta?: UserscriptMetadata
}

export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export interface UserscriptMetadata {
  name: string
  namespace: string
  version: string
  author: string
  description: string
  license: string
  homepage: string
  icon: string
  icon64: string
  updateURL: string
  downloadURL: string
  supportURL: string
  include: string[]
  match: string[]
  exclude: string[]
  require: string[]
  resource: Record<string, string> | string[]
  connect: string[]
  "run-at": "document-start" | "document-body" | "document-end" | "document-idle" | "context-menu"
  antifeature: string[]
  noframes: boolean
  unwrap: boolean
  grant: string[]
}

export const META_ORDER = [
  "name",
  "version",
  "author",
  "namespace",
  "description",
  "license",
  "antifeature",
  "homepage",
  "run-at",
  "noframes",
  "unwrap",
  "grant",
  "match",
  "include",
  "exclude",
  "connect",
  "require",
  "resource",
  "icon",
  "icon64",
  "supportURL",
  "updateURL",
  "downloadURL",
] as const

export const GM_GRANT = [
  "addStyle",
  "setValue",
  "getValue",
  "deleteValue",
  "listValues",
  "addValueChangeListener",
  "removeValueChangeListener",
  "getResourceText",
  "getResourceURL",
  "registerMenuCommand",
  "unregisterMenuCommand",
  "xmlhttpRequest",
  "download",
  "saveTab",
  "getTab",
  "getTabs",
  "info",
  "log",
  "openInTab",
  "notification",
  "setClipboard"
]
