import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, PostEntryResponse, TutorialStatus } from "../../../backend-api.service";
import { RouteNames } from "../../../app-routing.module";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";

@Component({
  selector: "solana-tutorial",
  templateUrl: "./solana-tutorial.component.html",
  styleUrls: ["./solana-tutorial.component.scss"],
})
export class solanaTutorialComponent implements OnInit {
  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private titleService: Title,
    private router: Router
  ) {}

  post: PostEntryResponse;
  // Use this posthash in testnet.
  // postHashHex = "3e42215a120a6e9d4848117f5829a2c4d9f692360fd14b78daea483a72d142dc";
  postHashHex = "75f16239b57de0531f9579f3817beb0a67515e4999947f293c112fb0260178e4";
  loading: boolean = true;

  ngOnInit() {
    this.titleService.setTitle("solana Tutorial - BitClout");
    this.backendApi
      .GetSinglePost(
        this.globalVars.localNode,
        this.postHashHex,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        false,
        0,
        0,
        false
      )
      .subscribe((res) => {
        this.post = res.PostFound;
      })
      .add(() => (this.loading = false));
  }

  onsolanaSent(): void {
    this.globalVars.loggedInUser.TutorialStatus = TutorialStatus.solana;
    this.globalVars.loggedInUser.MustCompleteTutorial = false;
    this.globalVars.logEvent("solana : send : next");
    this.router.navigate([RouteNames.TUTORIAL + "/" + RouteNames.CREATE_POST]);
  }
}
