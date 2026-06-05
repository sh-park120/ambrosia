import { useLang } from '../lib/LangContext'

const SCALES = ['pill', 'dose', 'day']

export default function ScaleToggle({ value, onChange }) {
  const { t } = useLang()
  const labels = {
    pill: t.scale.perPill,
    dose: t.scale.perDose,
    day:  t.scale.dailyTotal,
  }
  return (
    <div className="scale-toggle">
      {SCALES.map(s => (
        <button
          key={s}
          className={value === s ? 'active' : ''}
          onClick={() => onChange(s)}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  )
}
