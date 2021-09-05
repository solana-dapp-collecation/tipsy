import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreatorsolanasComponent } from "./creator-solanas.component";

describe("CreatorsolanasComponent", () => {
  let component: CreatorsolanasComponent;
  let fixture: ComponentFixture<CreatorsolanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatorsolanasComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorsolanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
