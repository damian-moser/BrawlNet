package ch.sbb.soundscore.SoundScore.services;

import ch.sbb.soundscore.SoundScore.entities.Comment;
import ch.sbb.soundscore.SoundScore.repositories.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public Comment deleteComment(Long id) {
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment != null) {
            commentRepository.deleteChildren(comment);
            commentRepository.delete(comment);
        }
        return comment;
    }

    public Comment editComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findAllBypost(postId);
        return buildCommentTree(comments);
    }

    private List<Comment> buildCommentTree(List<Comment> comments) {
        return comments.stream()
                .filter(comment -> comment.getComment() == null)
                .map(comment -> {
                    comment.setChildren(getChildren(comment, comments));
                    return comment;
                })
                .collect(Collectors.toList());
    }

    private List<Comment> getChildren(Comment parent, List<Comment> comments) {
        return comments.stream()
                .filter(comment -> parent.equals(comment.getComment()))
                .map(comment -> {
                    comment.setChildren(getChildren(comment, comments));
                    return comment;
                })
                .collect(Collectors.toList());
    }
}
