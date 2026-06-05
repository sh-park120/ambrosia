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
      supplementInfoSection: 'Supplement Info',
      mySettingsSection: 'My Settings',
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

    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      signOut: 'Sign Out',
      tagline: 'Track your supplements. Understand your nutrition.',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'Your password',
      signingIn: 'Signing in…',
      signingUp: 'Signing up…',
      checkEmail: 'Check your email to confirm your account.',
      orContinueWith: 'or continue with',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
    },

    catalog: {
      browse: 'Browse Catalog',
      addToMyList: 'Add to My List',
      noResults: 'No supplements found.',
      searchPlaceholder: 'Search supplements…',
      supplementInfo: 'Supplement Info',
      mySettings: 'My Settings',
      createdByYou: 'Created by you',
      createdBy: 'By',
      removeFromList: 'Remove from My List',
      deleteFromCatalog: 'Delete from Catalog',
      catalogTitle: 'Supplement Catalog',
      nutrients: 'nutrients',
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
      supplementInfoSection: '영양제 정보',
      mySettingsSection: '내 설정',
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

    auth: {
      signIn: '로그인',
      signUp: '회원가입',
      email: '이메일',
      password: '비밀번호',
      signOut: '로그아웃',
      tagline: '영양제를 기록하고, 영양을 이해하세요.',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '비밀번호를 입력하세요',
      signingIn: '로그인 중…',
      signingUp: '가입 중…',
      checkEmail: '이메일을 확인하여 계정을 인증해 주세요.',
      orContinueWith: '또는 다음으로 계속',
      continueWithGoogle: 'Google로 계속',
      continueWithApple: 'Apple로 계속',
    },

    catalog: {
      browse: '카탈로그 둘러보기',
      addToMyList: '내 목록에 추가',
      noResults: '검색 결과가 없습니다.',
      searchPlaceholder: '영양제 검색…',
      supplementInfo: '영양제 정보',
      mySettings: '내 설정',
      createdByYou: '내가 등록',
      createdBy: '등록자',
      removeFromList: '내 목록에서 제거',
      deleteFromCatalog: '카탈로그에서 삭제',
      catalogTitle: '영양제 카탈로그',
      nutrients: '영양소',
    },
  },
}
