// twitter api
export namespace TwitterApi {
  export namespace v1_1 {
    export namespace statuses {
      export type show = TweetLegacy
    }
    export interface translateTweet extends Translation {
      id: string
      id_str: string
      translationState: "Success"
      destinationLanguage: string
    }
    export interface translateProfile {
      profileUserId: string
      profileTranslation: ProfileTranslation
    }
  }

  export namespace v2 {
    export namespace search {
      export interface adaptive {
        globalObjects: {
          tweets: {
            [tweetId: string]: TweetLegacy
          }
        }
      }
    }
  }

  export interface Translation {
    translation: string
    entities: Entities
    sourceLanguage: string
    localizedSourceLanguage: string
    translationSource: "Google"
  }

  export interface ProfileTranslation extends Translation {
    language: string // destination
  }

  export namespace Graphql {
    export interface TweetDetailResponse {
      data: {
        threaded_conversation_with_injections_v2: {
          instructions: Instruction[]
        }
      }
    }

    export interface UserTweets {
      data: {
        user: {
          result: {
            __typename: "User"
            timeline_v2: {
              timeline: {
                instructions: Instruction[]
              }
            }
          }
        }
      }
    }

    export interface HomeLatestTimelineResponse {
      data: {
        home: {
          home_timeline_urt: {
            instructions: Instruction[]
          }
        }
      }
    }

    export interface UserByScreenNameResponse {
      data: {
        user: {
          result: UserResults
        }
      }
    }


    export type Instruction = TimelineClearCache | TimelineTerminateTimeline | TweetDetailTimelineAddEntries


    interface TimelineClearCache {
      type: "TimelineClearCache"
    }

    interface TimelineTerminateTimeline {
      type: "TimelineTerminateTimeline"
      direction: "Top" | "Bottom"
    }

    export type TweetDetailTimelineAddEntries = TimelineAddEntries<TimelineTweetItemEntry | TweetDetailTimelineCursor | TweetDetailTimelineModuleEntry>

    export type TweetDetailTimelineModuleEntry = TimelineModuleEntry<TimelineTweetItemEntry | TweetDetailTimelineCursor>

    export interface TimelineAddEntries<T> {
      type: "TimelineAddEntries"
      entries: {
        entryId: string
        sortIndex: string
        content: T
      }[]
    }

    export interface TweetDetailTimelineCursor {
      entryType: "TimelineTimelineItem"
      itemContent: {
        itemType: "TimelineTimelineCursor"
        value: string
        cursorType: string
        displayTreatment: any
      }
    }

    export interface TimelineTweetItemEntries {
      entryId: string
      sortIndex: string
      content: TimelineTweetItemEntry
    }

    export interface TimelineTweetItemEntry {
      entryType: "TimelineTimelineItem"
      itemContent: {
        itemType: "TimelineTweet"
        tweet_results: TweetResults
        tweetDisplayType: "Tweet"
      }
    }

    export interface TimelineModuleEntry<T> {
      entryType: "TimelineTimelineModule"
      items: {
        entryId: string
        dispensable?: boolean
        item: Omit<T, "entryType">
      }[]
      metadata: {
        conversationMetadata: {
          allTweetIds: string[]
          enableDeduplication: boolean
        }
      }
      displayType: "VerticalConversation" | "Vertical"
    }
  }



  //////////////////////
  // TweetResults
  //////////////////////

  export type TweetResults = {
    result: AllTweetResult
  } | {}

  export type AllTweetResult =
      TweetResult
    | TweetTombstoneResult

  export interface TweetResult {
    __typename?: "Tweet"
    rest_id: string
    core: {
      user_results: {
        result: UserResult
      }
    }
    edit_control?: {
      edit_tweet_ids: string[]
      editable_until_msecs: string
    }
    unmention_info?: any
    legacy: TweetLegacy
    quick_promote_eligibility?: {
      eligibility: "IneligibleNotProfessional"
    }
  }

