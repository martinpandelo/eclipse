import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { SwiperOptions } from 'swiper/types';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { ProductCardComponent } from "../product-card/product-card.component";
import { RouterLink } from '@angular/router';
import { ProductsService } from '@products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';

register();

@Component({
  selector: 'home-slide-news',
  imports: [RouterLink, ProductCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home-slide-news.component.html'
})
export class HomeSlideNewsComponent implements OnInit {

  productsService = inject(ProductsService);

  productResource = rxResource({
    request: () => ({
        novedad: true,
        sortBy: 'pd_orden_novedad',
        direction: 'asc' as const
    }),
    loader: ({ request }) => {
        return this.productsService.getProducts({
          novedad: request.novedad,
          sortBy: request.sortBy,
          direction: request.direction
        })
    }
  });

  swiperElement = signal<SwiperContainer | null>(null);

  ngOnInit(): void {
    const swiperElementConstructor = document.querySelector('swiper-container');
    const swiperOptions: SwiperOptions = {
      slidesPerView: 4,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: false,
      navigation: {
        enabled: true,
        nextEl: '.swiper-next',
        prevEl: '.swiper-prev',
        disabledClass: 'btn-disabled'
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 15
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 15
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 15
        }
      }
    };

    Object.assign(swiperElementConstructor!, swiperOptions);
    this.swiperElement.set(swiperElementConstructor as SwiperContainer);
    this.swiperElement()?.initialize();
  }

}
