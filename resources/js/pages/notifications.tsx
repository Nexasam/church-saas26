import { Bell, Check, Trash2, Heart, Phone, PartyPopper, MessageSquare, Mail, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { dashboard } from '@/routes'

interface Notification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

interface NotificationPreferences {
  email_care_cases: boolean
  email_follow_ups: boolean
  email_celebrations: boolean
  email_sms: boolean
  database_care_cases: boolean
  database_follow_ups: boolean
  database_celebrations: boolean
  database_sms: boolean
}

interface PageProps {
  notifications: Notification[]
  unread_count: number
  [key: string]: unknown
}

export default function NotificationsPage() {
  const { props } = usePage<PageProps>()
  const [notifications, setNotifications] = useState<Notification[]>(props.notifications ?? [])
  const [unreadCount, setUnreadCount] = useState<number>(props.unread_count ?? 0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'care' | 'followup' | 'celebration' | 'sms' | 'invitation'>('all')
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/notifications')
      const data = await response.json() as { notifications: Notification[]; unread_count: number }
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/notifications/preferences')
      const data = await response.json() as NotificationPreferences
      setPreferences(data)
    } catch {
      // preferences unavailable — silently skip
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
    try {
      const deleted = notifications.find(n => n.id === id)
      await fetch(`/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (deleted && !deleted.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch {
      // ignore
    }
  }

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return
    try {
      const updated = { ...preferences, [key]: value }
      setPreferences(updated)
      await fetch('/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch {
      // ignore
    }
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes('WorkerSms')) return MessageSquare
    if (type.includes('CareCase')) return Heart
    if (type.includes('FollowUp')) return Phone
    if (type.includes('Celebration')) return PartyPopper
    if (type.includes('Sms')) return MessageSquare
    if (type.includes('Invitation')) return Mail
    return Bell
  }

  const getNotificationColor = (type: string) => {
    if (type.includes('WorkerSms')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    if (type.includes('CareCase')) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    if (type.includes('FollowUp')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    if (type.includes('Celebration')) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
    if (type.includes('Sms')) return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    if (type.includes('Invitation')) return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }

  const getNotificationType = (type: string) => {
    if (type.includes('WorkerSms')) return 'sms'
    if (type.includes('CareCase')) return 'care'
    if (type.includes('FollowUp')) return 'followup'
    if (type.includes('Celebration')) return 'celebration'
    if (type.includes('Sms')) return 'sms'
    if (type.includes('Invitation')) return 'invitation'
    return 'other'
  }

  const getNotificationMessage = (notification: Notification) => {
    const { type, data } = notification
    if (data?.type === 'worker_sms' || type.includes('WorkerSms')) {
      const msg = data.message as string ?? ''
      const preview = msg.slice(0, 100)
      const ellipsis = msg.length > 100 ? '…' : ''
      return `${data.title as string}: "${preview}${ellipsis}"`
    }
    if (type.includes('CareCase')) return `New care case assigned: ${data.member_name as string}`
    if (type.includes('FollowUp')) return data.task_id ? `Follow-up task due: ${data.name as string}` : `Follow-up reminder: ${data.name as string}`
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

  const filteredNotifications = notifications.filter(n => {
    const readFilter = filter === 'unread' ? !n.read_at : true
    const typeFilterMatch = typeFilter === 'all' || getNotificationType(n.type) === typeFilter
    return readFilter && typeFilterMatch
  })

  return (
    <>
      <Head title="Notifications" />

      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 text-xs">{unreadCount} unread</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                <Check className="w-3 h-3 mr-1" /> Mark all read
              </Button>
            )}
            <Button
              variant={showPreferences ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowPreferences(p => !p)}
            >
              Preferences
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilter(f => f === 'unread' ? 'all' : 'unread')}
            >
              {filter === 'unread' ? 'Show all' : 'Unread only'}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={fetchNotifications}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Preferences panel */}
        {showPreferences && preferences && (
          <div className="mb-6 p-6 border border-border bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-4">Notification Preferences</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  {([
                    { key: 'email_care_cases', icon: Heart, label: 'Care Cases', color: 'text-red-500' },
                    { key: 'email_follow_ups', icon: Phone, label: 'Follow-ups', color: 'text-blue-500' },
                    { key: 'email_celebrations', icon: PartyPopper, label: 'Celebrations', color: 'text-yellow-500' },
                    { key: 'email_sms', icon: MessageSquare, label: 'SMS Delivery', color: 'text-green-500' },
                  ] as const).map(({ key, icon: Icon, label, color }) => (
                    <label key={key} className="flex items-center gap-3 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[key]}
                        onChange={e => updatePreference(key, e.target.checked)}
                        className="rounded border-border"
                      />
                      <Icon className={`w-4 h-4 ${color}`} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">In-App Notifications</h4>
                <div className="space-y-3">
                  {([
                    { key: 'database_care_cases', icon: Heart, label: 'Care Cases', color: 'text-red-500' },
                    { key: 'database_follow_ups', icon: Phone, label: 'Follow-ups', color: 'text-blue-500' },
                    { key: 'database_celebrations', icon: PartyPopper, label: 'Celebrations', color: 'text-yellow-500' },
                    { key: 'database_sms', icon: MessageSquare, label: 'SMS Delivery', color: 'text-green-500' },
                  ] as const).map(({ key, icon: Icon, label, color }) => (
                    <label key={key} className="flex items-center gap-3 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[key]}
                        onChange={e => updatePreference(key, e.target.checked)}
                        className="rounded border-border"
                      />
                      <Icon className={`w-4 h-4 ${color}`} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Type filter */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {([
            { value: 'all', label: 'All', icon: undefined as React.ElementType | undefined },
            { value: 'care', label: 'Care', icon: Heart as React.ElementType },
            { value: 'followup', label: 'Follow-ups', icon: Phone as React.ElementType },
            { value: 'celebration', label: 'Celebrations', icon: PartyPopper as React.ElementType },
            { value: 'sms', label: 'SMS', icon: MessageSquare as React.ElementType },
          ] as const).map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={typeFilter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(value)}
              className="h-8 text-xs gap-1"
            >
              {Icon && <Icon className="w-3 h-3" />}
              {label}
            </Button>
          ))}
        </div>

        {/* Notification list */}
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? 'No unread notifications' : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const IconComponent = getNotificationIcon(notification.type)
              const iconColor = getNotificationColor(notification.type)
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-5 hover:bg-muted/30 transition-colors',
                    !notification.read_at && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('flex size-9 items-center justify-center rounded-full shrink-0', iconColor)}>
                      {React.createElement(IconComponent, { className: 'w-4 h-4' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">
                          {getNotificationMessage(notification)}
                        </p>
                        {!notification.read_at && (
                          <Badge variant="default" className="h-4 text-[10px] px-1.5">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

NotificationsPage.layout = {
  breadcrumbs: [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Notifications', href: '/notifications' },
  ],
}
