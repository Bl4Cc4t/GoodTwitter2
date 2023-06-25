declare interface ReactProps {
  children?: (ReactElement[] | null)[] | ReactElement | Function
  [key: string]: any
}

declare interface ReactElement {
  $$typeof: symbol
  _owner: unknown
  key: unknown
  props: ReactProps
  ref: unknown
  type: Function
}
