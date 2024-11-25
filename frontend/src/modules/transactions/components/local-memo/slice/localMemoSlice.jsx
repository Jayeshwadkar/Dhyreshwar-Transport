import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchPlaces,
  fetchBranches,
  removeLoadingSlip,
  fetchLoadingSlips,
  printLocalMemo,
  fetchLorryReceiptsForLocalMemo,
  addLocalMemo,
  fetchLocalMemoSearch,
  fetchLocalMemo,
  fetchLorryReceiptsForLMedit,
  modifyLocalMemo,
} from "./localMemoActions";

const initialState = {
  status: "idle",
  search: "",
};

export const getBranches = createAsyncThunk(
  "GET_BRANCHES",
  async (requestObject) => {
    const { data, status } = await fetchBranches(requestObject);
    return { data, status };
  }
);

export const getPlaces = createAsyncThunk(
  "GET_PLACES",
  async (requestObject) => {
    const { data, status } = await fetchPlaces(requestObject);
    return { data, status };
  }
);
export const getLoadingSlips = createAsyncThunk(
  "GE_LORRY_RECEIPTS",
  async (requestObject) => {
    const { data, status } = await fetchLoadingSlips(requestObject);
    return { data, status };
  }
);

export const getLocalMemoSearch = createAsyncThunk(
  "GET_LOCAL_MEMO_SEARCH",
  async (requestObject) => {
    const { data, status } = await fetchLocalMemoSearch(requestObject);
    return { data, status };
  }
);

export const getLocalMemo = createAsyncThunk(
  "GE_LOCAL_MEMO",
  async (requestObject) => {
    const { data, status } = await fetchLocalMemo(requestObject);
    return { data, status };
  }
);

export const deleteLoadingSlip = createAsyncThunk(
  "DELETE_LOADING_BILL",
  async (requestObject) => {
    const { data, status } = await removeLoadingSlip(requestObject);
    return { data, status };
  }
);

export const downloadLocalMemo = createAsyncThunk(
  "DOWNLOAD_LOCAL_MEMO",
  async (requestObject) => {
    const { data, status } = await printLocalMemo(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsForLocalMemo = createAsyncThunk(
  "GET_LR_RECEIPT_FOR_LOCAL_MEMO",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceiptsForLocalMemo(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsForLMedit = createAsyncThunk(
  "GET_LR_RECEIPT_FOR_LS_EDIT",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceiptsForLMedit(requestObject);
    return { data, status };
  }
);

export const createLocalMemo = createAsyncThunk(
  "CREATE_LOCAL_MEMO",
  async (requestObject) => {
    const { data, status } = await addLocalMemo(requestObject);
    return { data, status };
  }
);

export const updateLocalMemo = createAsyncThunk(
  "UPDATE_LOCAL_MEMO",
  async (requestObject) => {
    const { data, status } = await modifyLocalMemo(requestObject);
    return { data, status };
  }
);

export const localMemoSlice = createSlice({
  name: "localmemo",
  initialState,
  reducers: {
    setSearch: (state, { payload }) => {
      state.search = payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getLoadingSlips.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLoadingSlips.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLoadingSlips.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLocalMemoSearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLocalMemoSearch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLocalMemoSearch.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLocalMemo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLocalMemo.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLocalMemo.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteLoadingSlip.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteLoadingSlip.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteLoadingSlip.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsForLocalMemo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsForLocalMemo.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsForLocalMemo.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsForLMedit.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsForLMedit.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsForLMedit.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(createLocalMemo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createLocalMemo.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createLocalMemo.rejected, (state) => {
        state.status = "failed";
      })
      
      .addCase(updateLocalMemo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateLocalMemo.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateLocalMemo.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = localMemoSlice.actions;

export default localMemoSlice.reducer;
export const selectIsLoading = (state) => state.localmemo.status === "loading";
