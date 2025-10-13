export type SettingsAnalyticsEvent = 'settings_updated'

export function trackSettingsEvent(section: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.info('[analytics] settings_updated', { section })
  }

  if (typeof window === 'undefined') {
    return
  }

  const detail = { event: 'settings_updated' as SettingsAnalyticsEvent, section, timestamp: Date.now() }

  try {
    window.dispatchEvent(new CustomEvent('settings:analytics', { detail }))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to dispatch settings analytics event', error)
    }
  }
}
