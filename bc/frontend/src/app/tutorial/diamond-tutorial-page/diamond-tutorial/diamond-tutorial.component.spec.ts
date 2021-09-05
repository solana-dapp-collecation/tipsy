import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { solanaTutorialComponent } from "./solana-tutorial.component";

describe("BuyCreatorCoinsTutorialComponent", () => {
  let component: solanaTutorialComponent;
  let fixture: ComponentFixture<solanaTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [solanaTutorialComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(solanaTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
