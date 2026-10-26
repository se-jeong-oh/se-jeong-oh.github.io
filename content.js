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
};

// 함께 간 사람들
// total: 나를 포함한 인원 수. 화면에 숫자로 쓰지는 않고, 채워지는 좌석 수로만 보입니다 (좌석이 8개라 최대 8)
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
//   stage  : 그때의 시기 (예: '고3 겨울방학'). 비워 두면 표시되지 않음
//   when   : 연도 (예: '2019년'). 비워 두면 표시되지 않음
//   tone   : 사진이 없을 때 창밖에 보여줄 색 (style.css의 .tone-*)
//   story  : 이야기 문단들
//   photos : 사진들. 모두 창문(창밖)에 들어가고 ←/→ 키(휴대폰은 옆으로 밀기)로 넘깁니다. 첫 번째 사진이 먼저 보입니다
//            { src: 'photos/01-palau/01.jpg', alt: '사진 설명', caption: '캡션(선택)', focus: '50% 50%' }
window.TRIPS = [
  {
    places: ['팔라우'], who: 'parents', when: '', stage: '학생 때', tone: 'palau',
    story: [],
    photos: [],
  },
  {
    places: ['오키나와'], who: 'parents', when: '', stage: '고3 겨울방학', tone: 'okinawa',
    story: [],
    photos: [],
  },
  {
    places: ['오키나와'], who: 'friends', when: '', stage: '대학생, 군입대 전', tone: 'okinawa-dusk',
    story: [],
    photos: [
      { src: 'photos/03-okinawa/01.jpg', alt: '다리가 놓인 얕은 바다에서 사람들이 물놀이하는 모습', focus: '60% 50%' },
      { src: 'photos/03-okinawa/02.jpg', alt: '파란 하늘 아래 계단식으로 지은 하얀 건물', focus: '55% 50%' },
      { src: 'photos/03-okinawa/03.jpg', alt: '불빛이 켜진 밤거리에서 찍은 사진' },
    ],
  },
  {
    places: ['고베', '오사카'], who: 'grad', when: '', stage: '대학원생 · 학회', tone: 'kobe',
    story: [],
    photos: [
      { src: 'photos/04-kobe-osaka/01.jpg', alt: '나무 사이로 내려다본 시내', focus: '55% 50%' },
      { src: 'photos/04-kobe-osaka/02.jpg', alt: '요리사가 철판 위에서 고기와 채소를 굽는 모습' },
      { src: 'photos/04-kobe-osaka/03.jpg', alt: '발표 화면을 향해 앉아 있는 학회장', focus: '62% 50%' },
    ],
  },
  {
    places: ['나고야'], who: 'disciples', when: '', stage: '졸업 즈음', tone: 'nagoya',
    story: [],
    photos: [
      { src: 'photos/05-nagoya/01.jpg', alt: '여행 가방을 끌고 길을 걷는 일행' },
      { src: 'photos/05-nagoya/02.jpg', alt: '해 질 녘 버스가 지나가는 큰길' },
    ],
  },
  {
    places: ['도쿄'], who: 'village', when: '2025년', stage: '', tone: 'tokyo-night',
    story: [],
    photos: [
      { src: 'photos/06-tokyo/01.jpg', alt: '밤하늘을 가득 채운 등불' },
      { src: 'photos/06-tokyo/02.jpg', alt: '비행기 좌석에서 선글라스를 쓰고 브이를 하는 모습', focus: '38% 50%' },
      { src: 'photos/06-tokyo/03.jpg', alt: '빨간 택시가 서 있는 도쿄 시내 거리', focus: '55% 50%' },
    ],
  },
  {
    places: ['삿포로'], who: 'parents', when: '', stage: '결혼 전', tone: 'sapporo',
    story: [],
    photos: [],
  },
  {
    places: ['호주', '뉴질랜드'], who: 'wife', when: '', stage: '신혼여행', tone: 'new-zealand',
    story: [],
    photos: [
      { src: 'photos/08-australia-nz/01.jpg', alt: '큰 창 너머로 보이는 호수와 눈 덮인 산, 창가에 선 사람', focus: '70% 50%' },
      { src: 'photos/08-australia-nz/02.jpg', alt: '밤하늘을 가로지르는 은하수' },
      { src: 'photos/08-australia-nz/03.jpg', alt: '나무 사이를 걷는 에뮤', focus: '55% 50%' },
    ],
  },
  {
    places: ['도쿄'], who: 'wife', when: '', stage: '최근', tone: 'tokyo-day',
    story: [],
    photos: [
      { src: 'photos/09-tokyo/01.jpg', alt: '붉은 등과 깃발이 걸린 돌계단' },
      { src: 'photos/09-tokyo/02.jpg', alt: '장어덮밥과 반찬이 차려진 상' },
      { src: 'photos/09-tokyo/03.jpg', alt: '파란 지니 캐릭터 옆에 모인 사람들', focus: '50% 40%' },
    ],
  },
];
