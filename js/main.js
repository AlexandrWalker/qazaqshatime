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
        slidesPerView: 1,
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

  function initQuizProgress(quizElement) {
    const segments = quizElement.querySelectorAll('.task__segment');
    const nextBtn = quizElement.querySelector('.js-next-btn');
    const currentStepText = quizElement.querySelector('.current-step');
    const totalStepsText = quizElement.querySelector('.total-steps');

    const taskBody = quizElement.querySelector('.task__body');
    const taskPairs = quizElement.querySelector('.task__pairs');
    const taskBuilding = quizElement.querySelector('.task__building'); // Новый блок сборки слов

    let pairCounter = 0; // Счетчик для связи пар между собой

    if (taskBody) {
      taskBody.addEventListener('click', (e) => {
        const clickedItem = e.target.closest('.js-item');
        const clickedNull = e.target.closest('.task__building-null');

        // === СЦЕНАРИЙ 3: Клик по заполненной ячейке в блоке сборки предложений (ОТМЕНА) ===
        if (taskBuilding && clickedNull && clickedNull.classList.contains('js-item-active')) {
          const originalIndex = clickedNull.getAttribute('data-origin-index');
          const originalItem = taskBuilding.querySelectorAll('.task__building-item.js-item')[originalIndex];

          if (originalItem) {
            originalItem.classList.remove('js-item-active', 'js-item-connected');
          }

          clickedNull.textContent = '';
          clickedNull.classList.remove('js-item-active');
          clickedNull.removeAttribute('data-origin-index');
          return;
        }

        // Если кликнули не по слову, или слово уже зафиксировано в парах — выходим
        if (!clickedItem || clickedItem.classList.contains('js-item-connected')) return;

        // === СЦЕНАРИЙ 1: Страница сопоставления ПАР слов ===
        if (taskPairs) {
          const lang = clickedItem.getAttribute('data-lang');
          const currentActive = taskPairs.querySelector(`.js-item-active[data-lang="${lang}"]:not(.js-item-connected)`);

          if (clickedItem.classList.contains('js-item-active')) {
            clickedItem.classList.remove('js-item-active');
            return;
          }

          if (currentActive) {
            currentActive.classList.remove('js-item-active');
          }
          clickedItem.classList.add('js-item-active');

          const activeKz = taskPairs.querySelector('.js-item-active[data-lang="kz"]:not(.js-item-connected)');
          const activeRu = taskPairs.querySelector('.js-item-active[data-lang="ru"]:not(.js-item-connected)');

          if (activeKz && activeRu) {
            pairCounter++;
            activeKz.classList.add('js-item-connected');
            activeRu.classList.add('js-item-connected');
            activeKz.setAttribute('data-pair', pairCounter);
            activeRu.setAttribute('data-pair', pairCounter);
          }
        }

        // === СЦЕНАРИЙ 4: Новый блок сборки предложений (.task__building) ===
        else if (taskBuilding) {
          // Если слово уже выбрано и стоит наверху, повторный клик по нему внизу ничего не делает
          if (clickedItem.classList.contains('js-item-active')) return;

          // Находим первую пустую ячейку слева направо
          const emptyNull = taskBuilding.querySelector('.task__building-null:not(.js-item-active)');

          if (emptyNull) {
            const allItems = Array.from(taskBuilding.querySelectorAll('.task__building-item.js-item'));
            const itemIndex = allItems.indexOf(clickedItem); // Запоминаем индекс слова, чтобы потом вернуть обратно

            // Переносим текст и активируем ячейку
            emptyNull.textContent = clickedItem.textContent.trim();
            emptyNull.classList.add('js-item-active');
            emptyNull.setAttribute('data-origin-index', itemIndex);

            // Активируем нижнее слово (оно теперь «занято»)
            clickedItem.classList.add('js-item-active', 'js-item-connected');
          }
        }

        // === СЦЕНАРИЙ 2: Обычная страница (выбор одного айтема из всех) ===
        else {
          if (clickedItem.classList.contains('js-item-active')) {
            clickedItem.classList.remove('js-item-active');
            return;
          }

          const activeItem = taskBody.querySelector('.js-item-active');
          if (activeItem) {
            activeItem.classList.remove('js-item-active');
          }

          clickedItem.classList.add('js-item-active');
        }
      });
    }

    // Логика прогресс-бара и кнопки «Далее»
    if (!nextBtn || segments.length === 0) return;
    let currentStep = 1;
    const totalSteps = segments.length;
    if (totalStepsText) totalStepsText.textContent = totalSteps;

    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        segments[currentStep - 1].classList.remove('current');
        segments[currentStep - 1].classList.add('passed');
        segments[currentStep].classList.add('current');

        currentStep++;
        if (currentStepText) currentStepText.textContent = currentStep;

        // Полный сброс всех состояний при переходе к следующему шагу
        pairCounter = 0;
        if (taskBody) {
          taskBody.querySelectorAll('.js-item').forEach(item => {
            item.classList.remove('js-item-active', 'js-item-connected');
            item.removeAttribute('data-pair');
          });
          // Очищаем ячейки конструктора предложений
          taskBody.querySelectorAll('.task__building-null').forEach(nullEl => {
            nullEl.textContent = '';
            nullEl.classList.remove('js-item-active');
            nullEl.removeAttribute('data-origin-index');
          });
        }

      } else if (currentStep === totalSteps) {
        segments[currentStep - 1].classList.remove('current');
        segments[currentStep - 1].classList.add('passed');
        nextBtn.textContent = 'Готово!';
        nextBtn.disabled = true;
      }
    });
  }

  document.querySelectorAll('.task').forEach(quiz => initQuizProgress(quiz));


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