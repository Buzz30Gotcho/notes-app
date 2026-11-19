import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { Category, CategoryInput } from './categories.models';

/**
 * Appels à la partie Catégories de l'API (contrat openapi.yaml, tag Catégories).
 */
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  /** GET /categories — liste les catégories de l'utilisateur. */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  /** POST /categories — crée une catégorie personnalisée. */
  createCategory(input: CategoryInput): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, input);
  }
}
