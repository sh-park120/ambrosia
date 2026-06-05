import { supabase } from './supabase'

const DEFAULT_NUTRIENTS = [
  { name_en: 'Vitamin A', name_ko: '비타민 A', unit: 'mcg', recommended_daily: 900, category: 'Vitamin', description_en: 'Essential for vision, immune function, and cell growth.', description_ko: '시력, 면역 기능, 세포 성장에 필수적입니다.' },
  { name_en: 'Vitamin B1 (Thiamine)', name_ko: '비타민 B1 (티아민)', unit: 'mg', recommended_daily: 1.2, category: 'Vitamin', description_en: 'Helps convert food into energy and supports nerve function.', description_ko: '음식을 에너지로 전환하고 신경 기능을 지원합니다.' },
  { name_en: 'Vitamin B2 (Riboflavin)', name_ko: '비타민 B2 (리보플라빈)', unit: 'mg', recommended_daily: 1.3, category: 'Vitamin', description_en: 'Supports energy production and cellular function.', description_ko: '에너지 생산과 세포 기능을 지원합니다.' },
  { name_en: 'Vitamin B3 (Niacin)', name_ko: '비타민 B3 (나이아신)', unit: 'mg', recommended_daily: 16, category: 'Vitamin', description_en: 'Supports metabolism and DNA repair.', description_ko: '대사와 DNA 복구를 지원합니다.' },
  { name_en: 'Vitamin B5 (Pantothenic Acid)', name_ko: '비타민 B5 (판토텐산)', unit: 'mg', recommended_daily: 5, category: 'Vitamin', description_en: 'Essential for coenzyme A synthesis and metabolism.', description_ko: '코엔자임 A 합성과 대사에 필수적입니다.' },
  { name_en: 'Vitamin B6', name_ko: '비타민 B6', unit: 'mg', recommended_daily: 1.7, category: 'Vitamin', description_en: 'Supports protein metabolism and neurotransmitter synthesis.', description_ko: '단백질 대사와 신경전달물질 합성을 지원합니다.' },
  { name_en: 'Vitamin B7 (Biotin)', name_ko: '비타민 B7 (비오틴)', unit: 'mcg', recommended_daily: 30, category: 'Vitamin', description_en: 'Supports hair, skin, nail health and metabolism.', description_ko: '모발, 피부, 손톱 건강과 대사를 지원합니다.' },
  { name_en: 'Vitamin B9 (Folate)', name_ko: '비타민 B9 (엽산)', unit: 'mcg', recommended_daily: 400, category: 'Vitamin', description_en: 'Critical for cell division and DNA synthesis.', description_ko: '세포 분열과 DNA 합성에 중요합니다.' },
  { name_en: 'Vitamin B12', name_ko: '비타민 B12', unit: 'mcg', recommended_daily: 2.4, category: 'Vitamin', description_en: 'Essential for red blood cell formation and nerve function.', description_ko: '적혈구 형성과 신경 기능에 필수적입니다.' },
  { name_en: 'Vitamin C', name_ko: '비타민 C', unit: 'mg', recommended_daily: 90, category: 'Vitamin', description_en: 'Antioxidant that supports immune function and collagen synthesis.', description_ko: '면역 기능과 콜라겐 합성을 지원하는 항산화제입니다.' },
  { name_en: 'Vitamin D3', name_ko: '비타민 D3', unit: 'IU', recommended_daily: 600, category: 'Vitamin', description_en: 'Supports calcium absorption, bone health, and immune function.', description_ko: '칼슘 흡수, 골 건강, 면역 기능을 지원합니다.' },
  { name_en: 'Vitamin E', name_ko: '비타민 E', unit: 'mg', recommended_daily: 15, category: 'Vitamin', description_en: 'Antioxidant that protects cells from oxidative damage.', description_ko: '산화적 손상으로부터 세포를 보호하는 항산화제입니다.' },
  { name_en: 'Vitamin K1', name_ko: '비타민 K1', unit: 'mcg', recommended_daily: 120, category: 'Vitamin', description_en: 'Essential for blood clotting and bone metabolism.', description_ko: '혈액 응고와 골 대사에 필수적입니다.' },
  { name_en: 'Vitamin K2', name_ko: '비타민 K2', unit: 'mcg', recommended_daily: 90, category: 'Vitamin', description_en: 'Directs calcium to bones and away from arteries.', description_ko: '칼슘을 뼈로 유도하고 동맥을 보호합니다.' },
  { name_en: 'Calcium', name_ko: '칼슘', unit: 'mg', recommended_daily: 1000, category: 'Mineral', description_en: 'Essential for bone health, muscle function, and nerve signaling.', description_ko: '골 건강, 근육 기능, 신경 신호에 필수적입니다.' },
  { name_en: 'Iron', name_ko: '철분', unit: 'mg', recommended_daily: 8, category: 'Mineral', description_en: 'Required for hemoglobin synthesis and oxygen transport.', description_ko: '헤모글로빈 합성과 산소 운반에 필요합니다.' },
  { name_en: 'Magnesium', name_ko: '마그네슘', unit: 'mg', recommended_daily: 420, category: 'Mineral', description_en: 'Supports over 300 enzymatic reactions in the body.', description_ko: '체내 300가지 이상의 효소 반응을 지원합니다.' },
  { name_en: 'Zinc', name_ko: '아연', unit: 'mg', recommended_daily: 11, category: 'Mineral', description_en: 'Supports immune function, wound healing, and DNA synthesis.', description_ko: '면역 기능, 상처 치유, DNA 합성을 지원합니다.' },
  { name_en: 'Selenium', name_ko: '셀레늄', unit: 'mcg', recommended_daily: 55, category: 'Mineral', description_en: 'Antioxidant mineral that supports thyroid function.', description_ko: '갑상선 기능을 지원하는 항산화 미네랄입니다.' },
  { name_en: 'Iodine', name_ko: '요오드', unit: 'mcg', recommended_daily: 150, category: 'Mineral', description_en: 'Essential for thyroid hormone production.', description_ko: '갑상선 호르몬 생성에 필수적입니다.' },
  { name_en: 'Copper', name_ko: '구리', unit: 'mg', recommended_daily: 0.9, category: 'Mineral', description_en: 'Supports iron metabolism and connective tissue formation.', description_ko: '철분 대사와 결합 조직 형성을 지원합니다.' },
  { name_en: 'Omega-3 (EPA+DHA)', name_ko: '오메가-3 (EPA+DHA)', unit: 'mg', recommended_daily: 1000, category: 'Fatty Acid', description_en: 'Supports heart health, brain function, and reduces inflammation.', description_ko: '심장 건강, 뇌 기능을 지원하고 염증을 줄입니다.' },
  { name_en: 'Coenzyme Q10', name_ko: '코엔자임 Q10', unit: 'mg', recommended_daily: 100, category: 'Other', description_en: 'Antioxidant that supports cellular energy production.', description_ko: '세포 에너지 생산을 지원하는 항산화제입니다.' },
  { name_en: 'Lutein', name_ko: '루테인', unit: 'mg', recommended_daily: 10, category: 'Other', description_en: 'Supports eye health and protects against macular degeneration.', description_ko: '눈 건강을 지원하고 황반변성을 예방합니다.' },
  { name_en: 'Probiotics', name_ko: '프로바이오틱스', unit: 'CFU', recommended_daily: 1000000000, category: 'Probiotic', description_en: 'Beneficial bacteria that support gut health and immune function.', description_ko: '장 건강과 면역 기능을 지원하는 유익균입니다.' },
]

export async function seedNutrientsIfEmpty() {
  const { count, error } = await supabase
    .from('nutrients')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('[Ambrosia] nutrients table missing — run the Supabase SQL setup:', error.message)
    return
  }
  if (count > 0) return

  const { error: insertError } = await supabase.from('nutrients').insert(DEFAULT_NUTRIENTS)
  if (insertError) console.error('[Ambrosia] Failed to seed nutrients:', insertError.message)
}
