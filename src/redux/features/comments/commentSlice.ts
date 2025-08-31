import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../../lib/axios";

export type Comment = {
  id: string;
  content: string;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  user: { id: string; name: string };
  replies?: Comment[];
};

type CommentsState = {
  items: Comment[];
  loading: boolean;
  error: string | null;
};

const initialState: CommentsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk<
  Comment[],
  { postId: string; page?: number; limit?: number; sort?: string }
>("comments/fetch", async ({ postId, page = 1, limit = 10, sort = "new" }) => {
  const res = await api.get(`/comments`, {
    params: { postId, page, limit, sort },
  });
  return res.data.data ?? res.data; // adapt to your API shape
});

export const addComment = createAsyncThunk<
  Comment,
  { postId: string; content: string; parentId?: string }
>("comments/add", async (payload) => {
  const res = await api.post(`/comments`, payload);
  return res.data.data ?? res.data;
});

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load comments";
      })
      // add
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default commentsSlice.reducer;
