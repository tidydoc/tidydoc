import {describe, expect, it} from 'vitest'
import {parseConfig} from '@/config'

describe('parseConfig posthog', () => {
    it('is disabled without a key', () => {
        expect(parseConfig({}).posthog).toEqual({key: '', host: 'https://eu.i.posthog.com'})
    })

    it('reads the key and host, trimmed, without trailing slash', () => {
        expect(parseConfig({POSTHOG_KEY: ' phc_123 ', POSTHOG_HOST: 'https://us.i.posthog.com/ '}).posthog)
            .toEqual({key: 'phc_123', host: 'https://us.i.posthog.com'})
    })
})
