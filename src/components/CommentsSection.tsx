/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
  replyToComment,
  reactToComment,
  selectComments,
  type Comment,
  socketAddComment,
  updateReaction,
} from "../redux/features/comments/commentSlice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { connectSocket } from "../lib/socket";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const comments = useAppSelector(selectComments);

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Sorting state
  const [sortBy, setSortBy] = useState<
    "createdAt" | "likesCount" | "dislikesCount"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Inside useEffect
  useEffect(() => {
    if (!postId) return;

    dispatch(fetchComments({ postId, sortBy, sortOrder }))
      .unwrap()
      .catch(() => toast.error("Failed to load comments"));

    const socket = connectSocket();

    socket.on("newComment", (comment: Comment) => {
      if (comment.postId === postId && comment.user.id !== user?.id) {
        dispatch(socketAddComment(comment));
        toast.success("New comment added");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [postId, sortBy, sortOrder, dispatch]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await dispatch(addComment({ postId, content: newComment })).unwrap();
      setNewComment("");
      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add comment");
    }
  };

  const handleLike = (commentId: string, type: "Like" | "Dislike") => {
    if (!user) return;

    dispatch(updateReaction({ id: commentId, type, userId: user.id }));

    dispatch(reactToComment({ commentId, reactionType: type })).catch((err) => {
      toast.error(err?.message || `Failed to update ${type}`);
    });
  };

  const handleDelete = async (commentId: string) => {
    try {
      await dispatch(deleteComment({ id: commentId })).unwrap();
      toast.success("Comment deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete comment");
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      await dispatch(
        updateComment({ id: commentId, content: editContent })
      ).unwrap();
      setEditingCommentId(null);
      setEditContent("");
      toast.success("Comment updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update comment");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    try {
      await dispatch(
        replyToComment({ postId, commentId: parentId, content: replyContent })
      ).unwrap();
      setReplyingTo(null);
      setReplyContent("");
      toast.success("Reply added");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add reply");
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {accessToken && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Add a Comment</h2>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddComment}>Post Comment</Button>
          </CardFooter>
        </Card>
      )}

      {/* Sorting Controls */}
      <div className="flex gap-4 items-center">
        <Label className="font-medium">Sort by:</Label>

        {/* Sort By */}
        <Select
          value={sortBy}
          onValueChange={(val) =>
            setSortBy(val as "createdAt" | "likesCount" | "dislikesCount")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select sort field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date</SelectItem>
            <SelectItem value="likesCount">Likes</SelectItem>
            <SelectItem value="dislikesCount">Dislikes</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={sortOrder}
          onValueChange={(val) => setSortOrder(val as "asc" | "desc")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {comments?.length ? (
          comments.map((c) => {
            const liked = c.reactions?.some(
              (r) => r.type === "Like" && r.user.id === user?.id
            );

            const disliked = c.reactions?.some(
              (r) => r.type === "Dislike" && r.user.id === user?.id
            );

            return (
              <Card key={c.id} className="mb-3">
                <CardContent className="space-y-2">
                  <p>
                    <b>{c.user?.name}</b>:{" "}
                    {editingCommentId === c.id ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    ) : (
                      c.content
                    )}
                  </p>

                  <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
                    <span>👍 {c.likesCount}</span>
                    <span>👎 {c.dislikesCount}</span>
                    {accessToken && (
                      <>
                        <Button
                          size="sm"
                          variant={liked ? "default" : "outline"}
                          className={liked ? "bg-blue-500 text-white" : ""}
                          onClick={() => handleLike(c.id, "Like")}
                        >
                          Like
                        </Button>
                        <Button
                          size="sm"
                          variant={disliked ? "default" : "outline"}
                          className={disliked ? "bg-blue-500 text-white" : ""}
                          onClick={() => handleLike(c.id, "Dislike")}
                        >
                          Dislike
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReplyingTo(replyingTo === c.id ? null : c.id)
                          }
                        >
                          Reply
                        </Button>
                      </>
                    )}
                    {user?.id === c.user?.id && (
                      <>
                        {editingCommentId === c.id ? (
                          <>
                            <Button size="sm" onClick={() => handleEdit(c.id)}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditContent(c.content);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(c.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Reply textarea */}
                  {replyingTo === c?.id && (
                    <div className="ml-6 mt-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="mt-2 flex gap-2">
                        <Button onClick={() => handleReply(c.id)}>
                          Post Reply
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="ml-6 mt-5 space-y-2 border-l pl-3">
                      {c.replies.map((r) => (
                        <div key={r.id}>
                          <p>
                            <b>{r.user?.name}</b>: {r.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Alert variant="default">
            <AlertTitle>No comments are found!</AlertTitle>
            <AlertDescription>Add new comments to this post.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
