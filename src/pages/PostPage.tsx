import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { Link } from "react-router-dom";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string;
};

const PostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts", { params: { page, limit } });
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Posts</h1>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="card p-4 border rounded">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p>{post.content.slice(0, 100)}...</p>
              {post.image && (
                <img src={post.image} alt={post.title} className="mt-2" />
              )}
            </div>
          </Link>
        ))}
      </div>
      <button onClick={() => setLimit(limit + 20)} disabled={loading}>
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
};

export default PostPage;
