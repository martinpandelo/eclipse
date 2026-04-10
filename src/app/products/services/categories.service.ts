import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category, CategoriesResponse } from '@products/interfaces/categories.interface';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.productsApiUrl;

interface Options {
  categoria?: string
}

const emptyCategory: Category = {
  id: 0,
  slug: '',
  title: '',
  order: 0
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private http = inject(HttpClient);
  private categoriesCache = new Map<string, CategoriesResponse>();
  private categoryCacheById = new Map<number, Category>();

  getCategories( options: Options ):Observable<CategoriesResponse> {
      const { categoria = '' } = options;

      if (this.categoriesCache.has( categoria )) {
        return of(this.categoriesCache.get(categoria)!);
      }

      return this.http.get<CategoriesResponse>(`${apiUrl}/categories`, {
        params: {
          categoria: categoria,
        }
      }).pipe(
        tap( response => {
          this.categoriesCache.set( categoria, response);
        })
      )
  }


  getCategoryById( id: number): Observable<Category>{
    const idNum = Number(id);

    if (idNum === 0) {
      return of(emptyCategory);
    }

    if (this.categoryCacheById.has(id)) {
      return of(this.categoryCacheById.get(id)!)
    }

    return this.http.get<Category>(`${apiUrl}/categories/id/${id}`).pipe(
      tap( resp => {
        this.categoryCacheById.set(id,resp);
      })
    )
  }

  createCategory(categoryLike: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${apiUrl}/categories`, categoryLike).pipe(
      tap((category) => {
        this.categoriesCache.clear();
        this.updateCategoryCache(category);
      })
    );
  }

  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${apiUrl}/categories/${id}`, data).pipe(
      tap((category) => this.updateCategoryCache(category))
    );
  }

  deleteCategory(id: number): Observable<void> {
      return this.http.delete<void>(`${apiUrl}/categories/${id}`).pipe(
        tap(() => {
          this.removeCategoryFromCache(id);
          this.categoriesCache.clear();
        })
      );
  }

  updateCategoriesOrder(orders: { id: number; order: number }[]) {
    return this.http.patch(`${apiUrl}/update-order-categories`, { orders }).pipe(
        tap(() => {
          this.categoriesCache.clear();
        })
      );
  }

  private removeCategoryFromCache(id: number) {
    this.categoryCacheById.delete(id);

    this.categoriesCache.forEach((response, key) => {
      const filteredCategories = response.categories.filter(category => category.id !== id);
      this.categoriesCache.set(key, {
        ...response,
        categories: filteredCategories,
      });
    });
  }

  private updateCategoryCache(category: Category) {
      this.categoryCacheById.set(category.id, category);

      const categoryId = category.id;

      this.categoriesCache.forEach(categoriesResponse => {
        categoriesResponse.categories = categoriesResponse.categories.map(currentCategory =>
          currentCategory.id === categoryId ? category : currentCategory
        );
      });
  }

}
