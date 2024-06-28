import { Component, Input, OnInit } from '@angular/core';
import {CommentService} from "../../services/CommentService/comment.service";
import {PostService} from "../../services/PostService/post.service";
import {Comment} from "../../models/Comment";
import {TranslateModule} from "@ngx-translate/core";
import {PostComponent} from "../post/post.component";

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    PostComponent
  ],
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit {
  @Input() postId!: number;
  @Input() activeUser!: any;
  comments: Comment[] = [];
  currentAction: string = '';
  focusedComment?: Comment;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.commentService.getCommentsOfPost(this.postId).subscribe(comments => {
      this.comments = comments;
    });
  }
}
