import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addArticle,
  fetchArticle,
  fetchArticles,
  fetchArticlesBySearch,
  fetchBranches,
  modifyArticle,
  removeArticle,
  fetchAllArticlesByPage
} from "./articleActions";
const initialState = {
  status: "idle",
  search: "",
  branches: [],
};
export const getBranches = createAsyncThunk(
  "GET_BRANCHES",
  async (requestObject) => {
    const { data, status } = await fetchBranches(requestObject);
    return { data, status };
  }
);

export const createArticle = createAsyncThunk(
  "CREATE_ARTICLE",
  async (requestObject) => {
    const { data, status } = await addArticle(requestObject);
    return { data, status };
  }
);
export const getArticle = createAsyncThunk(
  "GET_ARTICLE",
  async (requestObject) => {
    const { data, status } = await fetchArticle(requestObject);
    return { data, status };
  }
);
export const updateArticle = createAsyncThunk(
  "UPDATE_ARTICLE",
  async (requestObject) => {
    const { data, status } = await modifyArticle(requestObject);
    return { data, status };
  }
);

export const getArticles = createAsyncThunk(
  "GET_ARTICLES",
  async (requestObject) => {
    const { data, status } = await fetchArticles(requestObject);
    return { data, status };
  }
);

export const getArticlesBySearch = createAsyncThunk(
  "GET_ARTICLES_BY_SEARCH",
  async (requestObject) => {
    console.log(requestObject)
    const { data, status } = await fetchArticlesBySearch(requestObject);
    return { data, status };
  }
);

export const getAllArticlesByPage = createAsyncThunk(
  "GET_ARTICLES_BY_PAGE",
  async (requestObject) => {
    console.log(requestObject)
    const { data, status } = await fetchAllArticlesByPage(requestObject);
    return { data, status };
  }
);

export const deleteArticle = createAsyncThunk(
  "DELETE_ARTICLE",
  async (requestObject) => {
    const { data, status } = await removeArticle(requestObject);
    return { data, status };
  }
);

export const articleSlice = createSlice({
  name: "article",
  initialState,
  reducers: {
    setSearch: (state, { payload }) => {
      state.search = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBranches.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBranches.fulfilled, (state, { payload }) => {
        state.branches = payload.data;
      })
      .addCase(getBranches.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(createArticle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createArticle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createArticle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getArticle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getArticle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getArticle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateArticle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateArticle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateArticle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getArticles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getArticles.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getArticles.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteArticle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteArticle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteArticle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getArticlesBySearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getArticlesBySearch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getArticlesBySearch.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getAllArticlesByPage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllArticlesByPage.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getAllArticlesByPage.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = articleSlice.actions;
export default articleSlice.reducer;
export const selectIsLoading = (state) => state.article.status === "loading";
