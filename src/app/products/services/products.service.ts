import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductsResponse } from '@products/interfaces/products.interface';
import { ProductDetails } from '@products/interfaces/product-details.interface';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const apiUrl = environment.productsApiUrl;

interface Options {
  limit?: number,
  offset?: number,
  categoria?: string;
  novedad?: boolean,
  search?: string,
  sortBy?: string,
  direction?: 'asc' | 'desc'
}

const emptyProduct: ProductDetails = {
  id: 0,
  slug: '',
  description: '',
  title: '',
  categories: [],
  colors: [],
  lamps: [],
  variants: [],
  images: [],
  novelty: false
}


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();
  private productCacheById = new Map<number, ProductDetails>();
  private productCacheBySlug = new Map<string, ProductDetails>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const {
      limit = 50,
      offset = 0,
      categoria = '',
      novedad = false,
      search = '',
      sortBy = 'pd_id',
      direction = 'desc'
    } = options;

    const key = `${limit}-${offset}-${categoria}-${novedad}-${search}-${sortBy}-${direction}`;

    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http.get<ProductsResponse>(`${apiUrl}/products`, {
      params: {
        limit,
        offset,
        categoria,
        novedad,
        search,
        sortBy,
        direction,
      }
    }).pipe(
      tap(response => {
        this.productsCache.set(key, response);
      })
    );
  }

  getProductBySlug(slug: string): Observable<ProductDetails> {
    if (this.productCacheBySlug.has(slug)) {
      return of(this.productCacheBySlug.get(slug)!);
    }

    return this.http.get<ProductDetails>(`${apiUrl}/products/slug/${slug}`).pipe(
      tap(product => {
        this.productCacheBySlug.set(product.slug, product);
        this.productCacheById.set(product.id, product);
      })
    );
  }

  getProductById(id: string): Observable<ProductDetails> {
    const idNum = Number(id);

    if (idNum === 0) {
      return of(emptyProduct);
    }

    if (this.productCacheById.has(idNum)) {
      return of(this.productCacheById.get(idNum)!);
    }

    return this.http.get<ProductDetails>(`${apiUrl}/products/id/${id}`).pipe(
      tap(product => {
        this.productCacheById.set(product.id, product);
        this.productCacheBySlug.set(product.slug, product);
      })
    );
  }

  createProduct(productLike: Partial<ProductDetails>, imageFileList?: FileList, slug?: string): Observable<ProductDetails>{
    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList, slug).pipe(
      map(imageNames => ({
        ...productLike,
        images: [...currentImages, ...imageNames]
      })),
      switchMap((productLike) =>
        this.http.post<ProductDetails>(`${apiUrl}/products`, productLike)
      ),
      tap((product) => {
        this.productsCache.clear();
        this.updateProductCache(product);
      })
    );
  }

  updateProduct(id:number, data: any, imageFileList?: FileList, slug?: string): Observable<ProductDetails>{
    const currentImages = data.images ?? [];

    return this.uploadImages(imageFileList, slug)
      .pipe(
        map(imageNames => ({
          ... data,
          images: [...currentImages, ...imageNames]
        })),
        switchMap( (updatedProduct) => this.http.patch<ProductDetails>(`${apiUrl}/products/${id}`, updatedProduct) ),
        tap(( product ) => this.updateProductCache(product))
      )
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${apiUrl}/products/${id}`).pipe(
      tap(() => {
        this.removeProductFromCache(id);
        this.productsCache.clear();
      })
    );
  }

  updateNoveltyOrder(orders: { id: number; order: number }[]) {
    return this.http.patch(`${apiUrl}/update-order-novelty`, { orders }).pipe(
      tap(() => {
        this.productsCache.clear();
      })
    );
  }

  uploadImage(imageFile: File, slug: string): Observable<string>{
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('slug', slug);

    return this.http.post<{ fileName: string}>(`${apiUrl}/files/product`, formData).pipe(
      map( (resp) => resp.fileName )
    )
  }

  uploadImages(images?: FileList, slug?: string): Observable<string[]>{
    if(!images || !slug) return of([]); // Verificar que slug exista

    const uploadObservables = Array.from(images).map(imageFile => this.uploadImage(imageFile, slug)); // Pasar slug

    return forkJoin(uploadObservables).pipe(
      tap( (imagesName) => console.log({imagesName}))
    )
  }

  uploadVariantGraphic(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ fileName: string }>(
      `${apiUrl}/files/variant`, formData
    ).pipe(map(resp => resp.fileName));
  }


  private removeProductFromCache(id: number) {
    this.productCacheById.delete(id);

    for (const [slug, product] of this.productCacheBySlug.entries()) {
      if (product.id === id) {
        this.productCacheBySlug.delete(slug);
        break;
      }
    }

    this.productsCache.forEach((response, key) => {
      const filteredProducts = response.products.filter(product => product.id !== id);
      this.productsCache.set(key, {
        ...response,
        products: filteredProducts,
      });
    });
  }

  private updateProductCache(product: ProductDetails) {
    this.productCacheById.set(product.id, product);
    this.productCacheBySlug.set(product.slug, product);

    const productId = product.id;
    const productSummary = this.toProductSummary(product);

    this.productsCache.forEach(productsResponse => {
      productsResponse.products = productsResponse.products.map(currentProduct =>
        currentProduct.id === productId ? productSummary : currentProduct
      );
    });
  }

  private toProductSummary(product: ProductDetails): Product {
    return {
      id: product.id,
      slug: product.slug,
      description: product.description,
      title: product.title,
      categories: product.categories,
      images: product.images,
      variants: product.variants,
      novelty:  product.novelty
    };
  }

}
