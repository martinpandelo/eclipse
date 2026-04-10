import { AfterViewInit, Component, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Fancybox } from '@fancyapps/ui';
import { pathImagePipe } from '@shared/pipes/path-image.pipe';


@Component({
  selector: 'image-carousel',
  imports: [pathImagePipe],
  templateUrl: './image-carousel.component.html',
  styles: `

    .swiper-slide {
      display: flex;
      align-items: center; /* Centrado vertical: ¡Esta es la propiedad clave! */
      justify-content: center; /* Centrado horizontal */
      height: 100%;
    }

    .swiper-button-next,
    .swiper-button-prev {
      color: var(--bs-primary);
    }

    /* Tamaño fijo de las slides (miniaturas) */
    .swiper-thumbs .swiper-slide {
      width: 100px !important;
      height: 100px !important;
      flex-shrink: 0;
    }

    /* Imagen dentro de la miniatura */
    .swiper-thumbs .swiper-slide img {
      border-radius: 6px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s ease, border 0.2s ease;
    }

    /* Miniatura activa */
    .swiper-thumbs .swiper-slide-thumb-active img {
      opacity: 1;
    }
    .swiper-thumbs .swiper-slide-thumb-active {
      border: 2px solid var(--bs-primary);;
    }

  `,
})
export class ImageCarouselComponent implements AfterViewInit, OnDestroy {

  mainSwiper!: Swiper;

  imagesCarousel = input.required<string | string[]>();
  imageType = input<'productos'>('productos');

  // Normaliza a array para que el template no falle
  get images(): string[] {
    const val = this.imagesCarousel();
    if (!val || (Array.isArray(val) && val.length === 0)) {
      return ['no-image.jpg'];
    }
    return Array.isArray(val) ? val : [val];
  }

  swiperDiv = viewChild.required<ElementRef>('swiperDiv');
  thumbsDiv = viewChild.required<ElementRef>('thumbsDiv');

  ngAfterViewInit(): void {

    const mainEl = this.swiperDiv().nativeElement;
    const thumbsEl = this.thumbsDiv().nativeElement;

    if (!mainEl || !thumbsEl) return;

    // 1. Carrusel de miniaturas (ThumbsSwiper)
    const thumbsSwiper = new Swiper(thumbsEl, {
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });

    // 2. Carrusel principal
    this.mainSwiper = new Swiper(mainEl, { // Asignar a this.mainSwiper
      loop: true,
      modules: [Navigation, Pagination, Thumbs],
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      thumbs: {
        swiper: thumbsSwiper,
      },

      // 3. AÑADIR EVENTO SLIDE CHANGE PARA PAUSAR VIDEOS
      on: {
        slideChange: () => {
          this.pauseAllVideos();
        }
      }
    });

    Fancybox.bind('[data-fancybox]', {});

  }

  private pauseAllVideos(): void {
    if (!this.mainSwiper) return;

    // Buscar todos los elementos <video> en el carrusel principal
    const videoElements = this.mainSwiper.el.querySelectorAll('video');

    videoElements.forEach((video: HTMLVideoElement) => {
      if (!video.paused) {
        video.pause();
        // Opcional: reiniciar el video al principio
        // video.currentTime = 0;
      }
    });
  }

  ngOnDestroy(): void {
    Fancybox.close();
  }

  isVideo(file: string): boolean {
    return file.toLowerCase().endsWith('.mp4');
  }

  isImage(file: string): boolean {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
  }

}
