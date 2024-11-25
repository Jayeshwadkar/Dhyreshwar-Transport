import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addQuotation,
  fetchPlaces,
  fetchQuotation,
  fetchQuotations,
  modifyQuotation,
  removeQuotation,
  viewQuotationFile,
} from "./quotationActions";

const initialState = {
  status: "idle",
  places: [],
  search: "",
};

export const getPlaces = createAsyncThunk(
  "GET_PLACES",
  async (requestObject) => {
    const { data, status } = await fetchPlaces(requestObject);
    return { data, status };
  }
);

export const createQuotation = createAsyncThunk(
  "CREATE_QUOTATION",
  async (requestObject) => {
    const { data, status } = await addQuotation(requestObject);
    return { data, status };
  }
);

export const getQuotation = createAsyncThunk(
  "GET_QUOTATION",
  async (requestObject) => {
    const { data, status } = await fetchQuotation(requestObject);
    return { data, status };
  }
);

export const updateQuotation = createAsyncThunk(
  "UPDATE_QUOTATION",
  async (requestObject) => {
    const { data, status } = await modifyQuotation(requestObject);
    return { data, status };
  }
);

export const getQuotations = createAsyncThunk(
  "GET_QUOTATIONS",
  async (requestObject) => {
    const { data, status } = await fetchQuotations(requestObject);
    return { data, status };
  }
);

export const deleteQuotation = createAsyncThunk(
  "DELETE_QUOTATION",
  async (requestObject) => {
    const { data, status } = await removeQuotation(requestObject);
    return { data, status };
  }
);

export const downloadQuotation = createAsyncThunk(
  "DOWNLOAD_QUOTATION",
  async (requestObject) => {
    const { data, status } = await viewQuotationFile(requestObject);
    return { data, status };
  }
);

export const quotationSlice = createSlice({
  name: "quotation",
  initialState,
  reducers: {
    setSearch: (state, { payload }) => {
      state.search = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPlaces.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPlaces.fulfilled, (state, { payload }) => {
        // state.status = "succeeded";
        state.places = payload?.data?.map?.((place) => {
          return { ...place, label: place.name, value: place.name };
        });
      })
      .addCase(getPlaces.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(createQuotation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createQuotation.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createQuotation.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getQuotation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getQuotation.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getQuotation.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateQuotation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateQuotation.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateQuotation.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getQuotations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getQuotations.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getQuotations.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteQuotation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteQuotation.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteQuotation.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(downloadQuotation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadQuotation.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(downloadQuotation.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = quotationSlice.actions;
export default quotationSlice.reducer;
export const selectIsLoading = (state) => state.quotation.status === "loading";
