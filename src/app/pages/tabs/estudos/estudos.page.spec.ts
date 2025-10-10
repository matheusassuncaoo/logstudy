import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstudosPage } from './estudos.page';

describe('EstudosPage', () => {
  let component: EstudosPage;
  let fixture: ComponentFixture<EstudosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstudosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
