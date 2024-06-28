import {User} from "./User";
import {Post} from "./Post";

export interface Comment {
  id?: number;
  title: string;
  message: string;
  user: User; // Adjust type as per your User model
  post: Post; // Adjust type as per your Post model
  comment?: Comment;
  children?: Comment[];
}
