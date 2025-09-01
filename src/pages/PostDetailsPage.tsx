import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/axios";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import CommentsSection from "../components/CommentsSection";

type Post = {
  id: string;
  title: string;
  content: string;
};

const PostDetailsPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);

  const fetchPostDetails = async () => {
    try {
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (!postId) return null;

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

      {/* Comments Section */}
      {post && <CommentsSection postId={postId} />}
    </div>
  );
};

export default PostDetailsPage;
