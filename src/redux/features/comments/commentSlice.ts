import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../../lib/axios";
import type { RootState } from "../../../store/store";

export type Comment = {
  id: string;
  postId: string;
  content: string;
  user: { id: string; name: string };
  likesCount: number;
  dislikesCount: number;
  replies?: Comment[];
  parentId?: string;
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

interface CommentsState {
  result: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  result: [],
  loading: false,
  error: null,
};

//* Thunks
export const fetchComments = createAsyncThunk<
  Comment[],
  { postId: string; sortBy?: string; sortOrder?: string }
>("comments/fetch", async ({ postId, sortBy, sortOrder }) => {
  const params = new URLSearchParams({ postId });

  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  const res = await api.get(`/comments?${params.toString()}`);
  return res.data.data.result;
});

export const addComment = createAsyncThunk<
  Comment,
  { postId: string; content: string }
>("comments/add", async ({ postId, content }) => {
  const res = await api.post(`/comments`, { postId, content });
  return res.data.data;
});

export const updateComment = createAsyncThunk<
  Comment,
  { id: string; content: string }
>("comments/update", async ({ id, content }) => {
  const res = await api.post(`/comments/${id}`, { content });
  return res.data.data;
});

export const deleteComment = createAsyncThunk<string, { id: string }>(
  "comments/delete",
  async ({ id }) => {
    await api.delete(`/comments/${id}`);
    return id;
  }
);

export const reactToComment = createAsyncThunk<
  Comment,
  { commentId: string; reactionType: "Like" | "Dislike" }
>("comments/react", async ({ commentId, reactionType }) => {
  const res = await api.post(`/comments/react`, { commentId, reactionType });
  return res.data.data;
});

export const replyToComment = createAsyncThunk<
  Comment,
  { commentId: string; postId: string; content: string }
>("comments/reply", async ({ postId, commentId, content }) => {
  const res = await api.post(`/comments/reply`, { postId, commentId, content });
  return { ...res.data.data, parentId: commentId };
});

//* Slice
const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    updateReaction: (
      state,
      action: PayloadAction<{
        id: string;
        type: "Like" | "Dislike";
        userId: string;
      }>
    ) => {
      const comment = state.result.find((c) => c.id === action.payload.id);
      if (!comment) return;

      if (!comment.reactions) comment.reactions = [];

      const { type, userId } = action.payload;

      const existingIdx = comment.reactions.findIndex(
        (r) => r.user.id === userId
      );

      if (existingIdx !== -1) {
        const existing = comment.reactions[existingIdx];

        if (existing.type === type) {
          comment.reactions.splice(existingIdx, 1);

          if (type === "Like") {
            comment.likesCount = Math.max(0, comment.likesCount - 1);
          } else {
            comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
          }
        } else {
          comment.reactions[existingIdx].type = type;

          if (type === "Like") {
            comment.likesCount += 1;
            comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
          } else {
            comment.dislikesCount += 1;
            comment.likesCount = Math.max(0, comment.likesCount - 1);
          }
        }
      } else {
        comment.reactions.push({
          id: Date.now().toString(),
          type,
          commentId: comment.id,
          user: { id: userId, name: "" },
        });

        if (type === "Like") {
          comment.likesCount += 1;
        } else {
          comment.dislikesCount += 1;
        }
      }
    },

    //* SOCKET REDUCERS
    socketAddComment: (state, action: PayloadAction<Comment>) => {
      state.result.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      //* Fetch
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load comments";
      })
      //* Add
      .addCase(addComment.fulfilled, (state, action) => {
        state.result.unshift(action.payload);
      })
      //* Update
      .addCase(updateComment.fulfilled, (state, action) => {
        const idx = state.result.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.result[idx] = action.payload;
      })
      //* Delete
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.result = state.result.filter((c) => c.id !== action.payload);
      })
      //* React
      .addCase(reactToComment.fulfilled, (state, action) => {
        const comment = state.result.find((c) => c.id === action.payload.id);
        if (comment) {
          comment.likesCount = action.payload.likesCount;
          comment.dislikesCount = action.payload.dislikesCount;
        }
      })
      //* Reply
      .addCase(replyToComment.fulfilled, (state, action) => {
        const parent = state.result.find(
          (c) => c.id === action.payload.parentId
        );
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(action.payload);
        }
      });
  },
});

export const { updateReaction, socketAddComment } = commentSlice.actions;
export const selectComments = (state: RootState) => state.comments.result;
export default commentSlice.reducer;
