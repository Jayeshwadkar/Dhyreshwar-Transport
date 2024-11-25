import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBillsForReport,
  fetchBranches,
  fetchCustomers,
  viewBillsReport,
} from "./billRegisterActions";

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

export const getBillsForReport = createAsyncThunk(
  "GET_BILL_FOR_REPORT",
  async (requestObject) => {
    const { data, status } = await fetchBillsForReport(requestObject);
    return { data, status };
  }
);

export const downloadBillsReport = createAsyncThunk(
  "DOWNLOAD_BILL_FOR_REPORT",
  async (requestObject) => {
    const { data, status } = await viewBillsReport(requestObject);
    return { data, status };
  }
);

export const billRegisterSlice = createSlice({
  name: "billregister",
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

export default billRegisterSlice.reducer;

export const selectIsLoading = (state) =>
  state.billregisterreport.status === "loading";
