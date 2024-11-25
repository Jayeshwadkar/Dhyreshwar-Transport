import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addVehicle,
  fetchSuppliers,
  fetchVehicle,
  fetchVehicles,
  fetchVehiclesBySearch,
  fetchVehiclesByPage,
  fetchVehicleTaxDetails,
  fetchVehicleTypes,
  modifyVehicle,
  removeVehicle,
} from "./vehicleActions";
const initialState = {
  status: "idle",
  search: "",
  vehicleTypes: [],
  suppliers: [],
};

export const createVehicle = createAsyncThunk(
  "CREATE_VEHICLE",
  async (requestObject) => {
    const { data, status } = await addVehicle(requestObject);
    return { data, status };
  }
);
export const getVehicle = createAsyncThunk(
  "GET_VEHICLE",
  async (requestObject) => {
    const { data, status } = await fetchVehicle(requestObject);
    return { data, status };
  }
);
export const updateVehicle = createAsyncThunk(
  "UPDATE_VEHICLE",
  async (requestObject) => {
    const { data, status } = await modifyVehicle(requestObject);
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

export const getVehiclesBySearch = createAsyncThunk(
  "GET_VEHICLES_BY_SEARCH",
  async (requestObject) => {
    const { data, status } = await fetchVehiclesBySearch(requestObject);
    return { data, status };
  }
);

export const getVehiclesByPage = createAsyncThunk(
  "GET_VEHICLES_BY_PAGE",
  async (requestObject) => {
    const { data, status } = await fetchVehiclesByPage(requestObject);
    return { data, status };
  }
);

export const deleteVehicle = createAsyncThunk(
  "DELETE_VEHICLE",
  async (requestObject) => {
    const { data, status } = await removeVehicle(requestObject);
    return { data, status };
  }
);

export const getVehicleTypes = createAsyncThunk(
  "GET_VEHICLE_TYPES",
  async (requestObject) => {
    const { data, status } = await fetchVehicleTypes(requestObject);
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

export const getVehicleTaxDetails = createAsyncThunk( // new create
  "GET_VEHICLE_TAX_DETAILS",
  async (requestObject) => {
    const { data, status } = await fetchVehicleTaxDetails(requestObject);
    return { data, status };
  }
);

export const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setSearch: (state, { payload }) => {
      state.search = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVehicle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createVehicle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createVehicle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehicle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehicle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getVehicle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehicles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehicles.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getVehicles.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateVehicle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateVehicle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateVehicle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehiclesByPage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehiclesByPage.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getVehiclesByPage.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehiclesBySearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehiclesBySearch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getVehiclesBySearch.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehicleTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehicleTypes.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.vehicleTypes = payload.data?.map?.((type) => ({
          ...type,
          label: type.vehicle_type,
          value: type.vt_id,
        }));
      })
      .addCase(getVehicleTypes.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteVehicle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteVehicle.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteVehicle.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehicleTaxDetails.pending, (state) => { //new create
        state.status = "loading";
      })
      .addCase(getVehicleTaxDetails.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getVehicleTaxDetails.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getSuppliers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getSuppliers.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.suppliers = payload.data?.map?.((supplier) => ({
          ...supplier,
          label: supplier.name,
          value: supplier.supplier_id,
        }));
      })
      .addCase(getSuppliers.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = vehicleSlice.actions;
export default vehicleSlice.reducer;
export const selectIsLoading = (state) => state.vehicle.status === "loading";
