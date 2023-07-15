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
        highlightedLabel: HighlightedLabel
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

declare interface Entry {
    type: "tweet" | "ui_moduleHeader"
    entryId: string
    sortIndex: string
    itemMetadata: {
        clientEventInfo: {
            component?: "related_tweet"
            details: {
                conversationDetails: {
                    conversationSection: "AbusiveQuality" | "RelatedTweet"
                }
                timelinesDetails: {
                    controllerData: string
                }
            }
        }
        feedbackInfo?: unknown
        moduleMetadata?: {
            conversationMetadata: unknown
            gridCarouselMetadata: unknown
            verticalMetadata: unknown
        }
    }
    content: {
        id?: string
        displayType?: "Tweet"
        header?: {
            displayType: "Classic"
            text: string
            sticky: boolean
            socialContext: {
                generalContext: {
                    contextType: "TextOnly"
                    text: string
                }
            }
        }
        timelineModule?: any
    }
    shouldCountTowardsAdSpacing?: boolean
    conversationPosition?: {
        isStart: boolean
        isEnd: boolean
        position: "descendant" | "adjacent"
        showReplyContext: boolean
    }
    position: number
    cursor?: number
}

declare interface HighlightedLabel {
    badge: {
        url: string
    }
    description: string
    longDescription?: {
        entities: LabelEntity[]
        text: string
    }
    url?: {
        url: string
        urlType: "DeepLink"
    }
    userLabelDisplayType?: "Badge"
    userLabelType: "BusinessLabel" | "AutomatedLabel"
}

declare interface User {
    following: boolean
    notifications: boolean
    can_dm: boolean
    can_media_tag: boolean
    default_profile: boolean
    default_profile_image: boolean
    description: string
    entities: {
        description: {
            urls: TwitterApi.Url[]
        }
        url?: {
            urls: TwitterApi.Url[]
        }
    },
    fast_followers_count: number
    favourites_count: number
    followers_count: number
    friends_count: number
    has_custom_timelines: boolean
    has_nft_avatar?: boolean
    is_translator: boolean
    listed_count: number
    location: string
    media_count: number
    name: string
    normal_followers_count: number
    pinned_tweet_ids_str: string[]
    possibly_sensitive: boolean
    profile_banner_url?: string
    profile_image_url_https: string
    profile_interstitial_type: "sensitive_media"
    screen_name: string
    statuses_count: number
    translator_type: "none"
    verified: boolean
    want_retweets: boolean
    withheld_in_countries: [],
    id_str: string
    is_profile_translatable: boolean
    smart_blocked_by: boolean
    smart_blocking: boolean
    business_account: unknown
    profile_image_shape: "Circle" | "Square" | "Hexagon"
    creator_subscriptions_count: number
    highlights_info: {
        can_highlight_tweets: boolean
        highlighted_tweets: string
    }
    highlightedLabel: HighlightedLabel
    verification_info: {
        reason?: {
            description: {
                entities: LabelEntity[]
                text: string
            }
            verified_since_msec: string
        }
    }
    is_blue_verified: boolean
    verified_type?: "Business"
    has_graduated_access: boolean
    created_at: string
    professional?: {
        category: {
            icon_name: string
            id: number
            name: string
        }[]
        professional_type: string
        rest_id: string
    }
    verified_phone_status: unknown
}

declare interface LabelEntity {
    from_index: number
    to_index: number
    ref: {
        url?: string
        url_type?: "ExternalUrl"
        mention?: {
            id: string
            screenName: string
        }
    }
}
