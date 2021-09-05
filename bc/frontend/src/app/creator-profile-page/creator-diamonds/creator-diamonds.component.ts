import { Component, OnInit, Input } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { BackendApiService, ProfileEntryResponse } from "../../backend-api.service";
import { Datasource, IAdapter, IDatasource } from "ngx-ui-scroll";
import { Subscription } from "rxjs";

@Component({
  selector: "creator-solanas",
  templateUrl: "./creator-solanas.component.html",
  styleUrls: ["./creator-solanas.component.scss"],
})
export class CreatorsolanasComponent implements OnInit {
  static GIVEN = "Given";
  static RECEIVED = "Received";

  @Input() profile: ProfileEntryResponse;
  isLoading: boolean = false;
  globalVars: GlobalVarsService;
  solanaSummaryList = [];
  totalsolanas = 0;
  showsolanasGiven = false;
  activeTab = CreatorsolanasComponent.RECEIVED;
  CreatorsolanasComponent = CreatorsolanasComponent;
  datasource: IDatasource<IAdapter<any>> = this.getDatasource();
  loadingNewSelection = false;
  totalAnonsolanas = 0;
  totalAnonsolanaValue = 0;
  highestAnonsolanaLevel = 0;

  constructor(private _globalVars: GlobalVarsService, private backendApi: BackendApiService) {
    this.globalVars = _globalVars;
  }

  ngOnInit(): void {
    this.fetchsolanas();
  }

  fetchsolanas(): Subscription {
    this.isLoading = true;
    return this.backendApi
      .GetsolanasForPublicKey(this.globalVars.localNode, this.profile.PublicKeyBase58Check, this.showsolanasGiven)
      .subscribe(
        (res) => {
          this.solanaSummaryList = res.solanaSenderSummaryResponses;

          // Calculate the number of solanas that have come from
          // anonymous sources, and reformat the list to remove the
          // anonymous entries.
          let solanaListWithoutAnon = [];
          for (let ii = 0; ii < this.solanaSummaryList?.length; ii++) {
            if (
              !this.solanaSummaryList[ii].ProfileEntryResponse &&
              this.solanaSummaryList[ii].SenderPublicKeyBase58Check
            ) {
              this.totalAnonsolanas += this.solanaSummaryList[ii].Totalsolanas;
              this.totalAnonsolanaValue += this.sumsolanaValueForUser(this.solanaSummaryList[ii]);

              if (this.solanaSummaryList[ii].HighestsolanaLevel > this.highestAnonsolanaLevel) {
                this.highestAnonsolanaLevel = this.solanaSummaryList[ii].HighestsolanaLevel;
              }
            } else {
              solanaListWithoutAnon.push(this.solanaSummaryList[ii]);
            }
          }
          this.solanaSummaryList = solanaListWithoutAnon;

          if (this.totalAnonsolanas) {
            this.solanaSummaryList.push({ anonsolanasRow: true });
          }

          if (this.solanaSummaryList.length) {
            this.solanaSummaryList.push({ totalRow: true });
          }
          this.totalsolanas = res.Totalsolanas;
        },
        (err) => {
          this.globalVars._alertError(this.backendApi.parseProfileError(err));
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }
  counter(num: number) {
    return Array(num);
  }

  onChange(event): void {
    if (this.activeTab !== event) {
      this.activeTab = event;
      this.showsolanasGiven = this.activeTab === CreatorsolanasComponent.GIVEN;
      this.loadingNewSelection = true;
      this.fetchsolanas().add(() => this.datasource.adapter.reset().then(() => (this.loadingNewSelection = false)));
    }
  }

  sumsolanaValueForUser(solanaSummary: any): number {
    let total = 0;
    for (const solanaLevel in solanaSummary.solanaLevelMap) {
      if (solanaLevel in this.globalVars.solanaLevelMap) {
        total += this.globalVars.solanaLevelMap[solanaLevel] * solanaSummary.solanaLevelMap[solanaLevel];
      }
    }
    return total;
  }

  valueOfAllsolanas(): number {
    let total = 0;
    this.solanaSummaryList.map((solanaSummary) => {
      total += this.sumsolanaValueForUser(solanaSummary);
    });
    // Add the total amount from anon solanas
    total += this.totalAnonsolanaValue;
    return this.globalVars.nanosToUSDNumber(total);
  }

  getDatasource(): IDatasource<IAdapter<any>> {
    return new Datasource<IAdapter>({
      get: (index, count, success) => {
        const startIdx = Math.max(index, 0);
        const endIdx = index + count - 1;
        if (startIdx > endIdx) {
          success([]);
          return;
        }
        if (endIdx + 1 > this.solanaSummaryList.length) {
          success(this.solanaSummaryList.slice(startIdx, this.solanaSummaryList.length));
          return;
        }
        success(this.solanaSummaryList.slice(startIdx, endIdx + 1));
        return;
      },
      settings: {
        startIndex: 0,
        minIndex: 0,
        bufferSize: 5,
        padding: 0.5,
        windowViewport: true,
        infinite: true,
      },
    });
  }
}
