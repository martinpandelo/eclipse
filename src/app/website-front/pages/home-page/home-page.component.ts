import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HomeSlideNewsComponent } from "@products/components/home-slide-news/home-slide-news.component";
import { CategoriesService } from '@products/services/categories.service';
import { SearchFormComponent } from "@website-front/components/search-form/search-form.component";

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, HomeSlideNewsComponent, SearchFormComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {

  categoriesService = inject(CategoriesService);

  categoryResource = rxResource({
    loader: () => {
      return this.categoriesService.getCategories({ })
    }
  });

}
