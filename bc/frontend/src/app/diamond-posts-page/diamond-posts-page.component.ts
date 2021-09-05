import { Component } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";

@Component({
  selector: "solana-posts-page",
  templateUrl: "./solana-posts-page.component.html",
  styleUrls: ["./solana-posts-page.component.sass"],
})
export class solanaPostsPageComponent {
  constructor(private globalVars: GlobalVarsService, private router: Router) {}
}
