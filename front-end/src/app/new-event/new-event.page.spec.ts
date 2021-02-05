import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewEventPage } from './new-event.page';

describe('NewEventPage', () => {
  let component: NewEventPage;
  let fixture: ComponentFixture<NewEventPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewEventPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
