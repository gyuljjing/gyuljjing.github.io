document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  let toastTimer;
  document.querySelectorAll('button.cta-btn').forEach((button) => {
    button.addEventListener('click', () => {
      toast.textContent = '아직 준비 중입니다.';
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
    });
  });

  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (detail.open) document.querySelectorAll('.accordion details').forEach((other) => { if (other !== detail) other.open = false; });
    });
  });

  document.querySelectorAll('[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-fallback';
      placeholder.textContent = '이미지 준비 중';
      image.replaceWith(placeholder);
    }, { once: true });
  });

  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
});
