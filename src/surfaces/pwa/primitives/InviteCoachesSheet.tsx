import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Plus, X, Check, Send } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'

const ROLES = ['Head Coach', 'Assistant Coach', 'Volunteer'] as const
type Role = typeof ROLES[number]

type InviteRow = {
  email: string
  role: Role
}

export function InviteCoachesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<InviteRow[]>([{ email: '', role: 'Assistant Coach' }])
  const [sent, setSent] = useState(false)

  const updateEmail = (i: number, email: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, email } : r)))
  }
  const updateRole = (i: number, role: Role) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, role } : r)))
  }
  const addRow = () => setRows((prev) => [...prev, { email: '', role: 'Assistant Coach' }])
  const removeRow = (i: number) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))
  }

  const validRows = rows.filter((r) => /\S+@\S+\.\S+/.test(r.email.trim()))
  const canSend = validRows.length > 0 && !sent

  const send = () => {
    // Stub — would POST to /api/coach-invites
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setRows([{ email: '', role: 'Assistant Coach' }])
      onClose()
    }, 1400)
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Invite coaches">
      <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Send your assistant coaches a join link. They land on this team and can be assigned roles.
      </p>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {rows.map((row, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-2 rounded-2xl p-2"
              style={{ background: SYNTH.sheetMuted }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: '#FFFFFF', color: SYNTH.inkMuted }}
              >
                <Mail size={14} strokeWidth={2.4} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateEmail(i, e.target.value)}
                  placeholder="coach@example.com"
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-zinc-400"
                  style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                />
                <select
                  value={row.role}
                  onChange={(e) => updateRole(i, e.target.value as Role)}
                  className="mt-0.5 -ml-1 bg-transparent text-[10px] font-semibold uppercase tracking-[0.12em] outline-none"
                  style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  aria-label="Remove invite"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(0,0,0,0.05)', color: SYNTH.inkMuted }}
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={addRow}
          className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed py-3 text-[12px] font-semibold uppercase tracking-[0.14em]"
          style={{
            borderColor: 'rgba(0,0,0,0.18)',
            color: SYNTH.inkMuted,
            fontFamily: SYNTH.font,
          }}
        >
          <Plus size={14} strokeWidth={2.6} />
          Add another
        </button>
      </div>

      <button
        type="button"
        onClick={send}
        disabled={!canSend}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold disabled:opacity-40"
        style={{
          background: sent ? SYNTH.accentEmerald : SYNTH.ink,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        {sent ? <Check size={14} strokeWidth={2.8} /> : <Send size={14} strokeWidth={2.4} />}
        {sent
          ? `Sent ${validRows.length} invite${validRows.length === 1 ? '' : 's'}`
          : validRows.length > 0
            ? `Send ${validRows.length} invite${validRows.length === 1 ? '' : 's'}`
            : 'Add at least one email'}
      </button>
    </SheetShell>
  )
}
