import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { solanaPostsPageComponent } from "./solana-posts-page.component";

describe("solanaPostsPageComponent", () => {
  let component: solanaPostsPageComponent;
  let fixture: ComponentFixture<solanaPostsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [solanaPostsPageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(solanaPostsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
