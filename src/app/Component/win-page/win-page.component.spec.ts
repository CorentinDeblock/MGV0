import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinPageComponent } from './win-page.component';

describe('WinPageComponent', () => {
  let component: WinPageComponent;
  let fixture: ComponentFixture<WinPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WinPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
