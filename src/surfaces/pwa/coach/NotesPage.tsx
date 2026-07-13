import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, EyeOff, X, Check } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { APP_MOCK_NOTES, type AppMockNote } from '../data/mockNotes'
import { APP_MOCK_ATHLETES, fmtAgo } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

export function NotesPage() {
  const navigate = useNavigate()
  const [composerOpen, setComposerOpen] = useState(false)
  const [notes, setNotes] = useState<AppMockNote[]>(APP_MOCK_NOTES)

  const onAdd = (note: AppMockNote) => {
    setNotes((s) => [note, ...s])
    setComposerOpen(false)
  }

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader
        title="Notes"
        subtitle={`${notes.length} entries`}
        back="/app/coach/home"
        rightSlot={
          <button
            type="button"
            aria-label="New note"
            data-tour="coach-notes-add"
            onClick={() => setComposerOpen(true)}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              boxShadow: SYNTH.shadow.actionCircle,
            }}
          >
            <Plus size={18} strokeWidth={2.6} />
          </button>
        }
      />

      <section className="mx-5 mt-2">
        <div className="flex flex-col gap-2.5">
          {notes.map((note, i) => (
            <div key={note.id} {...(i === 0 ? { 'data-tour': 'coach-notes-row' } : {})}>
              <NoteCard
                note={note}
                index={i}
                onAthleteTap={() => navigate(`/app/coach/athlete/${note.athleteId}`)}
              />
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {composerOpen ? (
          <ComposerSheet onClose={() => setComposerOpen(false)} onSubmit={onAdd} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function NoteCard({
  note,
  index,
  onAthleteTap,
}: {
  note: AppMockNote
  index: number
  onAthleteTap: () => void
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32 }}
      className="rounded-2xl p-4"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onAthleteTap}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:opacity-70"
          style={{
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        >
          {note.initials}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onAthleteTap}
              className="text-[13px] font-semibold active:opacity-70"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {note.athleteName}
            </button>
            <span
              className="text-[10px] uppercase tracking-[0.14em]"
              style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
            >
              {fmtAgo(note.minutesAgo)}
            </span>
          </div>
          <p
            className="mt-1.5 text-[14px] leading-[1.5]"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {note.body}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
               style={{
                 background: note.visibleToAthlete ? `${SYNTH.accentEmerald}33` : SYNTH.glass,
                 color: note.visibleToAthlete ? SYNTH.accentEmerald : SYNTH.inkOnBrandMuted,
                 border: `1px solid ${note.visibleToAthlete ? SYNTH.accentEmerald : SYNTH.glassBorder}`,
                 fontFamily: SYNTH.font,
               }}>
            {note.visibleToAthlete ? <Eye size={10} strokeWidth={2.4} /> : <EyeOff size={10} strokeWidth={2.4} />}
            {note.visibleToAthlete ? 'Shared' : 'Private'}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function ComposerSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (note: AppMockNote) => void
}) {
  const [athleteId, setAthleteId] = useState<string>(APP_MOCK_ATHLETES[0].id)
  const [body, setBody] = useState('')
  const [visible, setVisible] = useState(false)

  const submit = () => {
    if (!body.trim()) return
    const athlete = APP_MOCK_ATHLETES.find((a) => a.id === athleteId)!
    onSubmit({
      id: `n-${Date.now()}`,
      athleteId: athlete.id,
      athleteName: athlete.name,
      initials: athlete.initials,
      body: body.trim(),
      minutesAgo: 0,
      visibleToAthlete: visible,
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
      />
      <motion.div
        initial={{ y: 600 }}
        animate={{ y: 0 }}
        exit={{ y: 600 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          background: SYNTH.sheet,
          borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
          maxHeight: '85dvh',
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div
            className="mx-auto h-1 w-10 rounded-full"
            style={{ background: SYNTH.sheetMuted, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkMuted }}
          >
            New note
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-6 pt-2">
          <div>
            <label
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SYNTH.inkMuted }}
            >
              Athlete
            </label>
            <div className="flex flex-wrap gap-2">
              {APP_MOCK_ATHLETES.map((a) => {
                const active = a.id === athleteId
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAthleteId(a.id)}
                    className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                    style={{
                      background: active ? SYNTH.accentBlack : SYNTH.sheet,
                      borderColor: active ? SYNTH.accentBlack : SYNTH.sheetMuted,
                      color: active ? SYNTH.inkOnBrand : SYNTH.ink,
                      fontFamily: SYNTH.font,
                    }}
                  >
                    {a.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SYNTH.inkMuted }}
            >
              Note
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              autoFocus
              rows={5}
              placeholder="What did you notice?"
              className="block w-full resize-none rounded-2xl px-4 py-3 text-[15px] outline-none"
              style={{
                background: SYNTH.sheetMuted,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
            style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
              style={{
                borderColor: visible ? SYNTH.accentEmerald : SYNTH.inkMuted,
                background: visible ? SYNTH.accentEmerald : 'transparent',
              }}
            >
              {visible ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold" style={{ fontFamily: SYNTH.font }}>
                Share with athlete
              </p>
              <p className="text-[11px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                {visible ? 'Visible in their notes feed' : 'Coach-only by default'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!body.trim()}
            className="mt-1 rounded-full py-3.5 text-[14px] font-semibold disabled:opacity-40"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            Save note
          </button>
        </div>
      </motion.div>
    </>
  )
}
