import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBilledLRReport,
  fetchBranches,
  fetchCustomers,
  viewBilledLRReport,
} from "./billLRStatusActions";

const initialState = {
  status: "idle",
  branches: [],
  customers: [],
};

export const getBranches = createAsyncThunk(
  "GET_BRANCHES",
  async (requestObject) => {
    const { data, status } = await fetchBranches(requestObject);
    return { data, status };
  }
);

export const getCustomers = createAsyncThunk(
  "GET_CUSTOMER",
  async (requestObject) => {
    const { data, status } = await fetchCustomers(requestObject);
    return { data, status };
  }
);

export const getBilledLRReport = createAsyncThunk(
  "GET_BILL_LR_FOR_REPORT",
  async (requestObject) => {
    const { data, status } = await fetchBilledLRReport(requestObject);
    return { data, status };
  }
);

export const downloadBilledLRReport = createAsyncThunk(
  "DOWNLOAD_BILL_LR_FOR_REPORT",
  async (requestObject) => {
    const { data, status } = await viewBilledLRReport(requestObject);
    return { data, status };
  }
);

export const billLRStatusSlice = createSlice({
  name: "billlrstatus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBranches.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBranches.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getBranches.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCustomers.fulfilled, (state) => {
        // state.status = "succeeded";
      })
      .addCase(getCustomers.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default billLRStatusSlice.reducer;
export const selectIsLoading = (state) =>
  state.billregisterreport.status === "loading";
