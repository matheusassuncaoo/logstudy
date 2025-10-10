import { TestBed } from '@angular/core/testing';

import { StudyHistoryService } from './study-history.service';

describe('StudyHistoryService', () => {
  let service: StudyHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
