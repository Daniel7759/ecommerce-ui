import { TestBed } from '@angular/core/testing';

import { Fakestore } from './fakestore';

describe('Fakestore', () => {
  let service: Fakestore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fakestore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
