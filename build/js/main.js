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

  function initScenesQuiz(quizElement) {
    const segments = quizElement.querySelectorAll('.scenes__segment');
    const nextBtn = quizElement.querySelector('.btn--green'); // Кнопка «проверить / далее»
    const taskBody = quizElement.querySelector('.scenes-inner__body');

    // === ЛОГИКА ВЫБОРА ВАРИАНТА (Один активный с возможностью отмены) ===
    if (taskBody) {
      taskBody.addEventListener('click', (e) => {
        // Ищем клик по элементу выбора с нужным JS-классом
        const clickedItem = e.target.closest('.scenes-item-js');
        if (!clickedItem) return;

        // Если кликнули по уже активному — снимаем класс (toggle)
        if (clickedItem.classList.contains('scenes-item-js--active')) {
          clickedItem.classList.remove('scenes-item-js--active');
          return;
        }

        // Иначе находим прошлый активный элемент в этом блоке и сбрасываем его
        const activeItem = taskBody.querySelector('.scenes-item-js--active');
        if (activeItem) {
          activeItem.classList.remove('scenes-item-js--active');
        }

        // Активируем текущий
        clickedItem.classList.add('scenes-item-js--active');
      });
    }

    // === ЛОГИКА ПРОГРЕСС-БАРА И ПЕРЕКЛЮЧЕНИЯ ШАГОВ ===
    if (!nextBtn || segments.length === 0) return;

    let currentStep = 1;
    const totalSteps = segments.length;

    nextBtn.addEventListener('click', (e) => {
      // Предотвращаем переход по ссылке, если это тег <a>
      e.preventDefault();

      if (currentStep < totalSteps) {
        // Меняем состояние сегментов прогресса
        segments[currentStep - 1].classList.remove('current');
        segments[currentStep - 1].classList.add('passed');
        segments[currentStep].classList.add('current');

        currentStep++;

        // Полный сброс стилей выбора при переходе на следующий шаг
        if (taskBody) {
          taskBody.querySelectorAll('.scenes-item-js').forEach(item => {
            item.classList.remove('scenes-item-js--active');
          });
        }

      } else if (currentStep === totalSteps) {
        // Финальный шаг
        segments[currentStep - 1].classList.remove('current');
        segments[currentStep - 1].classList.add('passed');

        nextBtn.textContent = 'Готово!';
        nextBtn.style.pointerEvents = 'none'; // Отключаем кликабельность ссылки
      }
    });
  }

  document.querySelectorAll('.scenes-lesson-page').forEach(quiz => initScenesQuiz(quiz));

  (function () {
    const items = document.querySelectorAll('.theory__items .theory__item');
    const totalItems = items.length;

    items.forEach((item, index) => {
      item.style.position = 'relative';
      item.style.zIndex = totalItems - index;
    });
  })();

  (function () {
    const ehtResult = document.querySelector('.eht-result');

    if (!ehtResult) return;

    const circle = document.querySelector('.eht-result__diagramm-circle');
    const valueDisplay = document.querySelector('.eht-result__diagramm-value');

    // Вычисляем длину окружности: 2 * PI * r (r у нас 110)
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    // Задаем начальные значения SVG
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    // Функция для установки прогресса (принимает проценты от 0 до 100)
    function setProgress(percent) {
      const offset = circumference - (percent / 20) * circumference;
      circle.style.strokeDashoffset = offset;
      valueDisplay.textContent = `${Math.round(percent)}/20`;
    }

    setProgress(5);
  })();

  (function () {
    const btnClass = 'general__filter-btn';
    const activeClass = 'general__filter--active';

    // Проверяем наличие хотя бы одной кнопки на странице. Если их нет — прерываем выполнение.
    if (!document.querySelector(`.${btnClass}`)) return;

    // 1. Обработка клика по кнопке (Тоггл эффект)
    document.addEventListener('click', (event) => {
      // Находим кнопку, даже если кликнули по иконке/тексту внутри неё
      const btn = event.target.closest(`.${btnClass}`);

      if (!btn) return;

      // Находим непосредственного родителя кнопки
      const parent = btn.parentElement;
      if (!parent) return;

      // Переключаем (тогблим) активный класс у родителя
      parent.classList.toggle(activeClass);

      // [Опционально] Закрываем все ОСТАЛЬНЫЕ открытые фильтры, кроме текущего
      document.querySelectorAll(`.${activeClass}`).forEach((openFilter) => {
        if (openFilter !== parent) {
          openFilter.classList.remove(activeClass);
        }
      });
    });

    // 2. Закрытие при клике вне родительского контейнера
    document.addEventListener('click', (event) => {
      // Если кликнули по кнопке фильтра, этот клик обработается в первом блоке, тут ничего не делаем
      if (event.target.closest(`.${btnClass}`)) return;

      // Находим все открытые фильтры
      const activeFilters = document.querySelectorAll(`.${activeClass}`);

      activeFilters.forEach((filter) => {
        // Если клик произошел вне текущего открытого фильтра — закрываем его
        if (!filter.contains(event.target)) {
          filter.classList.remove(activeClass);
        }
      });
    });

  })();

  (function () {
    const lessons = document.querySelector('.lessons');

    if (!lessons) return;

    const blocks = document.querySelectorAll('.lessons__block');
    const heads = document.querySelectorAll('.lessons__head');
    const activeClass = 'lessons__head--show';

    if (!blocks.length || !heads.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20px 0px -99% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const lessonId = entry.target.getAttribute('data-lesson');
        if (!lessonId) return;

        const associatedHead = document.querySelector(`.lessons__head[data-lesson="${lessonId}"]`);
        if (!associatedHead) return;

        if (entry.isIntersecting) {
          // Гарантируем, что у других шапок класс уберется, а у текущей появится
          heads.forEach(head => {
            if (head !== associatedHead) head.classList.remove(activeClass);
          });
          associatedHead.classList.add(activeClass);
        } else {
          // Убираем класс только если мы скроллим ВВЕРХ (блок опустился ниже границы 20px)
          // И при этом это НЕ первый блок, чтобы у первого заголовок оставался активным на самом верху страницы
          if (entry.boundingClientRect.top > 20) {
            const isFirstBlock = blocks[0] === entry.target;
            if (!isFirstBlock) {
              associatedHead.classList.remove(activeClass);
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    blocks.forEach(block => observer.observe(block));

  })();

  (function () {
    const items = document.querySelectorAll('.vocabulary-save__item');

    items.forEach(item => {
      item.addEventListener('click', (event) => {
        if (event.target.closest('button')) {
          event.stopPropagation();
          return;
        }

        const isActive = item.classList.contains('is-active');

        // items.forEach(el => el.classList.remove('is-active'));

        if (!isActive) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
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