import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { Link } from "react-router-dom";
import { format } from "date-fns";

type Post = {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  author?: {
    id: string;
    name: string;
  };
  createdAt: Date;
};

const PostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [page] = useState(1);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts", { params: { page, size } });
      console.log({ res });
      setPosts(res.data.data.result);
      setTotal(res.data.data.meta.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-lg lg:text-xl font-semibold underline mb-5">Posts</h1>
      <div className="grid grid-cols-1 gap-4">
        {posts?.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="card p-4 border rounded-md max-w-sm border-slate-200 shadow-md hover:shadow-lg">
              {post.thumbnail && (
                <img src={post.thumbnail} alt={post.title} className="mt-2" />
              )}
              <h2 className="text-xl font-bold my-2">{post.title}</h2>
              <p className="text-justify">{post.content.slice(0, 100)}...</p>
              <div className="text-slate-600 flex justify-between items-center mt-4">
                <p>By {post.author?.name}</p>
                <p>{format(post.createdAt, "MMM dd, yyyy")}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {total > 20 && (
        <button onClick={() => setSize(size + 20)} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default PostPage;
