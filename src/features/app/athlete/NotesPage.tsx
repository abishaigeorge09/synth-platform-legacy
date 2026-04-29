import { motion } from 'framer-motion'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { APP_MOCK_NOTES } from '../data/mockNotes'
import { fmtAgo } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'

export function NotesPage() {
  // Athletes only see notes the coach explicitly shared.
  const visibleNotes = APP_MOCK_NOTES.filter((n) => n.visibleToAthlete)

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader
        title="Notes from coach"
        subtitle={`${visibleNotes.length} shared with you`}
        back="/app/athlete/home"
      />

      <section className="mx-5 mt-2 flex flex-col gap-2.5">
        {visibleNotes.length === 0 ? (
          <div
            className="rounded-2xl px-5 py-8 text-center"
            style={{
              background: SYNTH.inlineCard,
              border: `1px solid ${SYNTH.inlineCardBorder}`,
            }}
          >
            <p
              className="text-[14px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              No notes yet. Coach Geri hasn't shared anything with you.
            </p>
          </div>
        ) : (
          visibleNotes.map((note, i) => (
            <motion.article
              key={note.id}
              {...(i === 0 ? { 'data-tour': 'athlete-notes-row' } : {})}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.32 }}
              className="rounded-2xl p-4"
              style={{
                background: SYNTH.inlineCard,
                border: `1px solid ${SYNTH.inlineCardBorder}`,
              }}
            >
              <p
                className="text-[15px] leading-[1.5]"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {note.body}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p
                  className="text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    color: SYNTH.provenanceOnBrand,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  Coach Geri · {fmtAgo(note.minutesAgo)}
                </p>
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{
                    background: `${SYNTH.accentEmerald}33`,
                    color: SYNTH.accentEmerald,
                    border: `1px solid ${SYNTH.accentEmerald}66`,
                    fontFamily: SYNTH.font,
                  }}
                >
                  Shared
                </span>
              </div>
            </motion.article>
          ))
        )}
      </section>
    </div>
  )
}
