import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ValidateAccountPage } from './validate-account.page';

describe('ValidateAccountPage', () => {
  let component: ValidateAccountPage;
  let fixture: ComponentFixture<ValidateAccountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidateAccountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidateAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
