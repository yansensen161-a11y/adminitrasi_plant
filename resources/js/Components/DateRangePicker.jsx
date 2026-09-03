import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import 'react-day-picker/style.css';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DateRangePicker({ 
  className, 
  dateFrom, 
  dateTo, 
  onDateChange 
}) {
  // Convert string dates back to Date objects if they exist
  const selectedRange = {
    from: dateFrom ? new Date(dateFrom) : undefined,
    to: dateTo ? new Date(dateTo) : undefined,
  };

  const handleSelect = (range) => {
    onDateChange({
      from: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      to: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    });
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'flex h-[38px] w-full items-center justify-start rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-left text-xs font-medium text-gray-200 hover:bg-gray-800 focus:border-[#0b5c3e] focus:outline-none focus:ring-1 focus:ring-[#0b5c3e] transition',
              !selectedRange.from && 'text-gray-400'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, 'LLL dd, y')} -{' '}
                  {format(selectedRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(selectedRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pilih Periode Tanggal</span>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-auto rounded-xl border border-gray-700 bg-gray-800 p-3 text-gray-200 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            align="start"
            sideOffset={4}
          >
            <style>
              {`
                .rdp-root {
                  --rdp-accent-color: #0b5c3e;
                  --rdp-accent-color-dark: #08422c;
                  --rdp-background-color: #1f2937;
                  --rdp-background-color-dark: #111827;
                  --rdp-text-color: #e5e7eb;
                  --rdp-outline-color: #0b5c3e;
                  --rdp-outline-size: 2px;
                  --rdp-cell-size: 40px;
                  --rdp-border-radius: 8px;
                  --rdp-selected-bg: #0b5c3e;
                  --rdp-selected-color: #ffffff;
                  --rdp-range_middle-background-color: rgba(11, 92, 62, 0.2);
                  --rdp-range_middle-color: #e5e7eb;
                  margin: 0;
                }
                .rdp-month_caption {
                  padding-bottom: 0.5rem;
                }
                .rdp-nav {
                  margin-bottom: 0.5rem;
                }
                .rdp-nav_button {
                  width: 30px;
                  height: 30px;
                }
                .rdp-day:hover:not([disabled]) {
                  background-color: #374151;
                }
                .rdp-day_selected, .rdp-day_selected:hover {
                  background-color: var(--rdp-selected-bg) !important;
                  color: var(--rdp-selected-color) !important;
                }
                .rdp-day_range_middle {
                  background-color: var(--rdp-range_middle-background-color) !important;
                  color: var(--rdp-range_middle-color) !important;
                  border-radius: 0;
                }
                .rdp-day_range_start {
                  border-top-right-radius: 0;
                  border-bottom-right-radius: 0;
                }
                .rdp-day_range_end {
                  border-top-left-radius: 0;
                  border-bottom-left-radius: 0;
                }
              `}
            </style>
            <DayPicker
              mode="range"
              defaultMonth={selectedRange.from}
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              showOutsideDays={false}
              classNames={{
                root: 'rdp-root',
                months: 'flex flex-col sm:flex-row gap-4',
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
