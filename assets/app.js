/*
 * 창가 자리: content.js의 내용을 그리고, 지금 읽는 여행에 맞춰 창밖(사진)·좌석·색인을 바꾼다.
 * 나(창가 A석)는 늘 그대로다.
 *
 * 조작
 *   ↓ / ↑  : 다음 · 이전 여행 (창밖 사진은 아래에서 올라오며 바뀐다)
 *   ← / →  : 같은 여행의 다른 사진 (옆에서 밀려 들어온다). 휴대폰은 창문을 옆으로 민다
 *   스크롤 : 화면 가운데 선을 지나는 여행이 지금 여행
 */
(() => {
  'use strict';

  const { SITE, PEOPLE, TRIPS } = window;
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fromHTML = s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 759px)');

  // 글자색을 어둡게 둘 밝은 창밖 색
  const LITE = new Set(['sky', 'okinawa', 'okinawa-dusk', 'nagoya', 'sapporo', 'tokyo-day']);
  // 2열 좌석. 앞줄 창가(a0)가 나. 옆자리 → 뒷줄 → 통로 건너 순서로 채운다
  const SEAT_CELLS = ['a0', 'a1', '_', 'a2', 'a3', 'b0', 'b1', '_', 'b2', 'b3'];
  const SEAT_ORDER = ['a1', 'b0', 'b1', 'a2', 'a3', 'b2', 'b3'];
  const EASE = 'cubic-bezier(.65,0,.25,1)';
  const ICON = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  };

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
  const imgHTML = (t, p, lazy) => `<img src="${esc(p.src)}" alt="${esc(p.alt || `${t.place} 창밖`)}" style="object-position:${esc(p.focus || '50% 50%')}" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
  const toneHTML = t => {
    const tone = (t && t.tone) || 'sky';
    return `<div class="win-layer tone tone-${esc(tone)}${LITE.has(tone) ? ' lite' : ''}">${t ? '<span class="tone-label">사진 준비 중</span>' : ''}</div>`;
  };
  const layerHTML = (t, k) => { const p = t && t.photos[k]; return p ? `<div class="win-layer">${imgHTML(t, p)}</div>` : toneHTML(t); };
  const capHTML = (t, k) => {
    if (!t) return '<span><em>fig. 00</em>창가 자리</span><span></span>';
    const p = t.photos[k];
    return `<span><em>fig. ${t.key}</em>${esc((p && p.caption) || `창밖, ${t.place}`)}</span><span>${esc(t.when)}</span>`;
  };
  const dotsHTML = (t, k) => (t && t.photos.length > 1
    ? t.photos.map((_, j) => `<button type="button" class="dot${j === k ? ' on' : ''}" data-k="${j}" aria-label="사진 ${j + 1}"${j === k ? ' aria-current="true"' : ''}></button>`).join('')
    : '');
  const kicker = t => [`<span class="no">NO. ${t.key}</span>`, esc(t.stage), esc(t.when)].filter(Boolean).join(' · ');

  // 휴대폰: 본문 안 창문. 사진은 옆으로 밀어 넘긴다
  const inlineWindow = (t, i) => {
    const slides = t && t.photos.length
      ? t.photos.map((p, j) => `<div class="slide">${imgHTML(t, p, j > 0)}</div>`).join('')
      : `<div class="slide">${toneHTML(t)}</div>`;
    return `<figure class="a-window" data-i="${i}"><div class="win"><div class="track">${slides}</div><div class="win-dots">${dotsHTML(t, 0)}</div></div><figcaption class="win-cap">${capHTML(t, 0)}</figcaption></figure>`;
  };

  // ---------- 본문 ----------
  document.title = `${SITE.title} — ${SITE.author}`;
  $('brand').innerHTML = `${esc(SITE.title)}<span>${esc(SITE.author)}</span>`;

  const intro = `
    <section class="chapter intro" id="top" data-i="-1">
      ${inlineWindow(null, -1)}
      <p class="kicker reveal">${esc(SITE.author)}의 여행 기록</p>
      <h1 class="reveal">${esc(SITE.title)}</h1>
      <p class="lead reveal">${esc(SITE.tagline)}</p>
      ${SITE.intro && SITE.intro.length ? `<div class="story reveal">${paras(SITE.intro)}</div>` : ''}
      ${SITE.concept ? `<p class="concept reveal">${esc(SITE.concept)}</p>` : ''}
      <a class="start reveal" href="#trip-01">01 ${esc(trips[0].place)}부터, 시간 순서대로 <span aria-hidden="true">↓</span></a>
    </section>`;

  const articles = trips.map((t, i) => `
    <article class="chapter trip" id="trip-${t.key}" data-i="${i}" style="--c:${esc(t.person.color)}" aria-labelledby="trip-${t.key}-title">
      ${inlineWindow(t, i)}
      <p class="kicker reveal">${kicker(t)}</p>
      <h2 class="place reveal" id="trip-${t.key}-title">${esc(t.place)}</h2>
      <p class="with reveal"><i aria-hidden="true"></i>${esc(t.person.with)}</p>
      <hr class="rule reveal">
      <div class="story reveal">${t.story.length ? paras(t.story) : '<p class="todo">이 여행의 이야기를 준비하고 있습니다.</p>'}</div>
    </article>`).join('');

  const closing = SITE.closing || {};
  const ending = `
    <section class="chapter ending" id="end" data-i="${END}">
      <p class="kicker reveal">끝으로</p>
      <h2 class="closing reveal">${esc(closing.line)}</h2>
      ${closing.body && closing.body.length ? `<div class="story reveal">${paras(closing.body)}</div>` : ''}
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
          s.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 160 + j * 70, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
        }
      });
    }
  };

  // ---------- 창밖 (넓은 화면의 고정 창문) ----------
  const win = $('win');
  win.insertAdjacentHTML('beforeend',
    `<button type="button" class="win-btn prev" id="win-prev" aria-label="이전 사진">${ICON.prev}</button>` +
    `<button type="button" class="win-btn next" id="win-next" aria-label="다음 사진">${ICON.next}</button>` +
    '<div class="win-dots" id="win-dots"></div>');

  // 새 장면이 옛 장면 위로 덮이며 들어오고, 옛 장면은 조금만 물러나며 어두워진다
  // axis 'y' = 여행이 바뀔 때(아래에서 위로), 'x' = 같은 여행의 사진이 바뀔 때(옆에서)
  const swapWindow = (t, k, axis, dir, instant) => {
    const next = fromHTML(layerHTML(t, k));
    const olds = [...win.querySelectorAll('.win-layer')];
    win.insertBefore(next, $('win-prev'));
    if (instant || reduced) { olds.forEach(o => o.remove()); return; }
    olds.slice(0, -1).forEach(o => o.remove());
    const move = axis === 'y' ? 'translateY' : 'translateX';
    const opts = { duration: axis === 'y' ? 950 : 750, easing: EASE };
    const prev = olds[olds.length - 1];
    if (prev) {
      const from = getComputedStyle(prev).transform;
      prev.getAnimations().forEach(a => a.cancel());
      prev.animate([{ transform: from === 'none' ? 'none' : from, filter: 'brightness(1)' },
                    { transform: `${move}(${-dir * 28}%) scale(1.03)`, filter: 'brightness(.78)' }], opts).onfinish = () => prev.remove();
    }
    next.animate([{ transform: `${move}(${dir * 100}%)` }, { transform: 'none' }], opts);
  };

  const renderWindowUI = (t, k) => {
    $('win-cap').innerHTML = capHTML(t, k);
    $('win-dots').innerHTML = dotsHTML(t, k);
    win.classList.toggle('multi', !!t && t.photos.length > 1);
    $('keys-photo').hidden = !(t && t.photos.length > 1);
  };

  // 사진 파일이 없으면 색으로 대신한다
  document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const layer = img.closest('.win-layer, .slide');
    if (layer) { layer.innerHTML = '<div class="win-layer tone tone-sky lite"><span class="tone-label">사진을 불러오지 못했습니다</span></div>'; }
  }, true);

  // ---------- 사진 넘기기 ----------
  const photoAt = new Map();                       // 여행 번호 → 보고 있는 사진 번호
  const trackOf = i => document.querySelector(`.a-window[data-i="${i}"] .track`);
  let cur = null;

  const goPhoto = (k, dir) => {
    const t = tripAt(cur);
    if (!t || t.photos.length < 2) return;
    const n = t.photos.length, from = photoAt.get(cur) || 0, to = ((k % n) + n) % n;
    if (to === from) return;
    if (narrow.matches) {
      const track = trackOf(cur);
      if (track) track.scrollTo({ left: to * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
      return;                                      // 나머지는 track의 scroll 처리에서
    }
    photoAt.set(cur, to);
    swapWindow(t, to, 'x', dir || (to > from ? 1 : -1));
    renderWindowUI(t, to);
  };
  const stepPhoto = d => goPhoto((photoAt.get(cur) || 0) + d, d);

  $('win-prev').addEventListener('click', () => stepPhoto(-1));
  $('win-next').addEventListener('click', () => stepPhoto(1));
  $('win-dots').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) goPhoto(+b.dataset.k); });

  // 휴대폰 창문: 밀어서 넘긴 사진에 맞춰 점과 캡션을 바꾼다
  document.querySelectorAll('.a-window').forEach(fig => {
    const i = +fig.dataset.i, t = tripAt(i), track = fig.querySelector('.track');
    if (!t || t.photos.length < 2) return;
    let raf = 0, shown = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const k = Math.round(track.scrollLeft / track.clientWidth);
        if (k === shown) return;
        shown = k;
        photoAt.set(i, k);
        fig.querySelector('.win-dots').innerHTML = dotsHTML(t, k);
        fig.querySelector('.win-cap').innerHTML = capHTML(t, k);
      });
    }, { passive: true });
    fig.querySelector('.win-dots').addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (b) track.scrollTo({ left: +b.dataset.k * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // ---------- 지금 여행 ----------
  const setState = i => {
    if (i === cur) return;
    const first = cur === null, dir = first ? 1 : Math.sign(i - cur) || 1;
    cur = i;
    const t = tripAt(i), k = t ? photoAt.get(i) || 0 : 0;

    swapWindow(t, k, 'y', dir, first);
    renderWindowUI(t, k);
    fillSeats(t, !first);
    $('seat-lbl').innerHTML = t ? `<b>창가 A</b> — 나<br><b>옆자리</b> — ${esc(t.person.name)}` : '<b>창가 A</b> — 나';
    $('running').innerHTML = t ? `<b>${t.key}</b>${esc(t.place)} · ${esc(t.person.with)}` : (i === END ? '끝으로' : '');
    $('folio').innerHTML = t ? `${t.key} / ${pad(END)}` : (i === END ? `<span class="ko">끝</span> / ${pad(END)}` : `00 / ${pad(END)}`);
    document.querySelectorAll('.ix a[data-n]').forEach(a => a.classList.toggle('hl', !!t && +a.dataset.n === t.no));
    document.querySelectorAll('.ix [data-who]').forEach(e => e.classList.toggle('cur', !!t && e.dataset.who === t.who));
    $('mbar').classList.toggle('show', !!t);
    if (t) $('mbar-txt').innerHTML = `<b><em>${t.key}</em>${esc(t.place)}</b>${esc(t.person.with)}`;

    // 이 여행의 사진과 다음 여행의 첫 사진을 미리 받아 둔다
    const nt = tripAt(i + 1);
    for (const p of [...(t ? t.photos : []), ...(nt && nt.photos[0] ? [nt.photos[0]] : [])]) { const pre = new Image(); pre.src = p.src; }
  };

  const chapters = [...document.querySelectorAll('.chapter')];
  const chapterEl = i => document.querySelector(`.chapter[data-i="${i}"]`);
  const marginOf = el => parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const topOf = el => el.getBoundingClientRect().top + scrollY - marginOf(el);
  // 화면 가운데 선에 걸친 장
  const centerIndex = () => {
    const mid = innerHeight / 2;
    const hit = chapters.find(c => { const r = c.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    return hit ? +hit.dataset.i : (scrollY < 10 ? -1 : END);
  };

  setState(centerIndex());
  const centerIO = new IntersectionObserver(entries => {
    if (target !== null) return;                   // 키로 넘기는 중에는 스크롤이 끝난 뒤 맞춘다
    for (const e of entries) if (e.isIntersecting) setState(+e.target.dataset.i);
  }, { rootMargin: '-50% 0px -50% 0px' });
  chapters.forEach(c => centerIO.observe(c));

  // ---------- ↓ ↑ 키: 부드러운 스크롤로 다음 · 이전 여행 ----------
  let anim = 0, target = null;
  const finish = () => { anim = 0; target = null; setState(centerIndex()); };
  const stopScroll = () => { if (anim) { cancelAnimationFrame(anim); finish(); } };
  for (const ev of ['wheel', 'touchstart', 'mousedown']) addEventListener(ev, stopScroll, { passive: true });

  const scrollToY = y => {
    cancelAnimationFrame(anim);
    const max = document.documentElement.scrollHeight - innerHeight;
    const y0 = scrollY, y1 = Math.max(0, Math.min(max, Math.round(y))), dy = y1 - y0;
    if (reduced || Math.abs(dy) < 2) { window.scrollTo({ top: y1, behavior: 'instant' }); finish(); return; }
    const dur = Math.min(1100, Math.max(650, 450 + Math.abs(dy) * 0.35)), t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo({ top: y0 + dy * e, behavior: 'instant' });
      if (p < 1) anim = requestAnimationFrame(step); else finish();
    };
    anim = requestAnimationFrame(step);
  };

  const stepChapter = d => {
    const base = target ?? cur;
    const ch = chapterEl(base);
    if (target === null && ch) {
      // 글이 길어 아직 안 보인 부분이 있으면, 다음 여행으로 가기 전에 그만큼 먼저 보여준다
      if (d > 0) {
        const hidden = ch.lastElementChild.getBoundingClientRect().bottom - (innerHeight - (narrow.matches ? 100 : 28));
        if (hidden > innerHeight * 0.12) { target = base; scrollToY(scrollY + Math.min(hidden + 32, innerHeight * 0.75)); return; }
      } else {
        const above = marginOf(ch) - ch.getBoundingClientRect().top;
        if (above > innerHeight * 0.12) { target = base; scrollToY(topOf(ch)); return; }
      }
    }
    const next = Math.max(-1, Math.min(END, base + d));
    if (next === base) {
      const ix = $('index');
      if (d > 0 && getComputedStyle(ix).display !== 'none') { target = base; scrollToY(ix.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head'))); }
      return;
    }
    target = next;
    setState(next);                                // 창밖 전환과 스크롤을 함께 시작한다
    scrollToY(topOf(chapterEl(next)));
  };

  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.isComposing) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); stepChapter(e.key === 'ArrowDown' ? 1 : -1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const t = tripAt(cur);
      if (t && t.photos.length > 1) { e.preventDefault(); stepPhoto(e.key === 'ArrowRight' ? 1 : -1); }
    }
  });

  // ---------- 나타나는 움직임 ----------
  if (!reduced) {
    chapters.forEach(c => c.classList.add('pre'));
    const seenIO = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('seen'); seenIO.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px' });
    chapters.forEach(c => seenIO.observe(c));
  }
})();
