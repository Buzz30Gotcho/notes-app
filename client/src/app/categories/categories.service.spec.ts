import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api.config';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Le faux serveur : aucune requête ne part vers le vrai back.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getCategories() should GET /categories and return the list', () => {
    const fakeCategories = [
      { id: '1', name: 'Sport', color: '#3B82F6' },
      { id: '2', name: 'Travail' },
    ];
    let result: any;

    service.getCategories().subscribe((categories) => (result = categories));

    const req = httpMock.expectOne(`${API_BASE_URL}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(fakeCategories);

    expect(result).toEqual(fakeCategories);
  });

  it('createCategory() should POST /categories and return the created category', () => {
    const input = { name: 'Sport', color: '#22C55E' };
    const created = { id: '3', name: 'Sport', color: '#22C55E' };
    let result: any;

    service.createCategory(input).subscribe((category) => (result = category));

    const req = httpMock.expectOne(`${API_BASE_URL}/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush(created, { status: 201, statusText: 'Created' });

    expect(result).toEqual(created);
  });
});
