'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ClientWithAmounts = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
  unpaidAmounts: Array<{
    id: string
    amount: number
    description: string
    date: Date
    dueDate: Date | null
    status: string
  }>
}
