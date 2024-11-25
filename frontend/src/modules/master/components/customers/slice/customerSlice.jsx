import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addCustomer,
  downloadCustomers,
  fetchBranches,
  fetchCustomer,
  fetchCustomers,
  fetchCustomersByPage,
  fetchCustomersBySearch,
  modifyCustomer,
  removeCustomer,
  fetchCustomerContactPer
} from "./customerActions";
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

export const createCustomer = createAsyncThunk(
  "CREATE_CUSTOMER",
  async (requestObject) => {
    const { data, status } = await addCustomer(requestObject);
    return { data, status };
  }
);
export const getCustomer = createAsyncThunk(
  "GET_CUSTOMER",
  async (requestObject) => {
    const { data, status } = await fetchCustomer(requestObject);
    return { data, status };
  }
);

export const getCustomerContactPer = createAsyncThunk( // new create
  "GET_CUSTOMER_CONTACT",
  async (requestObject) => {
    const { data, status } = await fetchCustomerContactPer(requestObject);
    return { data, status };
  }
);


export const updateCustomer = createAsyncThunk(
  "UPDATE_CUSTOMER",
  async (requestObject) => {
    const { data, status } = await modifyCustomer(requestObject);
    return { data, status };
  }
);
export const getCustomers = createAsyncThunk(
  "GET_CUSTOMERS",
  async (requestObject) => {
    const { data, status } = await fetchCustomers(requestObject);
    return { data, status };
  }
);

export const downloadCustomer = createAsyncThunk(
  "GET_CUSTOMERS_DOWNLOAD",
  async (requestObject) => {
    const { data, status } = await downloadCustomers(requestObject);
    return { data, status };
  }
);

export const getCustomersByPage = createAsyncThunk(
  "GET_CUSTOMERS_BY_PAGE",
  async (requestObject) => {
    const { data, status } = await fetchCustomersByPage(requestObject);
    return { data, status };
  }
);

export const getCustomersBySearch = createAsyncThunk(
  "GET_CUSTOMERS_BY_SEARCH",
  async (requestObject) => {
    const { data, status } = await fetchCustomersBySearch(requestObject);
    return { data, status };
  }
);

export const deleteCustomer = createAsyncThunk(
  "DELETE_CUSTOMER",
  async (requestObject) => {
    const { data, status } = await removeCustomer(requestObject);
    return { data, status };
  }
);

export const customerSlice = createSlice({
  name: "customer",
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

      .addCase(createCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createCustomer.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCustomer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getCustomer.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomerContactPer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCustomerContactPer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getCustomerContactPer.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateCustomer.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCustomers.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getCustomers.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCustomer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteCustomer.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomersBySearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCustomersBySearch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getCustomersBySearch.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomersByPage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCustomersByPage.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getCustomersByPage.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = customerSlice.actions;
export default customerSlice.reducer;
export const selectIsLoading = (state) => state.customer.status === "loading";
