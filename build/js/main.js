document.addEventListener('DOMContentLoaded', () => {

  const servicesSlider = new Swiper('.services__slider', {
    slidesPerGroup: 1,
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    mousewheel: true,
    watchSlidesProgress: true,
    direction: 'horizontal',
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      600: {
        slidesPerView: 2,
      },
      769: {
        slidesPerView: 2,
      }
    },
    navigation: {
      nextEl: '.services-button-next',
      prevEl: '.services-button-prev'
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: "true",
    },
  });

  /**
   * Функция аккордиона
   */
  (function accordionFunc() {
    const accordionContainers = document.querySelectorAll('.accordion-items');
    if (!accordionContainers.length) return;

    document.addEventListener('click', (e) => {
      accordionContainers.forEach(container => {
        const items = container.querySelectorAll('.accordion-item');
        const activeClass = 'accordion-item--active';
        items.forEach(item => {
          if (!e.composedPath().includes(item)) {
            item.classList.remove(activeClass);
            container.classList.remove('activated');
          }
        });
      });
      ScrollTrigger.update();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      accordionContainers.forEach(container => {
        container.querySelectorAll('.accordion-item').forEach(item => {
          item.classList.remove('accordion-item--active');
        });
        container.classList.remove('activated');
      });
      ScrollTrigger.update();
    });

    accordionContainers.forEach(accordionContainer => {
      const accordionItems = accordionContainer.querySelectorAll('.accordion-item');
      const activeClass = 'accordion-item--active';

      accordionItems.forEach(item => {
        const head = item.querySelector('.accordion-head');
        if (!head) return;

        head.addEventListener('click', (e) => {
          e.stopPropagation();

          accordionItems.forEach(i => {
            if (i !== item) i.classList.remove(activeClass);
          });

          item.classList.toggle(activeClass);

          if (item.classList.contains(activeClass)) {
            accordionContainer.classList.add('activated');
          } else {
            accordionContainer.classList.remove('activated');
          }

          ScrollTrigger.update();
        });
      });
    });

  })();

  /**
   * Инициализация Fancybox
   */
  Fancybox.bind('[data-fancybox]', {
    dragToClose: false,
    closeExisting: true,
    Carousel: {
      Panzoom: {
        panMode: 'mousemove',
      },
    },
  });

});