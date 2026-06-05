import { useState } from 'react'
import { useLang } from '../lib/LangContext'

const CATEGORIES = ['Vitamin', 'Mineral', 'Fatty Acid', 'Amino Acid', 'Probiotic', 'Herb', 'Other']

export default function NutrientForm({ initial, onSave, onCancel }) {
  const { t } = useLang()
  const nt = t.nutrientsTab

  const [nameEn, setNameEn] = useState(initial?.name_en ?? '')
  const [nameKo, setNameKo] = useState(initial?.name_ko ?? '')
  const [descEn, setDescEn] = useState(initial?.description_en ?? '')
  const [descKo, setDescKo] = useState(initial?.description_ko ?? '')
  const [unit, setUnit] = useState(initial?.unit ?? 'mg')
  const [recommended, setRecommended] = useState(initial?.recommended_daily ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'Vitamin')

  function handleSubmit(e) {
    e.preventDefault()
    if (!nameEn.trim() || !nameKo.trim()) return
    onSave({
      name_en: nameEn.trim(), name_ko: nameKo.trim(),
      description_en: descEn.trim(), description_ko: descKo.trim(),
      unit: unit.trim(),
      recommended_daily: recommended === '' ? null : Number(recommended),
      category,
    })
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <h2 className="modal-title">{initial ? nt.editTitle : nt.addTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="field">
              <label>{nt.nameEn} *</label>
              <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Vitamin C" required autoFocus />
            </div>
            <div className="field">
              <label>{nt.nameKo} *</label>
              <input value={nameKo} onChange={e => setNameKo(e.target.value)} placeholder="예: 비타민 C" required />
            </div>
          </div>
          <div className="field">
            <label>{nt.descEn}</label>
            <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={2} placeholder="e.g. Antioxidant that supports immune function." />
          </div>
          <div className="field">
            <label>{nt.descKo}</label>
            <textarea value={descKo} onChange={e => setDescKo(e.target.value)} rows={2} placeholder="예: 면역 기능을 지원하는 항산화제입니다." />
          </div>
          <div className="two-col">
            <div className="field">
              <label>{nt.unit}</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder={nt.unitPlaceholder} />
            </div>
            <div className="field">
              <label>{nt.recDaily}</label>
              <input type="number" min="0" step="any" value={recommended} onChange={e => setRecommended(e.target.value)} placeholder={nt.recDailyPlaceholder} />
            </div>
          </div>
          <div className="field">
            <label>{nt.category}</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t.categories[c] || c}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>{t.cancel}</button>
            <button type="submit" className="btn btn-primary">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
