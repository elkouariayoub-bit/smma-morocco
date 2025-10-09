export type Alert = {
  id: string
  title: string
  severity: "high" | "med"
  createdAt: string
}

const _alerts: Alert[] = []

export function addAlert(alert: Alert) {
  _alerts.unshift(alert)
  if (_alerts.length > 100) {
    _alerts.pop()
  }
}

export function listAlerts(limit = 20) {
  return _alerts.slice(0, limit)
}
