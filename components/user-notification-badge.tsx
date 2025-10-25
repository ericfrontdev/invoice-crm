'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

export function UserNotificationBadge({ onClick }: { onClick?: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/feedback/user-unread-count')
        const data = await response.json()
        setUnreadCount(data.count || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (unreadCount === 0) {
    return null
  }

  return (
    <Link
      href="/profil/mes-feedbacks"
      className="relative cursor-pointer hover:opacity-80 transition-opacity"
      title={`${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`}
      onClick={onClick}
    >
      <MessageCircle className="h-5 w-5 text-muted-foreground" />
      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
    </Link>
  )
}
