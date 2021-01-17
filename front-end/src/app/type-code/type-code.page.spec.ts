import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TypeCodePage } from './type-code.page';

describe('TypeCodePage', () => {
  let component: TypeCodePage;
  let fixture: ComponentFixture<TypeCodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeCodePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
