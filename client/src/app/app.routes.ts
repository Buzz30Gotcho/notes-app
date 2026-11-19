import { Routes } from '@angular/router';

import { Register } from './auth/register/register';
import { CategoryList } from './categories/category-list/category-list';

export const routes: Routes = [
  { path: 'register', component: Register },
  { path: 'categories', component: CategoryList },
  { path: '', redirectTo: 'register', pathMatch: 'full' },
];
