if (window.lucide) {
  window.lucide.createIcons();
}

const panels = document.querySelectorAll('.panel-enter');
const tabs = document.querySelectorAll('.tab');
const form = document.getElementById('loginForm');

if (window.anime) {
  anime({
    targets: panels,
    translateY: [28, 0],
    opacity: [0, 1],
    duration: 900,
    delay: anime.stagger(140),
    easing: 'easeOutExpo'
  });

  anime({
    targets: '.hero-metrics article, .field, .quick-actions button, .submit-button',
    translateY: [18, 0],
    opacity: [0, 1],
    duration: 720,
    delay: anime.stagger(70, { start: 320 }),
    easing: 'easeOutQuart'
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
  });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = form.querySelector('.submit-button');
  const text = button?.querySelector('span');
  if (!button || !text) return;

  text.textContent = '登录中...';
  button.disabled = true;

  window.setTimeout(() => {
    text.textContent = '登录成功';
    button.style.background = 'linear-gradient(135deg, oklch(0.74 0.17 160), oklch(0.78 0.13 200))';

    window.setTimeout(() => {
      text.textContent = '立即登录';
      button.disabled = false;
      button.style.background = 'linear-gradient(135deg, var(--brand), var(--brand-2))';
    }, 1400);
  }, 1100);
});
