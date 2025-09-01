import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPosts, selectPosts } from "../redux/features/posts/postSlice";
import { Alert, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";

const PostPage = () => {
  const dispatch = useAppDispatch();
  const { items: posts, loading, error } = useAppSelector(selectPosts);

  const [page] = useState(1);
  const [size, setSize] = useState(20);

  useEffect(() => {
    dispatch(fetchPosts({ page, size }));
  }, [dispatch, page, size]);

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-lg lg:text-xl font-semibold underline mb-5">Posts</h1>

      <div className="my-5">
        {loading && (
          <Alert>
            {" "}
            <AlertTitle>Loading posts..</AlertTitle>.
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {posts?.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="card p-4 border rounded-md max-w-sm border-slate-200 shadow-md hover:shadow-lg h-full">
              {post.thumbnail && (
                <img src={post.thumbnail} alt={post.title} className="mt-2" />
              )}
              <h2 className="text-xl font-bold my-2">{post.title}</h2>
              <p className="text-justify">{post.content.slice(0, 100)}...</p>
              <div className="text-slate-600 flex justify-between items-center mt-4 ">
                <p>By {post.author?.name}</p>
                <p>{format(new Date(post.createdAt), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load more */}
      <div className="mt-4">
        <Button onClick={() => setSize(size + 20)} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </Button>
      </div>
    </div>
  );
};

export default PostPage;
