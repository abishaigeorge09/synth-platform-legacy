import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { TrustCard } from '../primitives/TrustCard'
import { APP_THEME } from '../lib/theme'

export function TrustCardPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col"
      style={{ background: APP_THEME.canvas }}
    >
      <div className="flex flex-1 flex-col px-5 pt-[max(env(safe-area-inset-top),24px)]">
        <TrustCard
          headline="Your data stays yours"
          subhead="Now let's get synth ready for you."
          illustration={<ShieldCheck size={56} color={APP_THEME.brand} strokeWidth={1.6} />}
          privacyTitle="Private by default"
          privacyBody="We never sell your data. You can disconnect a source or delete everything in one tap."
        />
      </div>

      <div className="border-t px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4"
           style={{ borderColor: APP_THEME.divider, background: APP_THEME.canvas }}>
        <button
          type="button"
          onClick={() => navigate('/app/onboarding/scanning')}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{
            background: APP_THEME.brand,
            color: '#FFFFFF',
            fontFamily: APP_THEME.fontMono,
            letterSpacing: '0.03em',
          }}
        >
          Continue
        </button>
      </div>
    </motion.div>
  )
}
