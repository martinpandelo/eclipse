import { Routes } from "@angular/router";
import { AdminDashboardLayoutComponent } from "./layout/admin-dashboard-layout/admin-dashboard-layout.component";
import { ProductsAdminPageComponent } from "./pages/products-admin-page/products-admin-page.component";
import { ProductAdminPageComponent } from "./pages/product-admin-page/product-admin-page.component";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { CategoriesAdminPageComponent } from "./pages/categories-admin-page/categories-admin-page.component";
import { CategoryAdminPageComponent } from "./pages/category-admin-page/category-admin-page.component";
import { ColorsAdminPageComponent } from "./pages/colors-admin-page/colors-admin-page.component";
import { ColorAdminPageComponent } from "./pages/color-admin-page/color-admin-page.component";
import { LampsAdminPageComponent } from "./pages/lamps-admin-page/lamps-admin-page.component";
import { LampAdminPageComponent } from "./pages/lamp-admin-page/lamp-admin-page.component";
import { ProductsOrderAdminPageComponent } from "./pages/products-order-admin-page/products-order-admin-page.component";

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    canMatch: [
          IsAdminGuard
    ],
    children: [
      {
        path: 'products',
        component: ProductsAdminPageComponent
      },
      {
        path: 'product/:id',
        component: ProductAdminPageComponent
      },
      {
        path: 'categories',
        component: CategoriesAdminPageComponent
      },
      {
        path: 'category/:id',
        component: CategoryAdminPageComponent
      },
      {
        path: 'colors',
        component: ColorsAdminPageComponent
      },
      {
        path: 'color/:id',
        component: ColorAdminPageComponent
      },
      {
        path: 'lamps',
        component: LampsAdminPageComponent
      },
      {
        path: 'lamp/:id',
        component: LampAdminPageComponent
      },
      {
        path: 'orden-novedades',
        component: ProductsOrderAdminPageComponent
      },
      {
        path: '**',
        redirectTo: 'products'
      }
    ]
  }
];

export default adminDashboardRoutes;
