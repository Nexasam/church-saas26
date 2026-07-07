import { Bell, Check, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'

interface Notification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

interface NotificationDropdownProps {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/notifications')
      const data = await response.json() as { notifications: Notification[]; unread_count: number }
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // ignore
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/notifications/read-all', { method: 'POST' })
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const deleteNotification = async (id: string) => {
    const deleted = notifications.find(n => n.id === id)
    try {
      await fetch(`/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (deleted && !deleted.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch {
      // ignore
    }
  }

  const getNotificationIcon = (type: string, data?: Record<string, unknown>) => {
    if (type.includes('WorkerSms') || data?.type === 'worker_sms') return '💬'
    if (type.includes('CareCase')) return '🏥'
    if (type.includes('FollowUp')) return '📞'
    if (type.includes('Celebration')) return '🎉'
    if (type.includes('Sms')) return '💬'
    if (type.includes('Invitation')) return '✉️'
    return '🔔'
  }

  const getNotificationMessage = (notification: Notification) => {
    const { type, data } = notification
    if (data?.type === 'worker_sms' || type.includes('WorkerSms')) {
      const msg = (data.message as string) ?? ''
      return `${data.title as string}: "${msg.slice(0, 80)}${msg.length > 80 ? '...' : ''}"`
    }
    if (type.includes('CareCase')) return `New care case assigned: ${data.member_name as string}`
    if (type.includes('FollowUp')) return data.task_id
      ? `Follow-up task due: ${data.name as string}`
      : `Follow-up reminder: ${data.name as string}`
    if (type.includes('Celebration')) return `Celebration: ${data.member_name as string} - ${data.category as string}`
    if (type.includes('Sms')) return `SMS campaign "${data.title as string}" sent to ${data.sent_count as number} recipients`
    if (type.includes('Invitation')) return 'You have been invited to join as an admin'
    return 'New notification'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-popover rounded-lg shadow-xl border border-border z-50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                !notification.read_at ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getNotificationIcon(notification.type, notification.data)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {getNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.read_at && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-muted-foreground hover:text-emerald-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => {
            router.get('/notifications')
            onClose()
          }}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  )
}
