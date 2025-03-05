'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DateRangePickerProps {
  initialDateFrom?: Date
  initialDateTo?: Date
  onUpdate: (range: { from: Date, to: Date }) => void
}

export function DateRangePicker({
  initialDateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  initialDateTo = new Date(),
  onUpdate
}: DateRangePickerProps) {
  const [fromDate, setFromDate] = React.useState<string>(
    format(initialDateFrom, 'yyyy-MM-dd')
  )
  const [toDate, setToDate] = React.useState<string>(
    format(initialDateTo, 'yyyy-MM-dd')
  )

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value)
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value)
  }

  const handleApply = () => {
    onUpdate({
      from: new Date(fromDate),
      to: new Date(toDate)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <span className="text-xs text-neutral-500 mb-1">Desde</span>
        <Input
          type="date"
          className="h-8 w-36"
          value={fromDate}
          onChange={handleFromDateChange}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-neutral-500 mb-1">Hasta</span>
        <Input
          type="date"
          className="h-8 w-36"
          value={toDate}
          onChange={handleToDateChange}
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 mt-5"
        onClick={handleApply}
      >
        <Calendar className="h-3.5 w-3.5 mr-1" />
        Aplicar
      </Button>
    </div>
  )
} 