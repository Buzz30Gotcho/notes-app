import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api.config';
import { AuthService } from './auth.service';

// auth.service.spec.ts vérifie les requêtes (URL, POST ou GET, contenu envoyé).

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    // provideHttpCleintTesting() remplace le vrai serveur par le faux
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should POST to /auth/register', () => {
        // 1. PRÉPARER
        const request = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password123' };

        // 2. AGIR
        service.register(request).subscribe();

        // 3. VÉRIFIER
        const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(request);

        req.flush({});
    });

});
