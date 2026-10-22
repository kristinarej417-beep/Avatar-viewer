(() => {
  let overlay = null;

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
    if (overlay) { overlay.remove(); overlay = null; }
  }

  function open(src) {
    close();
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);touch-action:none;overflow:hidden;display:flex;align-items:center;justify-content:center';

    const img = document.createElement('img');
    img.draggable = false;
    img.style.cssText = 'max-width:100%;max-height:100%;user-select:none;-webkit-user-drag:none;will-change:transform';
    let fellBack = false;
    img.onerror = () => { if (!fellBack) { fellBack = true; img.src = src; } };
    img.src = fullSrc(src);

    const btn = document.createElement('div');
    btn.textContent = '✕';
    btn.style.cssText = 'position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;z-index:2';
    btn.addEventListener('click', close);

    overlay.append(img, btn);
    document.body.appendChild(overlay);

    let x = 0, y = 0, s = 1, startDist = 0, startS = 1, moved = false, onBg = false;
    const pts = new Map();
    const apply = () => { img.style.transform = `translate(${x}px,${y}px) scale(${s})`; };
    const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

    overlay.addEventListener('pointerdown', e => {
      if (e.target === btn) return;
      if (pts.size === 0) { onBg = e.target === overlay; moved = false; }
      overlay.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { startDist = dist(); startS = s; }
    });

    overlay.addEventListener('pointermove', e => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      if (pts.size === 1) {
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        x += dx; y += dy;
      }
      p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 2) {
        s = Math.min(8, Math.max(0.5, startS * dist() / startDist));
        moved = true;
      }
      apply();
    });

    const up = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size === 0 && !moved && onBg) close();
    };
    overlay.addEventListener('pointerup', up);
    overlay.addEventListener('pointercancel', up);

    overlay.addEventListener('wheel', e => {
      e.preventDefault();
      s = Math.min(8, Math.max(0.5, s * (e.deltaY < 0 ? 1.1 : 0.9)));
      apply();
    }, { passive: false });

    overlay.addEventListener('dblclick', () => { x = 0; y = 0; s = 1; apply(); });
  }

  window.addEventListener('click', e => {
    const av = e.target.closest && e.target.closest('.mes .avatar');
    if (!av) return;
    const img = av.tagName === 'IMG' ? av : av.querySelector('img');
    if (!img) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(img.src);
  }, true);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
