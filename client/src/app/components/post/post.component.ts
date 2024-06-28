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
  @Input() comment?: Comment;
  @Input() activeUser!: any;
  @Input() replies: Comment[] = [];
  @Input() currentAction: 'Add'|'Reply to'|'Edit your' = 'Add';
  @Input() focusedComment?: Comment;

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
      this.replies = comments.filter(c => c.comment);
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


  handleAction(): void {
    if (!this.newComment.title || !this.newComment.message) {
      return;
    }
    this.newComment.post = this.post;
    this.newComment.user = this.activeUser;
    if (this.currentAction === 'Add') {
      this.addComment();
    } else if (this.currentAction === 'Edit your') {
      if (this.focusedComment) {
        this.newComment.comment = this.focusedComment.comment;
      }
      this.editComment();
    }
    if (this.currentAction === 'Reply to') {
      this.replyToComment();
    }
    this.newComment = {} as Comment;
    this.focusedComment = undefined;
    this.currentAction = 'Add';
  }

  addComment(): void {
    this.commentService.createComment(this.newComment).subscribe(comment => {
      if (comment.comment) {
        this.replies.push(<Comment>comment);
      } else {
        this.comments.push(<Comment>comment);
      }
    });
  }

  replyToComment(): void {
    if (this.focusedComment) {
      this.newComment.comment = this.focusedComment;
    }
    this.commentService.createComment(this.newComment).subscribe(comment => {
      this.replies.push(<Comment>comment);
    });
  }

  editComment(): void {
    if (this.focusedComment && this.focusedComment.id) {
      this.newComment.id = this.focusedComment.id;
      this.commentService.updateComment(this.newComment).subscribe(comment => {
        this.comments = this.comments.map(c => c.id === comment.id ? comment : c);
        this.replies = this.replies.map(c => c.id === comment.id ? comment : c);
      });
    }
  }


  deleteComment(comment: Comment): void {
    if (comment.id) {
      this.commentService.deleteComment(comment.id).subscribe(() => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.replies = this.replies.filter(c => c.id !== comment.id);
      });
    }
  }
}
