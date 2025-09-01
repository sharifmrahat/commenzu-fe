/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { useAppSelector } from "../store/hooks";
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

type Comment = {
  id: string;
  content: string;
  user: { id: string; name: string };
  likesCount: number;
  dislikesCount: number;
  replies?: Comment[];
  reactions?: {
    id: string;
    type: "Like" | "Dislike";
    commentId: string;
    user: {
      id: string;
      name: string;
    };
  }[];
};

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { accessToken, user } = useAppSelector((state) => state.auth);

  const [comments, setComments] = useState<Comment[]>([]);
  const [page] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState("");

  // local states for edit/reply
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchComments = async (pageNum = 1) => {
    try {
      const res = await api.get(`/comments`, {
        params: { postId, page: pageNum, size: 20 },
      });
      const result = res.data.data.result;
      if (pageNum === 1) {
        setComments(result);
      } else {
        setComments((prev) => [...prev, ...result]);
      }
      setHasMore(pageNum < res.data.data.meta.totalPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(
        `/comments`,
        { postId, content: newComment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNewComment("");
      fetchComments(1);
      toast.success(res?.data?.message || "Comment added");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to add comment");
    }
  };

  const handleLike = async (
    commentId: string,
    reactionType: "Like" | "Dislike"
  ) => {
    try {
      const res = await api.post(
        `/comments/react`,
        { commentId, reactionType },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchComments(1);
      toast.success(res?.data?.message || `${reactionType} added`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || `Failed to add ${reactionType}`);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await api.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchComments(1);
      toast.success(res?.data?.message || `Comment deleted`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete comment");
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.post(
        `/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setEditingCommentId(null);
      setEditContent("");
      fetchComments(1);
      toast.success(res?.data?.message || "Comment updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update comment");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    try {
      const res = await api.post(
        `/comments/reply`,
        { postId, content: replyContent, commentId: parentId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setReplyingTo(null);
      setReplyContent("");
      fetchComments(1);
      toast.success(res?.data?.message || "Reply added");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to add reply");
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

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

      {/* Comments Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {comments?.length ? (
          comments.map((c) => {
            const userReaction = c.reactions?.find(
              (r) => r.user.id === user?.id
            );
            const liked = userReaction?.type === "Like";
            const disliked = userReaction?.type === "Dislike";

            return (
              <Card key={c.id} className="mb-3">
                <CardContent className="space-y-2">
                  <p>
                    <b>{c.user.name}</b>:{" "}
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
                    {user?.id === c.user.id && (
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
                  {replyingTo === c.id && (
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
                            <b>{r.user.name}</b>: {r.content}
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

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button onClick={() => fetchComments(page + 1)}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