  interface TweetTombstoneResult {
    __typename: "TweetTombstone"
    tombstone: {
      __typename: "TextTombstone"
      text: {
        entities: ErrorEntity[]
        rtl: boolean
        text: string
      }
    }
  }

  interface ErrorEntity {
    fromIndex: number
    toIndex: number
    ref: {
      type: "TimelineUrl"
      url: string
      urlType: "ExternalUrl"
    }
  }

  export interface TweetLegacy {
    created_at: string
    id_str: string
    id: number
    full_text: string
    truncated: boolean
    display_text_range: number[]
    entities: Entities
    extended_entities: {
      media: MediaExtended[]
    }
    source: string
    in_reply_to_status_id: number | null
    in_reply_to_status_id_str: string | null
    in_reply_to_user_id_str: string | null
    in_reply_to_user_id: number | null
    in_reply_to_screen_name: string | null
    user: UserLegacy
    geo: any | null
    coordinates: any | null
    place: Place | null
    contributors: any | null
    is_quote_status: boolean
    quoted_status_id?: number,
    quoted_status_id_str?: string,
    quoted_status_permalink?: {
      url: string
      expanded: string
      display: string
    }
    quoted_status?: TweetLegacy
    retweet_count: number
    favorite_count: number
    favorited: boolean
    retweeted: boolean
    possibly_sensitive: boolean
    possibly_sensitive_appealable: boolean
    possibly_sensitive_editable: boolean
    lang: string
    supplemental_language: any | null
    card_uri: string
  }

  export interface Place {
    bounding_box?: {
      coordinates: number[][][]
      type?: string
    }
    country: string
    country_code: string
    id: string
    full_name: string
    place_type: string
    url: string
  }

  export interface Entities {
    // https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/entities-object
    media: Media[]
    user_mentions: UserMention[]
    urls: Url[]
    hashtags: Hashtag[]
    symbols: Symbol[]
    // polls: Poll[]
  }

  interface Hashtag {
    text: string
    indices: number[]
  }


  interface Sizes {
    thumb: Size
    large: Size
    medium: Size
    small: Size
  }

  interface Size {
    w: number
    h: number
    resize: string
  }

  export interface Url {
    display_url?: string
    expanded_url?: string
    indices: number[]
    // url: usually tco shortlink, if expanded_url does not exist
    // then this holds the full link
    url: string
    // expanded
    unwound?: {
      url: string
      status: number
      title: string
      description: string
    }
  }

  export interface UserMention {
    id: number
    id_str: string
    indices: number[]
    name: string
    screen_name: string
  }

  interface Symbol {
    indices: number[]
    text: string
  }

  interface Media {
    display_url: string
    expanded_url: string
    id: number
    id_str: string
    indices: number[]
    media_url?: string
    media_url_https: string
    sizes: Sizes
    source_status_id?: number | null
    source_status_id_str?: string | null
    source_user_id?: number | null
    source_user_id_str?: string | null
    type: "photo" | "video" | "animated_gif"
    url: string
  }

  export interface MediaExtended extends Media {
    media_key: string
    video_info: {
      aspect_ratio: number[]
      duration_millis: number
      variants: VideoVariant[]
    }
    additional_media_info?: {
      title?: string
      description?: string
      embeddable?: boolean
      monetizable?: boolean
    }
    ext_media_color: {
      palette: ColorPalette
    }
    mediaStats?: {
      viewCount: number
    }
    ext_media_availability: {
      status: "available" | "unavailable"
      reason?: "dmcaed" | "deleted" | "geoblocked"
    }
    features?: object
    original_info: {
      height: number
      width: number
      focus_rects?: {
        x: number
        y: number
        w: number
        h: number
      }[]
    }
    sensitive_media_warning?: {
      adult_content?: boolean
      graphic_violence?: boolean
      other?: boolean
    }
  }

  interface VideoVariant {
    bitrate?: number
    content_type: string
    url: string
  }

