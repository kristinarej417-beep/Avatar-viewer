(() => {
  let win = null;

  function fullSrc(src) {
    try {
      const u = new URL(src, location.origin);
      const file = u.searchParams.get('file');
      const type = u.searchParams.get('type');
      if (file && type === 'avatar') return '/characters/' + encodeURIComponent(file);
      if (file && type === 'persona') return '/User Avatars/' + encodeURIComponent(file);
    } catch (e) {}
    return src;
  }

  function close() {
    if (win) { win.remove(); win = null; }
  }

  function open(src) {
    close();
    const w0 = Math.min(Math.round(innerWidth * 0.6), 320);
    win = document.createElement('div');
    win.style.cssText = `position:fixed;left:${innerWidth - w0 - 12}px;top:90px;width:${w0}px;z-index:200;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.5)`;

    const img = document.createElement('img');
    img.draggable = false;
    img.style.cssText = 'display:block;width:100%;height:auto;border-radius:10px;pointer-events:none;-webkit-user-drag:none';
    let fellBack = false;
    img.onerror = () => { if (!fellBack) { fellBack = true; img.src = src; } };
    img.src = fullSrc(src);

    const btn = document.createElement('div');
    btn.textContent = '✕';
    btn.style.cssText = 'position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer';
    btn.addEventListener('pointerdown', e => e.stopPropagation());
    btn.addEventListener('pointerup', e => { e.stopPropagation(); close(); });

    win.append(img, btn);
    document.documentElement.appendChild(win);

    // не даём окну забирать фокус у поля ввода
    win.addEventListener('mousedown', e => e.preventDefault());
    win.addEventListener('touchstart', e => e.preventDefault(), { passive: false });

    const pts = new Map();
    let startDist = 0, startW = 0;
    const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    const num = v => parseFloat(v) || 0;

    function resize(newW) {
      const w = win.offsetWidth, h = win.offsetHeight;
      newW = Math.min(innerWidth * 2, Math.max(80, newW));
      const cx = num(win.style.left) + w / 2;
      const cy = num(win.style.top) + h / 2;
      const newH = h * newW / w;
      win.style.width = newW + 'px';
      win.style.left = (cx - newW / 2) + 'px';
      win.style.top = (cy - newH / 2) + 'px';
    }

    function clamp() {
      const w = win.offsetWidth;
      const l = Math.min(innerWidth - 60, Math.max(60 - w, num(win.style.left)));
      const t = Math.min(innerHeight - 60, Math.max(0, num(win.style.top)));
      win.style.left = l + 'px';
      win.style.top = t + 'px';
    }

    win.addEventListener('pointerdown', e => {
      win.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { startDist = dist(); startW = win.offsetWidth; }
    });

    win.addEventListener('pointermove', e => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      if (pts.size === 1) {
        win.style.left = (num(win.style.left) + e.clientX - p.x) + 'px';
        win.style.top = (num(win.style.top) + e.clientY - p.y) + 'px';
        p.x = e.clientX; p.y = e.clientY;
        clamp();
      } else if (pts.size === 2) {
        p.x = e.clientX; p.y = e.clientY;
        resize(startW * dist() / startDist);
      }
    });

    const up = e => { pts.delete(e.pointerId); };
    win.addEventListener('pointerup', up);
    win.addEventListener('pointercancel', up);

    win.addEventListener('wheel', e => {
      e.preventDefault();
      resize(win.offsetWidth * (e.deltaY < 0 ? 1.1 : 0.9));
    }, { passive: false });
  }

  window.addEventListener('click', e => {
    const t = e.target;
    const av = t.closest && t.closest('.mes .avatar');
    if (!av) return;
    const img = av.tagName === 'IMG' ? av : av.querySelector('img');
    if (!img) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(img.src);
  }, true);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
