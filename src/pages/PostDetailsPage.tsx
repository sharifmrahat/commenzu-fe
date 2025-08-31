import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/axios";

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
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchPostDetails = async () => {
    try {
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments`, { params: { postId } });
      setComments(res.data.data);
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
    <div style={{ padding: 24 }}>
      {post && (
        <div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p>{post.content}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold">Comments</h2>
        {comments.map((c) => (
          <div key={c.id} className="border p-2 my-2 rounded">
            <p>
              <b>{c.user.name}</b>: {c.content}
            </p>
            <small>
              👍 {c.likesCount} · 👎 {c.dislikesCount}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetailsPage;
