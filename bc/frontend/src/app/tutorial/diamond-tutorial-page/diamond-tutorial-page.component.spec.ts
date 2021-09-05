import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { solanaTutorialPageComponent } from "./solana-tutorial-page.component";

describe("solanaTutorialPageComponent", () => {
  let component: solanaTutorialPageComponent;
  let fixture: ComponentFixture<solanaTutorialPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [solanaTutorialPageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(solanaTutorialPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
