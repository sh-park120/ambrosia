export const translations = {
  en: {
    subtitle: 'Supplement Tracker',
    tabs: { today: 'Today', supplements: 'My Supplements', nutrients: 'Nutrients', stats: 'Stats' },
    addSupplement: '+ Add Supplement',
    enableReminders: '🔔 Enable Reminders',
    save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete',

    suppForm: {
      addTitle: 'Add Supplement', editTitle: 'Edit Supplement',
      name: 'Name *', namePlaceholder: 'e.g. Vitamin D3',
      manufacturer: 'Manufacturer', manufacturerPlaceholder: 'e.g. Nature Made',
      pillsPerDose: 'Pills per dose', dosesPerDay: 'Doses per day',
      pill: 'pill', pills: 'pills', timesPerDay: 'times/day', totalPerDay: 'total/day',
      frequency: 'Frequency', reminderTimes: 'Reminder Times',
      notes: 'Notes', notesPlaceholder: 'e.g. Take with food',
      nutrientsSection: 'Nutrients', selectNutrient: '— Select nutrient —',
      amountLabel: 'Amount', addNutrient: '+ Add Nutrient',
    },

    freq: { daily: 'Daily', twice_daily: 'Twice Daily', weekly: 'Weekly', as_needed: 'As Needed' },

    nutrientsTab: {
      title: 'Nutrients', addBtn: '+ Add Nutrient',
      addTitle: 'Add Nutrient', editTitle: 'Edit Nutrient',
      nameEn: 'Name (English)', nameKo: 'Name (Korean)',
      descEn: 'Description (English)', descKo: 'Description (Korean)',
      unit: 'Unit', unitPlaceholder: 'e.g. mg, mcg, IU',
      recDaily: 'Recommended Daily', recDailyPlaceholder: 'Amount in above unit',
      category: 'Category', emptyState: 'No nutrients yet.',
      builtIn: 'Built-in', all: 'All',
    },

    categories: {
      Vitamin: 'Vitamin', Mineral: 'Mineral', 'Fatty Acid': 'Fatty Acid',
      'Amino Acid': 'Amino Acid', Probiotic: 'Probiotic', Herb: 'Herb', Other: 'Other',
    },

    today: {
      done: 'Done', noSupplements: 'No supplements added yet.',
      goAdd: 'Go to "My Supplements" and add your first one.',
      nutritionTitle: "Today's Nutrition from Supplements",
      dvLabel: 'DV',
    },

    scale: {
      perPill: 'Per Pill',
      perDose: 'Per Dose',
      dailyTotal: 'Daily Total',
    },

    stats: {
      title: 'Last 30 Days', adherence: 'Adherence', streak: 'Streak',
      day: 'day', days: 'days', todayCheck: '✓ Today',
      noData: 'No data yet.', noDataHint: 'Add supplements and start logging in Today.',
      todayNutrients: "Today's Nutrient Totals",
    },
  },

  ko: {
    subtitle: '영양제 트래커',
    tabs: { today: '오늘', supplements: '내 영양제', nutrients: '영양소', stats: '통계' },
    addSupplement: '+ 영양제 추가',
    enableReminders: '🔔 알림 켜기',
    save: '저장', cancel: '취소', edit: '수정', delete: '삭제',

    suppForm: {
      addTitle: '영양제 추가', editTitle: '영양제 수정',
      name: '이름 *', namePlaceholder: '예: 비타민 D3',
      manufacturer: '제조사', manufacturerPlaceholder: '예: 종근당',
      pillsPerDose: '1회 알약 수', dosesPerDay: '하루 복용 횟수',
      pill: '알', pills: '알', timesPerDay: '회/일', totalPerDay: '하루 총 복용량',
      frequency: '복용 주기', reminderTimes: '알림 시간',
      notes: '메모', notesPlaceholder: '예: 식후 복용',
      nutrientsSection: '영양소', selectNutrient: '— 영양소 선택 —',
      amountLabel: '함량', addNutrient: '+ 영양소 추가',
    },

    freq: { daily: '매일', twice_daily: '하루 2회', weekly: '매주', as_needed: '필요시' },

    nutrientsTab: {
      title: '영양소 관리', addBtn: '+ 영양소 추가',
      addTitle: '영양소 추가', editTitle: '영양소 수정',
      nameEn: '이름 (영문)', nameKo: '이름 (한국어)',
      descEn: '설명 (영문)', descKo: '설명 (한국어)',
      unit: '단위', unitPlaceholder: '예: mg, mcg, IU',
      recDaily: '일일 권장량', recDailyPlaceholder: '위 단위 기준 수치',
      category: '분류', emptyState: '등록된 영양소가 없습니다.',
      builtIn: '기본 제공', all: '전체',
    },

    categories: {
      Vitamin: '비타민', Mineral: '미네랄', 'Fatty Acid': '지방산',
      'Amino Acid': '아미노산', Probiotic: '프로바이오틱스', Herb: '허브', Other: '기타',
    },

    today: {
      done: '완료', noSupplements: '등록된 영양제가 없습니다.',
      goAdd: '"내 영양제" 탭에서 첫 영양제를 추가해보세요.',
      nutritionTitle: '오늘 영양제로 섭취한 영양소',
      dvLabel: '일일 권장량',
    },

    scale: {
      perPill: '알약 1개',
      perDose: '1회 복용',
      dailyTotal: '하루 총량',
    },

    stats: {
      title: '최근 30일', adherence: '복용률', streak: '연속 복용',
      day: '일', days: '일', todayCheck: '✓ 오늘 완료',
      noData: '데이터가 없습니다.', noDataHint: '영양제를 추가하고 오늘 탭에서 복용 기록을 시작하세요.',
      todayNutrients: '오늘 영양소 합계',
    },
  },
}
