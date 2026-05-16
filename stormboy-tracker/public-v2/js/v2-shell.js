/**
 * v2 shell: tab routing + lazy render.
 *
 * Each tab module registers a render(container) function with v2Shell. The
 * shell calls it the first time its tab is activated, then never again unless
 * .reset() is called explicitly.
 *
 * Routing is hash-based: /v2#work, /v2#brain, etc.
 */
window.v2Shell = (function() {
  const tabs = ['ask', 'work', 'brain', 'stats', 'messaging'];
  const defaultTab = 'work';      // operational entry-point per the v2 doctrine
  const renderers = {};           // tab -> render(container)
  const rendered  = {};           // tab -> bool

  function register(tab, renderFn) {
    renderers[tab] = renderFn;
  }

  function activate(tab) {
    if (!tabs.includes(tab)) tab = defaultTab;
    document.querySelectorAll('.v2-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    document.querySelectorAll('.v2-section').forEach(el => {
      el.classList.toggle('active', el.id === ('tab-' + tab));
    });
    if (!rendered[tab] && renderers[tab]) {
      const container = document.getElementById('tab-' + tab);
      renderers[tab](container);
      rendered[tab] = true;
    }
    if (location.hash !== '#' + tab) {
      history.replaceState(null, '', '#' + tab);
    }
  }

  function reset(tab) {
    rendered[tab] = false;
  }

  function init() {
    document.querySelectorAll('.v2-tab').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        activate(el.dataset.tab);
      });
    });
    window.addEventListener('hashchange', () => {
      activate((location.hash || '').replace('#', ''));
    });
    const initial = (location.hash || '').replace('#', '') || defaultTab;
    activate(initial);
  }

  return { init, register, activate, reset };
})();
