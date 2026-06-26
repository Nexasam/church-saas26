import { Bell, Check, Trash2, Settings, Filter, Heart, Phone, PartyPopper, MessageSquare, Mail, Calendar, User, AlertCircle, Info, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import React from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { dashboard } from '@/routes'

interface Notification {
  id: string
  type: string
  data: Record<string, any>
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

export default function NotificationsPage() {
  const { props } = usePage()
  const [notifications, setNotifications] = useState<Notification[]>(props.notifications || [])
  const [unreadCount, setUnreadCount] = useState(props.unread_count || 0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'care' | 'followup' | 'celebration' | 'sms' | 'invitation'>('all')
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/notifications')
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/notifications/preferences')
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/notifications/read-all', { method: 'POST' })
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      const deleted = notifications.find(n => n.id === id)
      if (deleted && !deleted.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
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
    } catch (error) {
      console.error('Failed to update preferences:', error)
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
      const preview = data.message?.slice(0, 100) ?? ''
      const ellipsis = (data.message?.length ?? 0) > 100 ? '…' : ''
      return `${data.title}: "${preview}${ellipsis}"`
    }
    if (type.includes('CareCase')) return `New care case assigned: ${data.member_name}`
    if (type.includes('FollowUp')) return data.task_id ? `Follow-up task due: ${data.name}` : `Follow-up reminder: ${data.name}`
    if (type.includes('Celebration')) return `Celebration: ${data.member_name} - ${data.category}`
    if (type.includes('Sms')) return `SMS campaign "${data.title}" sent to ${data.sent_count} recipients`
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
        {showPreferences && preferences && (
          <div className="mb-6 p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_care_cases}
                      onChange={(e) => updatePreference('email_care_cases', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Heart className="w-4 h-4 text-red-500" />
                    Care Cases
                  </label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_follow_ups}
                      onChange={(e) => updatePreference('email_follow_ups', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Phone className="w-4 h-4 text-blue-500" />
                    Follow-ups
                  </label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_celebrations}
                      onChange={(e) => updatePreference('email_celebrations', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <PartyPopper className="w-4 h-4 text-yellow-500" />
                    Celebrations
                  </label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_sms}
                      onChange={(e) => updatePreference('email_sms', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    SMS Delivery
                  </label>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">In-App Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.database_care_cases}
                      onChange={(e) => updatePreference('database_care_cases', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Heart className="w-4 h-4 text-red-500" />
                    Care Cases
                  </label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.database_follow_ups}
                      onChange={(e) => updatePreference('database_follow_ups', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Phone className="w-4 h-4 text-blue-500" />
                    Follow-ups
                  </label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.database_celebrations}
                      onChange={(e) => updatePreference('database_celebrations', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <PartyPopper className="w-4 h-4 text-yellow-500" />
                    Celebrations
                  </label>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.database_sms}
                      onChange={(e) => updatePreference('database_sms', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    SMS Delivery
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Type filter */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
            className="h-8 text-xs"
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'care' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('care')}
            className="h-8 text-xs gap-1"
          >
            <Heart className="w-3 h-3" />
            Care
          </Button>
          <Button
            variant={typeFilter === 'followup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('followup')}
            className="h-8 text-xs gap-1"
          >
            <Phone className="w-3 h-3" />
            Follow-ups
          </Button>
          <Button
            variant={typeFilter === 'celebration' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('celebration')}
            className="h-8 text-xs gap-1"
          >
            <PartyPopper className="w-3 h-3" />
            Celebrations
          </Button>
          <Button
            variant={typeFilter === 'sms' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('sms')}
            className="h-8 text-xs gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            SMS
          </Button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
                    'p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors',
                    !notification.read_at && 'bg-blue-50 dark:bg-blue-900/10'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('flex size-10 items-center justify-center rounded-full', iconColor)}>
                      {React.createElement(IconComponent, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {getNotificationMessage(notification)}
                        </p>
                        {!notification.read_at && (
                          <Badge variant="default" className="h-5 text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
};
