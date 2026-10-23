/*
 * 창가 자리: content.js의 내용을 그리고, 스크롤 위치에 따라
 * 창밖(사진)·좌석·색인을 지금 읽는 여행에 맞춘다. 나(창가 A석)는 늘 그대로다.
 */
(() => {
  'use strict';

  const { SITE, PEOPLE, TRIPS } = window;
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 글자색을 어둡게 둘 밝은 창밖 색
  const LITE = new Set(['sky', 'okinawa', 'okinawa-dusk', 'nagoya', 'sapporo', 'tokyo-day']);
  // 2열 좌석. 앞줄 창가(a0)가 나. 옆자리 → 뒷줄 → 통로 건너 순서로 채운다
  const SEAT_CELLS = ['a0', 'a1', '_', 'a2', 'a3', 'b0', 'b1', '_', 'b2', 'b3'];
  const SEAT_ORDER = ['a1', 'b0', 'b1', 'a2', 'a3', 'b2', 'b3'];

  const trips = TRIPS.map((t, i) => {
    const person = PEOPLE[t.who];
    if (!person) throw new Error(`content.js: PEOPLE에 '${t.who}'가 없습니다 (${i + 1}번째 여행)`);
    if (person.total > SEAT_ORDER.length + 1) console.warn(`content.js: ${person.name} 인원(${person.total})이 좌석 수(8)보다 많습니다`);
    return { ...t, no: i + 1, key: pad(i + 1), place: t.places.join(' · '), person, photos: t.photos || [], story: t.story || [] };
  });
  const END = trips.length;                       // 마무리 장의 번호
  const tripAt = i => (i >= 0 && i < END ? trips[i] : null);
  const whoOrder = [...new Set(trips.map(t => t.who))];

  // ---------- 조각 ----------
  const paras = list => list.map(p => `<p>${esc(p)}</p>`).join('');

  const layerHTML = t => {
    const p = t && t.photos[0];
    if (p) {
      return `<div class="win-layer"><img src="${esc(p.src)}" alt="${esc(p.alt || `${t.place} 창밖`)}" style="object-position:${esc(p.focus || '50% 50%')}" decoding="async"></div>`;
    }
    const tone = (t && t.tone) || 'sky';
    return `<div class="win-layer tone tone-${esc(tone)}${LITE.has(tone) ? ' lite' : ''}">${t ? '<span class="tone-label">사진 준비 중</span>' : ''}</div>`;
  };

  const capHTML = t => {
    if (!t) return '<span><em>fig. 00</em>창가 자리</span><span></span>';
    const c = (t.photos[0] && t.photos[0].caption) || `창밖, ${t.place}`;
    return `<span><em>fig. ${t.key}</em>${esc(c)}</span><span>${esc(t.when)}</span>`;
  };

  const kicker = t => [`<span class="no">NO. ${t.key}</span>`, esc(t.stage), esc(t.when)].filter(Boolean).join(' · ');

  const gallery = t => {
    const rest = t.photos.slice(1);
    if (!rest.length) return '';
    return `<div class="gallery reveal">${rest.map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt || t.place)}" loading="lazy" decoding="async" style="object-position:${esc(p.focus || '50% 50%')}">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
  };

  const inlineWindow = t => `<figure class="a-window"><div class="win">${layerHTML(t)}</div><figcaption class="win-cap">${capHTML(t)}</figcaption></figure>`;

  // ---------- 본문 ----------
  document.title = `${SITE.title} — ${SITE.author}`;
  $('brand').innerHTML = `${esc(SITE.title)}<span>${esc(SITE.author)}</span>`;

  const intro = `
    <section class="chapter intro" id="top" data-i="-1">
      ${inlineWindow(null)}
      <p class="kicker reveal">${esc(SITE.author)}의 여행 기록</p>
      <h1 class="reveal">${esc(SITE.title)}</h1>
      <p class="lead reveal">${esc(SITE.tagline)}</p>
      ${SITE.intro && SITE.intro.length ? `<div class="story reveal">${paras(SITE.intro)}</div>` : ''}
      ${SITE.concept ? `<p class="concept reveal">${esc(SITE.concept)}</p>` : ''}
      <a class="next reveal" href="#trip-01">01 ${esc(trips[0].place)}부터, 시간 순서대로 <span aria-hidden="true">↓</span></a>
    </section>`;

  const articles = trips.map((t, i) => `
    <article class="chapter trip" id="trip-${t.key}" data-i="${i}" style="--c:${esc(t.person.color)}" aria-labelledby="trip-${t.key}-title">
      ${inlineWindow(t)}
      <p class="kicker reveal">${kicker(t)}</p>
      <h2 class="place reveal" id="trip-${t.key}-title">${esc(t.place)}</h2>
      <p class="with reveal"><i aria-hidden="true"></i>${esc(t.person.with)}<span>나 포함 ${t.person.total}명</span></p>
      <hr class="rule reveal">
      <div class="story reveal">${t.story.length ? paras(t.story) : '<p class="todo">이 여행의 이야기를 준비하고 있습니다.</p>'}</div>
      ${gallery(t)}
    </article>`).join('');

  const closing = SITE.closing || {};
  const ending = `
    <section class="chapter ending" id="end" data-i="${END}">
      <p class="kicker reveal">끝으로</p>
      <h2 class="closing reveal">${esc(closing.line)}</h2>
      <p class="cast-h reveal">함께한 사람들</p>
      <ul class="cast reveal">${whoOrder.map(k => `<li style="--c:${esc(PEOPLE[k].color)}"><i aria-hidden="true"></i>${esc(PEOPLE[k].name)}</li>`).join('')}</ul>
      ${closing.body && closing.body.length ? `<div class="story reveal">${paras(closing.body)}</div>` : ''}
      ${SITE.links && SITE.links.length ? `<p class="links reveal">${SITE.links.map(l => `<a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join('')}</p>` : ''}
    </section>`;

  $('story').innerHTML = intro + articles + ending;
  $('foot').innerHTML = `<span>© ${new Date().getFullYear()} ${esc(SITE.author)}</span><span>글과 사진 ${esc(SITE.author)}</span>`;

  // ---------- 색인 ----------
  const numLinks = nums => nums.map(n => `<a href="#trip-${pad(n)}" data-n="${n}">${pad(n)}</a>`).join('<span class="sep" aria-hidden="true">,</span>');
  const entry = (name, nums, attrs = '') => `<div class="ix-e" ${attrs}><span class="name">${esc(name)}</span><span class="dots" aria-hidden="true"></span><span class="nums">${numLinks(nums)}</span></div>`;
  const peopleIx = `<div class="ix-group"><h3>사람</h3>${whoOrder.map(k => entry(PEOPLE[k].name, trips.filter(t => t.who === k).map(t => t.no), `data-who="${k}" style="--c:${esc(PEOPLE[k].color)}"`)).join('')}</div>`;
  const placeNames = [...new Set(trips.flatMap(t => t.places))].sort((a, b) => a.localeCompare(b, 'ko'));
  const placeIx = `<div class="ix-group"><h3>장소</h3>${placeNames.map(p => entry(p, trips.filter(t => t.places.includes(p)).map(t => t.no))).join('')}</div>`;
  const bodyIx = `<div class="ix-group"><h3>본문 · 시간 순서</h3>${trips.map(t => `<div class="ix-c"><a href="#trip-${t.key}" data-n="${t.no}">${t.key}</a><span>${esc(t.place)}, ${esc(t.person.with)}</span></div>`).join('')}</div>`;
  $('ix-rail').innerHTML = peopleIx + placeIx;
  $('index-cols').innerHTML = `<div class="ix">${bodyIx}</div><div class="ix">${peopleIx}</div><div class="ix">${placeIx}</div>`;

  // ---------- 좌석 ----------
  const buildSeats = el => {
    const map = {};
    for (const c of SEAT_CELLS) {
      const d = document.createElement('div');
      if (c !== '_') {
        d.className = c === 'a0' ? 'seat me' : 'seat';
        if (c === 'a0') d.textContent = '나';
        map[c] = d;
      }
      el.append(d);
    }
    return map;
  };
  const seatSets = [buildSeats($('seats')), buildSeats($('seats-sm'))];

  const fillSeats = (t, animate) => {
    const n = t ? t.person.total - 1 : 0;
    for (const map of seatSets) {
      SEAT_ORDER.forEach((k, j) => {
        const s = map[k], on = j < n, was = s.classList.contains('on');
        if (on) s.style.setProperty('--c', t.person.color);
        s.classList.toggle('on', on);
        if (on && !was && animate && !reduced) {
          s.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 120 + j * 70, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
        }
      });
    }
  };

  // ---------- 창밖 ----------
  const swapWindow = (t, dir, first) => {
    const win = $('win');
    const holder = document.createElement('div');
    holder.innerHTML = layerHTML(t);
    const next = holder.firstElementChild;
    const olds = [...win.querySelectorAll('.win-layer')];
    win.append(next);
    if (first || reduced) { olds.forEach(o => o.remove()); return; }
    // 빠르게 넘기면 가장 최근 장면만 밀어내고 나머지는 바로 치운다
    olds.slice(0, -1).forEach(o => o.remove());
    const opts = { duration: 1100, easing: 'cubic-bezier(.65,0,.25,1)' };
    const prev = olds[olds.length - 1];
    if (prev) {
      const from = getComputedStyle(prev).transform;
      prev.getAnimations().forEach(a => a.cancel());
      prev.animate([{ transform: from === 'none' ? 'none' : from }, { transform: `translateX(${-dir * 100}%)` }], opts).onfinish = () => prev.remove();
    }
    next.animate([{ transform: `translateX(${dir * 100}%)` }, { transform: 'none' }], opts);
  };

  // 사진 파일이 없으면 색으로 대신한다
  document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const layer = img.closest('.win-layer');
    if (layer) { layer.classList.add('tone', 'tone-sky', 'lite'); layer.innerHTML = '<span class="tone-label">사진을 불러오지 못했습니다</span>'; }
    else { const fig = img.closest('figure'); if (fig) fig.remove(); }
  }, true);

  // ---------- 지금 읽는 장 ----------
  let cur = null;
  const setState = (i, first = false) => {
    if (i === cur) return;
    const dir = cur === null ? 1 : Math.sign(i - cur) || 1;
    cur = i;
    const t = tripAt(i);

    swapWindow(t, dir, first);
    $('win-cap').innerHTML = capHTML(t);
    fillSeats(t, !first);
    $('seat-lbl').innerHTML = t
      ? `<b>창가 A</b> — 나<br><b>옆자리</b> — ${esc(t.person.name)} · 나 포함 ${t.person.total}명`
      : '<b>창가 A</b> — 나';
    $('running').innerHTML = t ? `<b>${t.key}</b>${esc(t.place)} · ${esc(t.person.with)}` : (i === END ? '끝으로' : '');
    $('folio').innerHTML = t ? `${t.key} / ${pad(END)}` : (i === END ? `<span class="ko">끝</span> / ${pad(END)}` : `00 / ${pad(END)}`);
    document.querySelectorAll('.ix a[data-n]').forEach(a => a.classList.toggle('hl', !!t && +a.dataset.n === t.no));
    document.querySelectorAll('.ix [data-who]').forEach(e => e.classList.toggle('cur', !!t && e.dataset.who === t.who));
    $('mbar').classList.toggle('show', !!t);
    if (t) $('mbar-txt').innerHTML = `<b><em>${t.key}</em>${esc(t.place)}</b>${esc(t.person.with)} · 나 포함 ${t.person.total}명`;

    // 다음 장의 사진을 미리 받아 둔다
    const nt = tripAt(i + 1);
    if (nt && nt.photos[0]) { const pre = new Image(); pre.src = nt.photos[0].src; }
  };

  const chapters = [...document.querySelectorAll('.chapter')];
  setState(-1, true);
  // 화면 가운데 선을 지나는 장이 지금 읽는 장
  const centerIO = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) setState(+e.target.dataset.i);
  }, { rootMargin: '-50% 0px -50% 0px' });
  chapters.forEach(c => centerIO.observe(c));

  if (!reduced) {
    chapters.forEach(c => c.classList.add('pre'));
    const seenIO = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('seen'); seenIO.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px' });
    chapters.forEach(c => seenIO.observe(c));
  }

})();
