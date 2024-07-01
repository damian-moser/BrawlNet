import {Component, Input, OnInit} from '@angular/core';
import {HeadNavBarComponent} from "../head-nav-bar/head-nav-bar.component";
import {Post} from "../../models/Post";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {PostService} from "../../services/PostService/post.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommentService} from "../../services/CommentService/comment.service";
import {Comment} from '../../models/Comment';
import {JwtServiceService} from "../../services/JwtService/jwt-service.service";
import {User} from "../../models/User";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {AsyncPipe, Location, NgIf} from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {GenerictranslatePipe} from "../../pipes/generictranslate.pipe";
import {CommentListComponent} from "../comment-list/comment-list.component";

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    HeadNavBarComponent,
    FormsModule,
    MatIconButton,
    MatIcon,
    MatButton,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    AsyncPipe,
    GenerictranslatePipe,
    NgIf,
    CommentListComponent,
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})

export class PostComponent implements OnInit {
  post: Post;
  comments: Comment[] = []
  newComment: Comment;
  postId: number = Number(this.route.snapshot.paramMap.get('postId'));
  likeProcessing: boolean = false;
  liked: boolean = false;
  disliked: boolean = false;
  activeUser:User;

  constructor(private route: ActivatedRoute,
              private postService: PostService,
              private commentService: CommentService,
              private jwtService: JwtServiceService,
              private location: Location,
              private router: Router) {
    this.post = {} as Post;
    this.newComment = {} as Comment;
    this.activeUser = {} as User;
  }


  ngOnInit(): void {
    this.postService.getPost(this.postId).subscribe((post) => {
      this.post = post;
      console.log(JSON.stringify({alreadyLikedOrDisliked: true, liked: false}))
    });
    this.postService.hasAlreadyLikedOrDisliked(this.postId).subscribe((data) => {
      if (data.alreadyLikedOrDisliked) {
        if (data.liked) {
          this.liked = true;
        } else {
          this.disliked = true;
        }
      }
    })
    this.commentService.getCommentsOfPost(this.postId).subscribe((comments) => {
      this.comments = comments.filter(c => !c.comment);
    });
    this.jwtService.getMe().subscribe((user) => {
      this.activeUser = user;
    });
  }

  goBack() {
    const previousPath = sessionStorage.getItem('previousPath')

    if (previousPath) {
      sessionStorage.clear();
      this.router.navigate([previousPath])

    } else {
      this.router.navigate(['/home'])
    }
  }

  likePost(): void {
    this.likeProcessing = true;
    this.liked = !this.liked;
    this.postService.likeOrDislikePost(this.post, true).subscribe((data) => {
      if (data) {
        this.post.likes++;
      } else {
        this.post.likes--;
      }
      this.likeProcessing = false;
    });
  }

  dislikePost(): void {
    this.likeProcessing = true;
    this.disliked = !this.disliked;
    this.postService.likeOrDislikePost(this.post, false).subscribe((data) => {
      if (data) {
        this.post.dislikes++;
      } else {
        this.post.dislikes--;
      }
      this.likeProcessing = false;
    });
  }



}
