import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { hasSuperAdmin } from "../../../../../services/utils";
import {
  addBill,
  exportToExcelBill,
  fetchBill,
  fetchBills,
  fetchBillsByBranch,
  fetchBillsBySearch,
  fetchBranches,
  fetchCustomers,
  fetchLorryReceiptsByConsignor,
  fetchLorryReceiptsByConsignorEdit,
  fetchLorryReceiptsForBilldetails,
  modifyBill,
  printBill,
  removeBill,
} from "./billActions";

const initialState = {
  status: "idle",
  branches: [],
  customers: [],
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
    const { data, status } = await fetchCustomers(requestObject);
    return { data, status };
  }
);

export const createBill = createAsyncThunk(
  "CREATE_BILL",
  async (requestObject) => {
    const { data, status } = await addBill(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsByConsignor = createAsyncThunk(
  "GET_LR_RECEIPT_BY_CONSIGNOR",
  async (requestObject) => {
    console.log(requestObject)
    const { data, status } = await fetchLorryReceiptsByConsignor(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsByConsignorForEdit = createAsyncThunk(
  "GET_LR_RECEIPT_BY_CONSIGNOR_EDIT",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceiptsByConsignorEdit(requestObject);
    return { data, status };
  }
);

export const downloadBill = createAsyncThunk(
  "DOWNLOAD_BILL",
  async (requestObject) => {
    const { data, status } = await printBill(requestObject);
    return { data, status };
  }
);

export const downloadExcelBill = createAsyncThunk(
  "DOWNLOAD_EXCEL_BILL",
  async (requestObject) => {
    const { data, status } = await exportToExcelBill(requestObject);
    return { data, status };
  }
);

export const getBills = createAsyncThunk("GE_BILLS", async (requestObject) => {
  const { data, status } = await fetchBills(requestObject);
  return { data, status };
});

export const getBillsByBranch = createAsyncThunk("GE_BILLS_BY_BRANCH", async (requestObject) => {
  const { data, status } = await fetchBillsByBranch(requestObject);
  return { data, status };
});

export const getBillsBySearch = createAsyncThunk("GE_BILLS_BY_SEARCH", async (requestObject) => {
  const { data, status } = await fetchBillsBySearch(requestObject);
  return { data, status };
});

export const deleteBill = createAsyncThunk(
  "DELETE_BILL",
  async (requestObject) => {
    const { data, status } = await removeBill(requestObject);
    return { data, status };
  }
);

export const getBill = createAsyncThunk("GE_BILL", async (requestObject) => {
  const { data, status } = await fetchBill(requestObject);
  return { data, status };
});

export const updateBill = createAsyncThunk(
  "UPDATE_BILL",
  async (requestObject) => {
    const { data, status } = await modifyBill(requestObject);
    return { data, status };
  }
);

export const getLorryReceiptsForBilldetials = createAsyncThunk(
  "GET_LR_RECEIPT_FOR_BILL",
  async (requestObject) => {
    const { data, status } = await fetchLorryReceiptsForBilldetails(requestObject);
    return { data, status };
  }
);

export const billSlice = createSlice({
  name: "bill",
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
        if (hasSuperAdmin()) {
          state.status = "succeeded";
        }
        state.branches = payload?.data?.map?.((branch) => ({
          ...branch,
          label: branch.branch_name,
          value: branch?.branch_id,
        }));
      })
      .addCase(getBranches.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getCustomers.pending, (state) => {
        // state.status = "loading";
      })
      .addCase(getCustomers.fulfilled, (state, { payload }) => {
        // state.status = "succeeded";
        state.customers = payload?.data;
      })
      .addCase(getCustomers.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(createBill.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createBill.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createBill.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsByConsignor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsByConsignor.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsByConsignor.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsByConsignorForEdit.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsByConsignorForEdit.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsByConsignorForEdit.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(downloadBill.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadBill.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(downloadBill.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getBill.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBill.fulfilled, (state) => {
        // state.status = "succeeded";
      })
      .addCase(getBill.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(deleteBill.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBill.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(deleteBill.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateBill.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBill.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateBill.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getBills.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBills.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getBills.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getBillsByBranch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBillsByBranch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getBillsByBranch.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getBillsBySearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBillsBySearch.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getBillsBySearch.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(getLorryReceiptsForBilldetials.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLorryReceiptsForBilldetials.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(getLorryReceiptsForBilldetials.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { setSearch } = billSlice.actions;
export default billSlice.reducer;
export const selectIsLoading = (state) => state.bill.status === "loading";
