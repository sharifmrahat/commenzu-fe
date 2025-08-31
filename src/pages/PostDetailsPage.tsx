import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

type Comment = {
  id: string;
  content: string;
  user: { id: string; name: string };
  likesCount: number;
  dislikesCount: number;
  replies?: Comment[];
};

type Post = {
  id: string;
  title: string;
  content: string;
};

const PostDetailsPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const { accessToken, user } = useAppSelector((state) => state.auth);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [page] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState("");

  const fetchPostDetails = async () => {
    try {
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      await api.post(
        `/comments`,
        { postId, content: newComment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNewComment("");
      fetchComments(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (commentId: string, type: "Like" | "Dislike") => {
    try {
      await api.post(
        `/comments/${commentId}/reactions`,
        { type },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchComments(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchComments(1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
      fetchComments();
    }
  }, [postId]);

  return (
    <div className="p-6 space-y-6">
      {post && (
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">{post.title}</h1>
          </CardHeader>
          <CardContent>
            <p>{post.content}</p>
          </CardContent>
        </Card>
      )}

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
        {comments.map((c) => (
          <Card key={c.id} className="mb-3">
            <CardContent className="space-y-2">
              <p>
                <b>{c.user.name}</b>: {c.content}
              </p>
              <div className="flex gap-3 items-center text-sm text-gray-600">
                <span>👍 {c.likesCount}</span>
                <span>👎 {c.dislikesCount}</span>
                {accessToken && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(c.id, "Like")}
                    >
                      Like
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(c.id, "Dislike")}
                    >
                      Dislike
                    </Button>
                  </>
                )}
                {user?.id === c.user.id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>

              {/* Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l pl-3">
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
        ))}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button onClick={() => fetchComments(page + 1)}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailsPage;