  interface ColorPalette {
    percentage: number
    rgb: {
      blue: number
      green: number
      red: number
    }
  }



  //////////////////////
  // UserResults
  //////////////////////

  type UserResults = UserResult | UserUnavailableResult

  interface UserUnavailableResult {
    __typename: "UserUnavailable"
    unavailable_message: {
			entities: ErrorEntity[]
			rtl: boolean
			text: string
		},
		reason: "Suspended"
  }


  export interface UserResult {
    __typename: "User"
    id: string
    rest_id: string
    affiliates_highlighted_label: {}
    has_nft_avatar: boolean
    legacy: UserLegacy
    smart_blocked_by?: boolean
    smart_blocking?: boolean
    super_follow_eligible: boolean
    super_followed_by: boolean
    super_following: boolean
    legacy_extended_profile?: {
      birthdate: {
				day: number
				month: number
				year: number
				visibility: "MutualFollow"
				year_visibility: "Self"
			}
    }
    is_profile_translatable?: boolean
  }


  export interface UserLegacy {
    id: number
    id_str: string
    name: string
    screen_name: string
    location: string
    description: string
    url: string
    entities: {
      description: {
        urls: Url[]
      }
      url?: {
        urls: Url[]
      }
    }
    protected: boolean
    followers_count: number
    fast_followers_count: number
    normal_followers_count: number
    friends_count: number
    listed_count: number
    created_at: string
    favourites_count: number
    utc_offset: any | null
    time_zone: any | null
    geo_enabled: boolean
    verified: boolean
    statuses_count: number
    media_count: number
    lang: string | null
    contributors_enabled: boolean
    is_translator: boolean
    is_translaton_enabled: boolean
    profile_background_color: string
		profile_background_image_url: string | null
		profile_background_image_url_https: string | null
		profile_background_tile: boolean
		profile_image_url: string
    profile_image_url_https: string
    profile_banner_url: string
		profile_image_extensions_media_availability: any | null,
		profile_banner_extensions_media_availability: any | null,
		profile_link_color: string
		profile_sidebar_border_color: string
		profile_sidebar_fill_color: string
		profile_text_color: string
		profile_use_background_image: boolean
    has_extended_profile: boolean
    default_profile: boolean
    default_profile_image: boolean
    pinned_tweet_ids: number[]
    pinned_tweet_ids_str: string[]
    has_custom_timelines: boolean
    can_media_tag: boolean
    followed_by: boolean
    following: boolean
    follow_request_sent: boolean
    notifications: boolean
    advertiser_account_type: "promotable_user"
    advertiser_account_service_levels: "analytics"[]
    business_profile_state: "none"
    translator_type: "none"
    withheld_in_countries: any[]
    require_some_consent: boolean
  }

}

declare global {
  const i18n: {
    [lang: string]: {
      [key: string]: string
    }
  }[]
  interface Window {
    controlObj: any
    tweetData: {
      [tweetId: string]: TwitterApi.TweetLegacy
    }
  }
  interface Node {
    alreadyFound: boolean
  }
}

export type Path = {
  [key: string]: Path
} | Array<Path | string>

export type Theme = (typeof import("./constants").THEMES)[number]

export interface I18nReplacable {
  bornDate: {
    date: string
  }
  bornYear: {
    year: string
  }
  followedBy1: {
    p1: string
  }
  followedBy2: {
    p1: string
    p2: string
  }
  followedBy3: {
    p1: string
    p2: string
    p3: string
  }
  followedBy4Plus: {
    p1: string
    p2: string
    nr: number
  }
  translatedTweetInfo: {
    lang: string
    source: string
  }
  updatedInfo: {
    version: string
  }
  hideFollowSuggestionsBox: {
    type: string
    location: string
  }
}


export interface UserInfo {
  bannerUrl:    string
    avatarUrl:  string
    screenName: string
    name:       string
    id:         string
    stats: {
      tweets:    number
      followers: number
      following: number
    }
}
