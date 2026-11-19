import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api.config';
import { Category, CategoryInput } from './categories.models';
import { CategoriesService } from './categories.service';

const CATEGORIES_URL = `${API_BASE_URL}/categories`;

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // provideHttpClientTesting() remplace le vrai serveur par un faux (le mock)
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('US03 - Catégoriser mes notes', () => {
    // ── C1 : je vois la liste de mes catégories (GET /categories → 200) ──
    it('getCategories() should GET /categories and return the list', () => {
      const fakeCategories: Category[] = [
        { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Sport', color: '#3B82F6' },
        { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Travail' }, // sans couleur (facultatif)
      ];
      let result: Category[] | undefined;

      service.getCategories().subscribe((categories) => (result = categories));

      const req = httpMock.expectOne(CATEGORIES_URL);
      expect(req.request.method).toBe('GET');
      req.flush(fakeCategories);

      expect(result).toEqual(fakeCategories);
    });

    // ── C1 bis : l'utilisateur n'a encore aucune catégorie ──
    it('getCategories() should return an empty list when there is no category', () => {
      let result: Category[] | undefined;

      service.getCategories().subscribe((categories) => (result = categories));

      httpMock.expectOne(CATEGORIES_URL).flush([]);

      expect(result).toEqual([]);
    });

    // ── C2 : je peux créer une catégorie (POST /categories → 201) ──
    it('createCategory() should POST /categories and return the created category', () => {
      const input: CategoryInput = { name: 'Sport', color: '#22C55E' };
      const created: Category = { id: '550e8400-e29b-41d4-a716-446655440003', ...input };
      let result: Category | undefined;

      service.createCategory(input).subscribe((category) => (result = category));

      const req = httpMock.expectOne(CATEGORIES_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush(created, { status: 201, statusText: 'Created' });

      expect(result).toEqual(created);
    });

    // ── C3 : une catégorie invalide est refusée (POST /categories → 400) ──
    it('createCategory() should forward the 400 error from the API', () => {
      let error: HttpErrorResponse | undefined;

      service.createCategory({ name: '' }).subscribe({
        next: () => {
          throw new Error('aurait dû échouer');
        },
        error: (err: HttpErrorResponse) => (error = err),
      });

      httpMock
        .expectOne(CATEGORIES_URL)
        .flush({ message: 'Les données envoyées sont invalides.' }, { status: 400, statusText: 'Bad Request' });

      expect(error?.status).toBe(400);
      expect(error?.error).toEqual({ message: 'Les données envoyées sont invalides.' });
    });

    // ── Contrat : 401 jeton manquant / invalide ──
    it('getCategories() should forward the 401 error when not authenticated', () => {
      let error: HttpErrorResponse | undefined;

      service.getCategories().subscribe({ error: (err: HttpErrorResponse) => (error = err) });

      httpMock
        .expectOne(CATEGORIES_URL)
        .flush({ message: 'Jeton manquant, invalide ou expiré' }, { status: 401, statusText: 'Unauthorized' });

      expect(error?.status).toBe(401);
    });
  });
});
