import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { hasSuperAdmin } from "../../../../../services/utils";

import {
  fetchPlaces,
  fetchBranches,
  fetchRateMasterByCustomer,
  addFONum,
  fetchLorryReceipts,
  fetchVehicles,
  fetchSuppliers,
  fetchDrivers,
  fetchArticles,
  fetchLastLR,
  viewLorryReceipt,
  addLorryReceipt,
  modifyLorryReceipt,
  fetchLorryReceipt,
  fetchLorryReceiptsWithCount,
  fetchLorryReceiptsBySearch,
  removeLorryReceipt,
  fetchLRNumber,
  addLRNumber,
  fetchCustomersLimit,
  fetchEmailFromApi
} from "./lorryReceiptActions";

const initialState = {
  status: "idle",
  branches: [],
  customers: [],
  vehicles: [],
  articles: [],
  drivers: [],
  places: [],
  suppliers: [],
  email:[],
  search: "",
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
    if (requestObject) {
      const { data, status } = await fetchCustomersLimit(requestObject);
      return { data, status };
    } else {
      return { data: [] };
    }
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
  "GET_SUPPLIER",
  async (requestObject) => {
    const { data, status } = await fetchSuppliers(requestObject);
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

export const getDrivers = createAsyncThunk(
  "GET_DRIVERS",
  async (requestObject) => {
    const { data, status } = await fetchDrivers(requestObject);
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
export const getemail = createAsyncThunk(
  "GET_EMAIL",
  async () => {
    
    const { data, status } = await fetchEmailFromApi();
    return { data, status };
  }
);
export const getLastLR = createAsyncThunk(
  "GET_LAST_LR",
  async (requestObject) => {
    const { data, status } = await fetchLastLR(requestObject);
    return { data, status };
  }
);
export const createLorryReceipt = createAsyncThunk(
  "CREATE_LORRY_RECEIPT",
  async (requestObject) => {
    const { data, status } = await addLorryReceipt(requestObject);
    console.log("Lorry Receipt Data:", data);
    return { data, status };
  }
);

export const updateLorryReceipt = createAsyncThunk(
  "UPDATE_LORRY_RECEIPT",
  async (requestObject) => {
    const { data, status } = await modifyLorryReceipt(requestObject);
    return { data, status };
  }
);

export const downloadLorryReceipt = createAsyncThunk(
  "DOWNLOAD_LORRY_RECEIPT",
  async (requestObject) => {
    const { data, status } = await viewLorryReceipt(requestObject);
    return { data, status };
  }
);

export const getLorryReceipts = createAsyncThunk(
  "GET_LORRY_RECEIPTS",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceipts(requestObject);
    return { data, status };
  }
);

export const getLorryReceipt = createAsyncThunk(
  "GET_LORRY_RECEIPT",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceipt(requestObject);
    return { data, status };
  }
);

export const createFONum = createAsyncThunk(
  "CREATE_FO_NUM",
  async (requestObject) => {
    const { data, status } = await addFONum(requestObject);
    return { data, status };
  }
);

export const deleteLorryReceipt = createAsyncThunk(
  "DELETE_LORRY_RECEIPT",
  async (requestObject) => {
    const { data, status } = await removeLorryReceipt(requestObject);
    return { data, status };
  }
);

export const getRateMasterByCustomer = createAsyncThunk(
  "GET_MASTER_BY_CUSTOMERS",
  async (requestObject) => {
    const { data, status } = await fetchRateMasterByCustomer(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsWithCount = createAsyncThunk(
  "GET_LORRY_RECEIPT_COUNT",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceiptsWithCount(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsBySearch = createAsyncThunk(
  "GET_LORRY_RECEIPT_BY_SEARCH",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceiptsBySearch(requestObject);
    return { data, status };
  }
);

export const getLRNumber = createAsyncThunk(
  "GET_LORRY_RECEIPT_NUMBER",
  async (requestObject) => {
    const { data, status } = await fetchLRNumber(requestObject);
    return { data, status };
  }
);

export const createLRNumber = createAsyncThunk(
  "CREATE_LR_NUMBER",
  async (requestObject) => {
    const { data, status } = await addLRNumber(requestObject);
    return { data, status };
  }
);

export const lorryReceiptSlice = createSlice({
  name: "lorryreceipt",
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
        // state.status = "succeeded";
        state.branches = payload?.data;
      })
      .addCase(getBranches.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomers.pending, (state) => {
        state.status = "succeeded";
      })
      .addCase(getCustomers.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.customers = payload?.data?.map?.((customer) => {
          return { ...customer, label: customer.customer_name, value: customer.customer_id };
        });
      })
      .addCase(getCustomers.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getVehicles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVehicles.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.vehicles = payload?.data;
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

      .addCase(getPlaces.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPlaces.fulfilled, (state, { payload }) => {
        if (hasSuperAdmin()) {
          state.status = "succeeded";
        }
        state.places = payload?.data?.map?.((place) => {
          return { ...place, label: place.place_name, value: place.place_id };
        });
      })
      .addCase(getPlaces.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getDrivers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getDrivers.fulfilled, (state, { payload }) => {
        // state.status = "succeeded";
        state.drivers = payload?.data;
      })
      .addCase(getDrivers.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getArticles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getArticles.fulfilled, (state, { payload }) => {
        // state.status = "succeeded";
        state.articles = payload?.data?.map?.((article) => {
          return {
            ...article,
            label: article.articles_name,
            value: article.articles_id,
          };
        });
      })
      .addCase(getArticles.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLastLR.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLastLR.fulfilled, (state) => {
        // state.status = "succeeded";
      })
      .addCase(getLastLR.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(createLorryReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createLorryReceipt.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createLorryReceipt.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateLorryReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateLorryReceipt.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateLorryReceipt.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(downloadLorryReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadLorryReceipt.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(downloadLorryReceipt.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceipts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceipts.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceipts.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceipt.fulfilled, (state) => {
        // state.status = "succeeded";
      })
      .addCase(getLorryReceipt.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(createFONum.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createFONum.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createFONum.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteLorryReceipt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteLorryReceipt.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteLorryReceipt.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getRateMasterByCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRateMasterByCustomer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getRateMasterByCustomer.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsWithCount.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsWithCount.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsWithCount.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsBySearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsBySearch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsBySearch.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = lorryReceiptSlice.actions;
export default lorryReceiptSlice.reducer;
export const selectIsLoading = (state) =>
  state.lorryreceipt.status === "loading";
