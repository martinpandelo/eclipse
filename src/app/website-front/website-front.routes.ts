import { Routes } from "@angular/router";
import { WebsiteFrontLayoutsComponent } from "./layouts/website-front-layouts/website-front-layouts.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { ProductsPageComponent } from "./pages/products-page/products-page.component";
import { ProductSheetComponent } from "./pages/product-sheet/product-sheet.component";
import { SelectHomePageComponent } from "./pages/select-home-page/select-home-page.component";
import { HomePageEclipseComponent } from "./pages/home-page-eclipse/home-page-eclipse.component";


export const websiteRoutes: Routes = [
  {
    path: '',
    component: SelectHomePageComponent,
  },
  {
    path: 'ar-servicios-industriales',
    component: WebsiteFrontLayoutsComponent,
    data: { site: 'ar-servicios-industriales' },
    children: [
      { path: '', component: HomePageComponent },
      { path: 'productos', component: ProductsPageComponent },
      { path: 'productos/:categoria', component: ProductsPageComponent },
      { path: 'producto/:idSlug', component: ProductSheetComponent },
    ],
  },
  {
    path: 'eclipse',
    component: WebsiteFrontLayoutsComponent,
    data: { site: 'eclipse' },
    children: [
      { path: '', component: HomePageEclipseComponent }
    ],
  },
  {
    path: '**',
    redirectTo: ''
  }
];

export default websiteRoutes;

