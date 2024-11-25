import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBranches,
  fetchCustomers,
  fetchLoadingSlipForReport,
  fetchLRChallanReport,
  fetchSuppliers,
  fetchVehicles,
} from "./tripSheetActions";

const initialState = {
  status: "idle",
  suppliers: [],
  vehicles: [],
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

export const getVehicles = createAsyncThunk(
  "GET_VEHICLES",
  async (requestObject) => {
    const { data, status } = await fetchVehicles(requestObject);
    return { data, status };
  }
);

export const getSuppliers = createAsyncThunk(
  "GET_SUPPLIERS",
  async (requestObject) => {
    const { data, status } = await fetchSuppliers(requestObject);
    return { data, status };
  }
);

export const getLoadingSlipForReport = createAsyncThunk(
  "GET_LOADING_SLIP_FOR_REPORT",
  async (requestObject) => {
    const { data, status } = await fetchLoadingSlipForReport(requestObject);
    return { data, status };
  }
);

export const downloadChallanReport = createAsyncThunk(
  "GET_LR_FOR_CHALLAN_REPORT",
  async (requestObject) => {
    const { data, status } = await fetchLRChallanReport(requestObject);

    return { data, status };
  }
);
export const tripSheetSlice = createSlice({
  name: "tripsheet",
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
      })

      .addCase(getVehicles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehicles.fulfilled, (state, { payload }) => {
        // state.status = "succeeded";
        state.vehicles = payload?.data?.map?.((vehicle) => {
          return {
            ...vehicle,
            label: vehicle.vehicleNo,
            value: vehicle.vehicleNo,
          };
        });
      })
      .addCase(getVehicles.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getSuppliers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getSuppliers.fulfilled, (state, { payload }) => {
        // state.status = "succeeded";

        state.suppliers = payload?.data;
      })
      .addCase(getSuppliers.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLoadingSlipForReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLoadingSlipForReport.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLoadingSlipForReport.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(downloadChallanReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadChallanReport.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(downloadChallanReport.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default tripSheetSlice.reducer;
export const selectIsLoading = (state) =>
  state.tripsheetreport.status === "loading";
