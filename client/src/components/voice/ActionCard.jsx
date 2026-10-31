import React from 'react';
import { Calendar, Ticket, UserCheck, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function ActionCard({ action }) {
  if (!action) return null;

  const { type, data } = action;

  if (type === 'book_appointment' && data) {
    const dateObj = new Date(data.scheduled_at || data.scheduledAt);
    return (
      <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 shadow-sm max-w-sm">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Appointment Confirmed</span>
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{data.name}</p>
          <p className="text-slate-600 dark:text-slate-400">
            <span className="font-medium">Department:</span> {data.department}
          </p>
          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" /> Status: Booked
        </div>
      </div>
    );
  }

  if (type === 'create_ticket' && data) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 shadow-sm max-w-sm">
        <div className="flex items-center justify-between gap-2 mb-2 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Support Ticket Created</span>
          </div>
          <span className="font-mono font-bold text-xs bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
            {data.ticket_code || data.ticketCode}
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{data.subject}</p>
          <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{data.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 capitalize">Priority: {data.priority || 'medium'}</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold uppercase">Open</span>
        </div>
      </div>
    );
  }

  if (type === 'get_ticket_status' && data) {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 max-w-sm">
        <div className="flex items-center justify-between font-bold mb-1">
          <span>Ticket {data.ticket_code}</span>
          <span className="uppercase text-[11px] bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">{data.status}</span>
        </div>
        <p className="font-medium">{data.subject}</p>
      </div>
    );
  }

  if (type === 'escalate_to_human') {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/50 dark:to-orange-950/30 border border-rose-300 dark:border-rose-800 shadow-sm max-w-md">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 mb-2 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
          Escalated to Human Duty Officer
        </div>
        {data?.summary && (
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {data.summary}
          </div>
        )}
      </div>
    );
  }

  return null;
}
