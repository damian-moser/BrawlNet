import {Component, Input, OnInit} from '@angular/core';
import {CommentService} from "../../services/CommentService/comment.service";
import {Comment} from "../../models/Comment";
import {MatIcon} from "@angular/material/icon";
import {CommentListComponent} from "../comment-list/comment-list.component";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-comment',
  templateUrl: './comments.component.html',
  standalone: true,
  imports: [
    MatIcon,
    CommentListComponent,
    FormsModule,
    TranslateModule
  ],
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() comment!: Comment;
  @Input() activeUser!: any;
  @Input() replies: Comment[] = [];
  @Input() currentAction: string = '';
  @Input() focusedComment!: Comment;
  newComment: Comment = {
    title: '',
    message: '',
    post:

  };

  constructor(private commentService: CommentService) {
  }

  ngOnInit(): void {
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
