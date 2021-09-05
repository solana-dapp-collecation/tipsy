import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { solanaPostsComponent } from "./solana-posts.component";

describe("solanaPostsPageComponent", () => {
  let component: solanaPostsComponent;
  let fixture: ComponentFixture<solanaPostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [solanaPostsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(solanaPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
