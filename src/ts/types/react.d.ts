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
