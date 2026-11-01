import type { PostHog } from 'posthog-js'
import { config } from '@/config'

let posthog: PostHog | undefined

/**
 * Loads PostHog when POSTHOG_KEY is set. posthog-js is a separate chunk:
 * nothing is downloaded nor sent when analytics are disabled.
 */
export async function initAnalytics () {
  const { key, host } = config.posthog
  if (!key || typeof window === 'undefined') return
  try {
    const { default: client } = await import('posthog-js')
    client.init(key, {
      api_host: host,
      // Single page app: a $pageview on every vue-router navigation.
      capture_pageview: 'history_change',
      capture_pageleave: true,
      person_profiles: 'identified_only',
    })
    posthog = client
  } catch (error) {
    // Blocked by an ad blocker or a network error: the docs work without it.
    console.warn('[tidydoc] analytics disabled:', error)
  }
}

/** Sends a custom event, or does nothing when analytics are disabled. */
export function track (event: string, properties?: Record<string, unknown>) {
  posthog?.capture(event, properties)
}
