import { Component } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { ActivatedRoute, Router } from "@angular/router";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { BackendApiService, solanasPost, PostEntryResponse, ProfileEntryResponse } from "../../backend-api.service";
import * as _ from "lodash";
import { InfiniteScroller } from "src/app/infinite-scroller";

@Component({
  selector: "solana-posts",
  templateUrl: "./solana-posts.component.html",
  styleUrls: ["./solana-posts.component.sass"],
})
export class solanaPostsComponent {
  static BUFFER_SIZE = 10;
  static PAGE_SIZE = 10;
  static WINDOW_VIEWPORT = true;

  constructor(
    public globalVars: GlobalVarsService,
    private router: Router,
    private backendApi: BackendApiService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.receiverUsername = params.receiver;
      this.senderUsername = params.sender;
    });
  }

  receiverUsername: string;
  senderUsername: string;

  receiverProfileEntryResponse: ProfileEntryResponse;
  senderProfileEntryResponse: ProfileEntryResponse;

  loadingFirstPage = true;
  loadingNextPage = false;
  pagedKeys = {
    0: "",
  };

  lastsolanaLevelOnPage = {
    0: 0,
  };

  lastPage = null;

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    this.loadingNextPage = true;
    const lastPostHashHex = this.pagedKeys[page];
    return this.backendApi
      .GetsolanaedPosts(
        this.globalVars.localNode,
        "",
        this.receiverUsername,
        "",
        this.senderUsername,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        lastPostHashHex,
        solanaPostsComponent.PAGE_SIZE
      )
      .toPromise()
      .then((res) => {
        const posts: PostEntryResponse[] = res.solanaedPosts;
        this.pagedKeys[page + 1] = posts.length > 0 ? posts[posts.length - 1].PostHashHex : "";
        this.lastsolanaLevelOnPage[page] = posts.length > 0 ? posts[posts.length - 1].solanasFromSender : -1;
        if (!posts || posts.length < solanaPostsComponent.PAGE_SIZE || this.pagedKeys[page + 1] === "") {
          this.lastPage = page;
        }
        if (!this.receiverProfileEntryResponse) {
          this.receiverProfileEntryResponse = res.ReceiverProfileEntryResponse;
        }
        if (!this.senderProfileEntryResponse) {
          this.senderProfileEntryResponse = res.SenderProfileEntryResponse;
        }
        const solanaPosts = posts.map((post) => {
          post.ProfileEntryResponse = res.ReceiverProfileEntryResponse;
          const solanaPost = new solanasPost();
          solanaPost.Post = post;
          return solanaPost;
        });

        let lastsolanaLevel = this.lastsolanaLevelOnPage[page - 1];
        for (let ii = 0; ii < solanaPosts.length; ii++) {
          solanaPosts[ii].Post.ProfileEntryResponse = this.receiverProfileEntryResponse;
          if (solanaPosts[ii].Post.solanasFromSender != lastsolanaLevel) {
            solanaPosts[ii].ShowsolanaDivider = true;
            lastsolanaLevel = solanaPosts[ii].Post.solanasFromSender;
          }
        }
        return solanaPosts;
      })
      .finally(() => {
        this.loadingFirstPage = false;
        this.loadingNextPage = false;
      });
  }

  solanaArray(n: number): Array<number> {
    return Array(n);
  }

  async _prependComment(uiPostParent, newComment) {
    await this.datasource.adapter.relax();
    await this.datasource.adapter.update({
      predicate: ({ $index, data, element }) => {
        let currentPost = (data as any) as PostEntryResponse;
        if (currentPost.PostHashHex === uiPostParent.PostHashHex) {
          newComment.parentPost = currentPost;
          currentPost.Comments = currentPost.Comments || [];
          currentPost.Comments.unshift(_.cloneDeep(newComment));
          currentPost.CommentCount += 1;
          currentPost = _.cloneDeep(currentPost);
          return [currentPost];
        }
        return true;
      },
    });
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    solanaPostsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    solanaPostsComponent.WINDOW_VIEWPORT,
    solanaPostsComponent.BUFFER_SIZE
  );
  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();
}
