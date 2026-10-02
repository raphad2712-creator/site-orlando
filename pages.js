const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

document.querySelectorAll('[data-gallery-start]').forEach(grid => {
  const start = Number(grid.dataset.galleryStart);
  const end = Number(grid.dataset.galleryEnd);
  const label = grid.dataset.galleryLabel;

  for (let number = start; number <= end; number += 1) {
    const padded = String(number).padStart(2, '0');
    const button = document.createElement('button');
    const image = document.createElement('img');
    button.type = 'button';
    button.className = 'photo-card';
    button.dataset.full = `assets/gallery/photo-${padded}.jpg`;
    button.setAttribute('aria-label', `Ampliar ${label.toLowerCase()} ${number - start + 1}`);
    image.src = button.dataset.full;
    image.alt = `${label} ${number - start + 1}`;
    image.loading = number === start ? 'eager' : 'lazy';
    button.appendChild(image);
    grid.appendChild(button);
  }
});

const galleryItems = [...document.querySelectorAll('.photo-card')];
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
let activeImage = 0;

function showImage(index) {
  if (!lightbox || !galleryItems.length) return;
  activeImage = (index + galleryItems.length) % galleryItems.length;
  lightboxImage.src = galleryItems[activeImage].dataset.full;
  lightboxImage.alt = galleryItems[activeImage].querySelector('img').alt;
  if (!lightbox.open) lightbox.showModal();
}

galleryItems.forEach((item, index) => item.addEventListener('click', () => showImage(index)));
document.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox-prev')?.addEventListener('click', () => showImage(activeImage - 1));
document.querySelector('.lightbox-next')?.addEventListener('click', () => showImage(activeImage + 1));
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener('keydown', event => {
  if (!lightbox?.open) return;
  if (event.key === 'ArrowLeft') showImage(activeImage - 1);
  if (event.key === 'ArrowRight') showImage(activeImage + 1);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
