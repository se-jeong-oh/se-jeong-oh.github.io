/*
 * 사이트의 모든 글과 사진 정보는 이 파일 하나에서 고칩니다.
 * 자세한 방법은 README.md의 "이야기와 사진 넣기"를 보세요.
 */

// 사이트 전체 문구
window.SITE = {
  title: '동행',                      // 사이트 이름 (임시)
  author: '오세정',
  tagline: '함께 떠났던 사람들과, 그곳에 대한 기록',
  intro: [
    // 자기소개 문단. 비워 두면 표시되지 않습니다.
  ],
  concept: '나는 늘 창가 자리에 앉습니다. 여행마다 바뀌는 건 창밖 풍경과, 옆자리의 사람입니다.',
  closing: {
    line: '어디를 가든, 늘 누군가와 함께였다.',
    body: [
      // 마무리 문단. 비워 두면 표시되지 않습니다.
    ],
  },
  links: [
    { label: 'GitHub', href: 'https://github.com/se-jeong-oh' },
  ],
};

// 함께 간 사람들
// total: 나를 포함한 인원 수 (좌석이 8개라 최대 8)
// color: 좌석과 점에 쓰는 색
window.PEOPLE = {
  parents:   { name: '부모님',        with: '부모님과',        total: 3, color: '#cc6a33' },
  friends:   { name: '친구들',        with: '친구들과',        total: 4, color: '#2f8a96' },
  grad:      { name: '대학원 사람들', with: '대학원 사람들과', total: 6, color: '#6b5ca5' },
  disciples: { name: '제자반',        with: '제자반과',        total: 8, color: '#4b8a3e' },
  village:   { name: '마을장',        with: '마을장과',        total: 5, color: '#2e6db2' },
  wife:      { name: '아내',          with: '아내와',          total: 2, color: '#c0476d' },
};

// 여행 (시간 순서대로. 배열 순서가 곧 01, 02, ... 번호입니다)
//   places : 장소 이름. 한 번에 여러 곳이면 여러 개
//   who    : 위 PEOPLE의 키
//   when   : 연도나 시기 (예: '2012년 여름'). 비워 두면 표시되지 않음
//   stage  : 삶의 시기 (예: '대학생'). 비워 두면 표시되지 않음
//   tone   : 사진이 없을 때 창밖에 보여줄 색 (style.css의 .tone-*)
//   story  : 이야기 문단들
//   photos : 사진들. 첫 번째 사진이 창밖(큰 창문)에, 나머지는 본문 아래에 들어갑니다
//            { src: 'photos/01-palau/01.jpg', alt: '사진 설명', caption: '캡션(선택)', focus: '50% 50%' }
window.TRIPS = [
  {
    places: ['팔라우'], who: 'parents', when: '', stage: '', tone: 'palau',
    story: [],
    photos: [],
  },
  {
    places: ['오키나와'], who: 'parents', when: '', stage: '', tone: 'okinawa',
    story: [],
    photos: [],
  },
  {
    places: ['오키나와'], who: 'friends', when: '', stage: '대학생', tone: 'okinawa-dusk',
    story: [],
    photos: [],
  },
  {
    places: ['고베', '오사카'], who: 'grad', when: '', stage: '대학원생 · 학회', tone: 'kobe',
    story: [],
    photos: [],
  },
  {
    places: ['나고야'], who: 'disciples', when: '', stage: '졸업 즈음', tone: 'nagoya',
    story: [],
    photos: [],
  },
  {
    places: ['도쿄'], who: 'village', when: '', stage: '', tone: 'tokyo-night',
    story: [],
    photos: [],
  },
  {
    places: ['삿포로'], who: 'parents', when: '', stage: '', tone: 'sapporo',
    story: [],
    photos: [],
  },
  {
    places: ['호주', '뉴질랜드'], who: 'wife', when: '', stage: '신혼여행', tone: 'new-zealand',
    story: [],
    photos: [],
  },
  {
    places: ['도쿄'], who: 'wife', when: '', stage: '', tone: 'tokyo-day',
    story: [],
    photos: [],
  },
];
