const swiper = new Swiper('.reviews__wrapper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    centeredSlidesBounds: true,

    

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },

    navigation: { // выводим стрелки 
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
  });
  