import { Component, inject, input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from "@dashboard/components/form-error-label/form-error-label.component";
import { ImageCarouselComponent } from "@shared/components/image-carousel/image-carousel.component";
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { pathImagePipe } from '@shared/pipes/path-image.pipe';
import { ProductsService } from '@products/services/products.service';
import { CategoriesService } from '@products/services/categories.service';
import { ColorsService } from '@products/services/colors.service';
import { LampsService } from '@products/services/lamps.service';
import { ProductDetails } from '@products/interfaces/product-details.interface';
import { Category } from '@products/interfaces/categories.interface';
import { Color } from '@products/interfaces/colors.interface';
import { Lamp } from '@products/interfaces/lamps.interface';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'admin-product-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, ImageCarouselComponent, pathImagePipe, UpperCasePipe],
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent implements OnInit {

  router = inject(Router);
  formUtils = FormUtils;

  product = input.required<ProductDetails>();
  categories: Category[] = [];
  colors: Color[] = [];
  lamps: Lamp[] = [];

  fb = inject(FormBuilder);
  productService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  colorsService = inject(ColorsService);
  lampsService = inject(LampsService);

  wasSaved = signal(false);
  successMessage = signal('');
  isLoading = signal(false);

  tempMedia = signal<{ type: 'image' | 'video'; preview: string; file: File; }[]>([]);
  imageFileList: FileList | undefined = undefined;

  productForm: FormGroup = this.fb.group({
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    description: ['', Validators.required],
    categories: [[], [FormUtils.requiredCategory]],
    colors: [[]],
    lamps: [[]],
    images: [[]],
    novelty: [false],
    variants: this.fb.array([])
  })

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getAttributesArray(variant: AbstractControl): FormArray {
    return variant.get('attributes') as FormArray;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadColors();
    this.loadLamps();
  }

  // --- helpers para variants ---
  newVariant(variant?: any): FormGroup {
    return this.fb.group({
      id: [variant?.id ?? null],
      code: [variant?.code ?? '', Validators.required],
      grafic: [variant?.grafic ?? null],
      attributes: this.fb.array(
        (variant?.attributes ?? []).map((attr: any) => this.newAttribute(attr))
      )
    });
  }

  newAttribute(attr?: any): FormGroup {
    return this.fb.group({
      name: [attr?.name ?? '', Validators.required],
      value: [attr?.value ?? '', Validators.required]
    });
  }

  addVariant(): void {
    this.variants.push(this.newVariant());
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
  }

  addAttribute(variantIndex: number): void {
    const attributes = this.variants.at(variantIndex).get('attributes') as FormArray;
    attributes.push(this.newAttribute());
  }

  removeAttribute(variantIndex: number, attrIndex: number): void {
    const attributes = this.variants.at(variantIndex).get('attributes') as FormArray;
    attributes.removeAt(attrIndex);
  }

  setFormValue(formLike: Partial<ProductDetails>) {
    this.productForm.reset();

    const normalizedImages = Array.isArray(formLike.images)
      ? formLike.images
      : formLike.images ? [formLike.images] : [];

    const matchedCategories = (formLike.categories ?? [])
    .map(prodCat => this.categories.find(cat => cat.slug === prodCat.slug))
    .filter((cat): cat is Category => !!cat);

    const matchedColors = (formLike.colors ?? [])
    .map(prodColor => this.colors.find(col => col.id === prodColor.id))
    .filter((col): col is Color => !!col);

    const matchedLamps = (formLike.lamps ?? [])
    .map(prodLamp => this.lamps.find(lamp => lamp.id === prodLamp.id))
    .filter((lamp): lamp is Lamp => !!lamp);

    // variantes
    this.variants.clear();
    (formLike.variants ?? []).forEach(variant => {
      this.variants.push(this.newVariant(variant));
    });


    this.productForm.patchValue({
      slug: formLike.slug,
      description: formLike.description,
      categories: matchedCategories,
      colors: matchedColors,
      lamps: matchedLamps,
      images: normalizedImages,
      novelty: !!formLike.novelty
    });
  }

  //lamparas
  loadLamps() {
    this.lampsService.getLamps().subscribe({
      next: (resp) => {
        this.lamps = resp.lamps;
        this.trySetForm();
      }
    });
  }
  selectLamp(lamp: Lamp) {
    const current = this.productForm.get('lamps')?.value as Lamp[];
    const exists = current.some(c => c.id === lamp.id);

    const updated = exists
      ? current.filter(c => c.id !== lamp.id)
      : [...current, lamp];

    this.productForm.get('lamps')?.setValue(updated);
    this.productForm.get('lamps')?.markAsTouched();
  }
  isLampSelected(id: number): boolean {
    return (this.productForm.value.lamps ?? []).some((c: Lamp) => c.id === id);
  }

  //colores
  loadColors() {
    this.colorsService.getColors().subscribe({
      next: (resp) => {
        this.colors = resp.colors;
        this.trySetForm();
      }
    });
  }
  selectColor(color: Color) {
    const current = this.productForm.get('colors')?.value as Color[];
    const exists = current.some(c => c.id === color.id);

    const updated = exists
      ? current.filter(c => c.id !== color.id)
      : [...current, color];

    this.productForm.get('colors')?.setValue(updated);
    this.productForm.get('colors')?.markAsTouched();
  }
  isColorSelected(id: number): boolean {
    return (this.productForm.value.colors ?? []).some((c: Color) => c.id === id);
  }

  //categorias
  loadCategories() {
    this.categoriesService.getCategories({ categoria: '' }).subscribe({
      next: (resp) => {
        this.categories = resp.categories;
        this.trySetForm();
      }
    });
  }
  selectCategory(cat: Category) {
    const current = this.productForm.get('categories')?.value as Category[];
    const exists = current.some(c => c.slug === cat.slug);

    const updated = exists
      ? current.filter(c => c.slug !== cat.slug)
      : [...current, cat];

    this.productForm.get('categories')?.setValue(updated);
    this.productForm.get('categories')?.markAsTouched();
  }
  isCategorySelected(slug: string): boolean {
    return (this.productForm.value.categories ?? []).some((c: Category) => c.slug === slug);
  }


  trySetForm() {
    if (this.categories.length && this.colors.length && this.lamps.length) {
      this.setFormValue(this.product());
    }
  }


  async onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.productForm.value;
    const productSlug = formValue.slug as string;


    // convertimos variants con sus attributes
    const variants = formValue.variants.map((v: any) => ({
      id: v.id ?? null,
      code: v.code,
      grafic: v.grafic,
      attributes: v.attributes.map((a: any) => ({
        name: a.name,
        value: a.value
      }))
    }));


    const cleanedImages: string[] = Array.from(
      new Set(
        (formValue.images ?? []).map((img: string | {name: string}) =>
          typeof img === 'string' ? img.split('/').pop() || '' : img.name
        )
      )
    );

    const productLike = {
      slug: formValue.slug,
      descripcion: formValue.description,
      categorias: formValue.categories.map((c: Category) => c.id),
      colores: (formValue.colors ?? []).map((c: Color) => c.id),
      lamparas: (formValue.lamps ?? []).map((c: Lamp) => c.id),
      novedad: formValue.novelty ? 1 : 0,
      images: cleanedImages,
      variantes: variants
    };

    try {
      if (this.product().id === 0) { //nuevo producto
        const product = await firstValueFrom(
          this.productService.createProduct(productLike, this.imageFileList, productSlug)
        )

        this.successMessage.set('Producto creado correctamente');
        this.wasSaved.set(true);

        setTimeout(() => {
          this.wasSaved.set(false);
          this.successMessage.set('');
          this.router.navigate(['/admin/product', product.id]);
        }, 1000);
      } else { //actualiza producto
        await firstValueFrom(
          this.productService.updateProduct(this.product().id ,productLike, this.imageFileList, productSlug)
        )

        this.successMessage.set('Producto actualizado correctamente');
        this.wasSaved.set(true);

        setTimeout(() => {
          this.wasSaved.set(false);
          this.successMessage.set('');
        }, 3000);
      }
    } catch (err) {
      // manejo de errores aquí
    } finally {
      this.isLoading.set(false);
    }
  }


  //images
  onFilesChanged(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    // 1. Mapeamos los archivos a la estructura de media
    const newMedia = Array.from(files).map(file => {
    const fileType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video';

      return {
        type: fileType,
        preview: URL.createObjectURL(file),
        file
      };
    });

    // 2. Actualizamos el signal de forma atómica
    this.tempMedia.update(current => [...current, ...newMedia]);

    // 3. Sincronizamos el FileList después de agregar
    this.updateImageFileList();
  }

  private updateImageFileList() {
      const dt = new DataTransfer();
      this.tempMedia().forEach(item => {
          dt.items.add(item.file);
      });
      this.imageFileList = dt.files;
  }

  removeTempMedia(index: number) {
      this.tempMedia.update(current => {
          const updated = [...current];
          // Eliminamos el elemento
          updated.splice(index, 1);
          return updated;
      });
      // Sincronizar el FileList después de la remoción
      this.updateImageFileList();
  }


  removeExistingImage(imageUrl: string) {
    const currentImages = this.productForm.value.images as string[];

    const fileNameToRemove = imageUrl.split('/').pop();

    const updatedImages = currentImages.filter(img => {
      const imgName = img.split('/').pop();
      return imgName !== fileNameToRemove;
    });

    this.productForm.patchValue({ images: updatedImages });
  }

  //imagenes para graficos
  onVariantGraphicSelected(event: Event, variantIndex: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.productService.uploadVariantGraphic(file).subscribe(fileName => {
      const variants = this.productForm.get('variants') as FormArray;
      const variant = variants.at(variantIndex) as FormGroup;
      variant.patchValue({ grafic: fileName });
    });
  }

  isVideo(file: string): boolean {
    return file.toLowerCase().endsWith('.mp4');
  }

  isImage(file: string): boolean {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
  }

}
