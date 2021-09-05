import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BackendApiService, ProfileEntryResponse, User } from "../../../app/backend-api.service";
import { Observable, of } from "rxjs";
import { GlobalVarsService } from "../../../app/global-vars.service";
import { map, switchMap } from "rxjs/operators";
import * as _ from "lodash";

class PulseLeaderboardResult {
  public_key: string;
  solanas?: number;
  net_change_24h_bitclout_nanos?: number;
}

class PulseLeaderboardResponse {
  results: PulseLeaderboardResult[];
  pagination: {
    current_page: number;
    total_pages: number;
  };
}

const BitCloutLocked = "bitclout_locked_24h";
const solanas = "solanas_received_24h";

export enum PulseLeaderboardType {
  BitCloutLocked = "bitclout_locked_24h",
  solanas = "solanas_received_24h",
}

export class LeaderboardResponse {
  Profile: ProfileEntryResponse;
  BitCloutLockedGained: number;
  solanasReceived: number;
  User: User;
}

export const LeaderboardToDataAttribute = {
  [PulseLeaderboardType.BitCloutLocked]: "net_change_24h_bitclout_nanos",
  [PulseLeaderboardType.solanas]: "solanas",
};

@Injectable({
  providedIn: "root",
})
export class PulseService {
  static pulseApiURL = "https://pulse.bitclout.com/api/bitclout/leaderboard";
  static pulseRef = "ref=bcl";
  static pulsePageSize = 20;
  constructor(
    private httpClient: HttpClient,
    private backendApi: BackendApiService,
    private globalVars: GlobalVarsService
  ) {}

  constructPulseURL(
    leaderboardType: string,
    pageIndex: number = 0,
    pageSize: number = PulseService.pulsePageSize
  ): string {
    return `${PulseService.pulseApiURL}/${leaderboardType}?${PulseService.pulseRef}&page_size=${pageSize}&page_index=${pageIndex}`;
  }

  getsolanasReceivedLeaderboard(): Observable<any> {
    return this.getsolanasReceivedPage(0);
  }

  getsolanasReceivedPage(
    pageNumber: number,
    pageSize: number = PulseService.pulsePageSize,
    skipFilters = false
  ): Observable<any> {
    return this.httpClient.get(this.constructPulseURL(PulseLeaderboardType.solanas, pageNumber, pageSize)).pipe(
      switchMap((res: PulseLeaderboardResponse) => {
        return this.getProfilesForPulseLeaderboard(res, PulseLeaderboardType.solanas, skipFilters);
      })
    );
  }

  getBitCloutLockedLeaderboard(): Observable<LeaderboardResponse[]> {
    return this.getBitCloutLockedPage(0);
  }

  getBitCloutLockedPage(
    pageNumber: number,
    pageSize: number = PulseService.pulsePageSize,
    skipFilters = false
  ): Observable<any> {
    return this.httpClient
      .get(this.constructPulseURL(PulseLeaderboardType.BitCloutLocked, pageNumber, pageSize))
      .pipe(
        switchMap((res: PulseLeaderboardResponse) =>
          this.getProfilesForPulseLeaderboard(res, PulseLeaderboardType.BitCloutLocked, skipFilters)
        )
      );
  }

  getProfilesForPulseLeaderboard(
    res: PulseLeaderboardResponse,
    leaderboardType: PulseLeaderboardType,
    skipFilters: boolean = false
  ): Observable<LeaderboardResponse[]> {
    const results = res.results;
    if (results.length === 0) {
      return of([]);
    }
    return this.backendApi
      .GetUsersStateless(
        this.globalVars.localNode,
        results.map((result) => result.public_key),
        true
      )
      .pipe(
        map((res: any) => {
          if (!skipFilters) {
            res.UserList = _.filter(
              res.UserList,
              (o) => o.ProfileEntryResponse !== null && !o.IsGraylisted && !o.IsBlacklisted
            );
            if (res.UserList.length > 10) {
              res.UserList = res.UserList.slice(0, 10);
            }
          }

          return res.UserList.map((user: User, index: number) => {
            return {
              User: user,
              Profile: user.ProfileEntryResponse,
              BitCloutLockedGained:
                leaderboardType === PulseLeaderboardType.BitCloutLocked
                  ? results[index][LeaderboardToDataAttribute[leaderboardType]]
                  : null,
              solanasReceived:
                leaderboardType === PulseLeaderboardType.solanas
                  ? results[index][LeaderboardToDataAttribute[leaderboardType]]
                  : null,
            };
          });
        })
      );
  }
}
