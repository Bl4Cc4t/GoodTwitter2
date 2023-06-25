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

declare interface SocialProof {
  label: string
  role: "host" | string
  user: {
    avatar_url: string
    community: unknown
    display_name: string
    has_nft_avatar: boolean
    highlightedLabel: unknown
    is_blue_verified: boolean
    is_muted_by_admin: boolean
    is_muted_by_guest: boolean
    is_verified: boolean
    periscope_user_id: string
    start: number
    twitter_screen_name: string
    user_id: string
    verified_type: unknown
  }
}
