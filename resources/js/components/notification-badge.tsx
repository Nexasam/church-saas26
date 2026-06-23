import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/notifications')
      const data = await response.json()
      setUnreadCount(data.unread_count)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  return (
    <button
      onClick={() => router.get('/notifications')}
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
