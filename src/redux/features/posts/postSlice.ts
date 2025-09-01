import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../lib/axios";
import type { RootState } from "../../../store/store";

export type Post = {
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

interface PostState {
  items: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk<
  Post[],
  { page?: number; size?: number }
>("posts", async ({ page = 1, size = 20 }) => {
  const res = await api.get(`/posts`, { params: { page, size } });
  return res.data.data.result;
});

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load posts";
      });
  },
});

export const selectPosts = (state: RootState) => state.posts;

export default postSlice.reducer;
