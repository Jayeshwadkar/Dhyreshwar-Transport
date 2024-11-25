import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Stack,
  InputLabel,
  MenuItem,
  FormControl,
  Button,
  Paper,
  Autocomplete,
  TextField,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import Select from "@mui/material/Select";
import Grid from "@material-ui/core/Grid";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FileSaver from "file-saver";
import {
  downloadBillsReport,
  getBillsForReport,
  getBranches,
} from "./slice/billRegisterSlice";
import {
  getFormattedDate,
  getFormattedLSNumber,

  toTitleCase,
} from "../../../../services/utils";
import { LoadingSpinner } from "../../../../ui-controls";

import {
  getCustomers
} from "../../../transactions/components/lorry-receipts/slice/lorryReceiptSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";

const initialState = {
  lrno: "",
  customer: null,
  status: "all",
  from: null,
  to: null,
};

const BillRegister = () => {
  const columns = [
    { field: "id", headerName: "Id", flex: 1 },
    { field: "srNo", headerName: "Sr.No", flex: 1 },
    {
      field: "bill_no",
      headerName: "Bill no.",
      flex: 1,
    },
    {
      field: "bill_date",
      headerName: "Date",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "customer",
      headerName: "Customer",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      cellClassName: (params) =>
        params.value?.toLowerCase?.() === "closed"
          ? "tblCellGreen"
          : "tblCellRed",
      flex: 1,
    },
    {
      field: "tot_amount",
      headerName: "Bill amount",
      type: "number",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "totalReceived",
      headerName: "Received",
      type: "number",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "totalBalance",
      headerName: "Outstanding",
      type: "number",
      minWidth: 120,
      flex: 1,
    },
  ];
  const user = useSelector((state) => state.user);
  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  const [billData, setBillData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [search, setSearch] = useState(initialState);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [isDownload, setIsDownload] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [rowCountState, setRowCountState] = useState(0);
  const [branchesLoaded, setBranchesLoaded] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });

  const dispatch = useDispatch();

  const { customers } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({ searchName: target.value }));
  };

  useEffect(() => {
    dispatch(getBranches())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setBranches([{ branch_name: "All", branch_id: -100 }, ...payload?.data]);
          if (!isSuperAdminOrAdmin()) {
            if (user && user.branch) {
              const filteredBranch = payload?.data?.find?.(
                (branch) => branch.branch_id == user.branch
              );
              setSelectedBranch(filteredBranch || "");
            }
          } else {
            setSelectedBranch({
              branch_name: "All",
              branch_id: -100
            });
          }
          setBranchesLoaded(true)
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });

    dispatch(getCustomers())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          // setCustomers(payload?.data);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  }, []);

  useEffect(() => {
    if (isSubmitted && branchesLoaded) {
      const query = {};
      if (selectedBranch && selectedBranch.branch_id) {
        query.branch = selectedBranch.branch_id == -100 ? "" : selectedBranch.branch_id;
      }
      if (search.lrno) {
        query.lrno = search.lrno.trim();
      }
      if (search.from) {
        query.from = search.from;
      }
      if (search.to) {
        query.to = search.to;
      }
      if (search.status) {
        query.status = search.status;
      }
      if (search.customer && search.customer.customer_id) {
        query.customer = search.customer.customer_id;
      }
      const params = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
        query: query,
      };
      setIsLoading(true);
      dispatch(getBillsForReport(params))
        .then(({ payload }) => {
          const { message, bills, count } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            // const updatedBills = bills.map((bill) => {
            //   bill.formattedDate = getFormattedDate(bill.date);
            //   bill.formattedLSNo = getFormattedLSNumber(bill.billNo);

            //   const customer = customers.find(
            //     (customer) => customer._id === bill.customer
            //   );

            //   bill.customerName =
            //     customer && customer.name ? customer.name : customer;
            //   bill.status = toTitleCase(bill.status);
            //   bill.totalAmount = bill.totalAmount.toFixed(2);
            //   bill.totalReceived = (bill.totalReceived || 0).toFixed(2);
            //   bill.totalBalance = (
            //     bill.totalAmount - (bill.totalReceived || 0)
            //   ).toFixed(2);
            //   return bill;
            // });
            setBillData(bills);
            setPageState((prev) => ({ ...prev, total: count }));
          }
          setIsSubmitted(false);
        })
        .catch((error) => {
          setIsSubmitted(false);
          setHttpError(error.message);
        }).finally(() => setIsLoading(false));
    }
  }, [paginationModel, selectedBranch, isSubmitted, branchesLoaded]);

  useEffect(() => {
    if (isDownload) {
      const query = {};
      if (selectedBranch && selectedBranch.branch_id) {
        query.branch = selectedBranch.branch_id == -100 ? "" : selectedBranch.branch_id;
      }
      if (search.lrno) {
        query.lrno = search.lrno.trim();
      }
      if (search.from) {
        query.from = search.from;
      }
      if (search.to) {
        query.to = search.to;
      }
      if (search.status) {
        query.status = search.status;
      }
      if (search.customer && search.customer.customer_id) {
        query.customer = search.customer.customer_id;
      }
      setIsLoading(true)
      dispatch(
        downloadBillsReport({
          query: query,
        })
      )
        .then(({ payload }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0'); // 24-hour format
            const minutes = String(now.getMinutes()).padStart(2, '0');
            FileSaver.saveAs(payload?.data, `Bills_Report_${day}-${month}-${year}_${hours}-${minutes}.xlsx`);
          }
          setIsDownload(false);
        })
        .catch((error) => {
          setIsDownload(false);
          setHttpError(error.message);
        }).finally(() => setIsLoading(false));
    }
  }, [search, isDownload, selectedBranch]);

  const handleInputChange = (e) => {
    setSearch((prev) => ({ ...prev, lrno: e.target.value }))
  }

  const branchChangeHandler = (e) => {
    const filteredBranch = branches.find(
      (branch) => branch.branch_id === e.target.value
    );
    setSelectedBranch(filteredBranch || "");
    setIsSubmitted(true);
  };

  const inputChangeHandler = (e) => {
    if (e.target.value) {
      setSearch((currState) => {
        return {
          ...currState,
          status: e.target.value,
        };
      });
    }
  };

  const submitHandler = (e) => {
    console.log("search")
    e.preventDefault();
    setIsSubmitted(true);
  };

  const autocompleteChangeListener = (e, option, name) => {
    setSearch((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  const dateInputChangeHandler = (name, date) => {
    setSearch((currState) => {
      if (date) {
        return {
          ...currState,
          [name]: new Date(date),
        };
      } else {
        return {
          ...currState,
          [name]: null,
        };
      }
    });
  };

  const resetHandler = (e) => {
    e.preventDefault();
    setSearch(initialState);
    setIsSubmitted(true);
  };

  const triggerDownload = (e) => {
    e.preventDefault();
    setIsDownload(true);
  };

  const handleRowsPerPageChange = (event) => {
    setPaginationModel({
      ...paginationModel,
      pageSize: parseInt(event.target.value, 100),
      page: 0,
    });
  };

  const handlePageChange = (newPage) => {
    setIsSubmitted(true)
    setPaginationModel({
      ...paginationModel,
      page: newPage,
    });
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="page_head">
        <h1 className="pageHead">Bill Register</h1>
        <div className="page_actions">
          {/**isSuperAdminOrAdmin() &&**/ (
            <FormControl
              size="small"
              sx={{ width: "150px", marginRight: "5px" }}
            >
              <InputLabel id="branch">Select branch</InputLabel>
              <Select
                labelId="branch"
                name="branch"
                label="Select branch"
                value={selectedBranch ? selectedBranch.branch_id : ""}
                onChange={branchChangeHandler}
              // disabled={!isSuperAdminOrAdmin()}
              >
                {branches.length > 0 &&
                  branches.map((branch) => (
                    <MenuItem
                      key={branch.branch_id}
                      value={branch.branch_id}
                      className="menuItem"
                    >
                      {branch.branch_name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </div>
      </div>

      {httpError !== "" && (
        <Stack
          sx={{
            width: "100%",
            margin: "0 0 30px 0",
            border: "1px solid red",
            borderRadius: "4px",
          }}
          spacing={2}
        >
          <Alert severity="error">{httpError}</Alert>
        </Stack>
      )}

      <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
        <h2 className="mb20">Search</h2>
        <form action="" onSubmit={submitHandler}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                label="LR No."
                size="small"
                value={search.lrno}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    inputFormat="DD/MM/YYYY"
                    value={search.from}
                    onChange={dateInputChangeHandler.bind(null, "from")}
                    renderInput={(params) => (
                      <TextField name="from" size="small" {...params} />
                    )}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    inputFormat="DD/MM/YYYY"
                    value={search.to}
                    onChange={dateInputChangeHandler.bind(null, "to")}
                    renderInput={(params) => (
                      <TextField name="to" size="small" {...params} />
                    )}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  disablePortal
                  autoSelect
                  autoHighlight={true}
                  size="small"
                  name="transporter"
                  options={customers || []}
                  value={search.customer}
                  getOptionLabel={(option) => option.customer_name}
                  onChange={(e, value) =>
                    autocompleteChangeListener(e, value, "customer")
                  }
                  onBlur={() => dispatch(getCustomers())}
                  openOnFocus
                  renderInput={(params) => (
                    <TextField {...params} onChange={(e) => customerFilterOptions(e)} label="Customer" fullWidth />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl
                size="small"
                sx={{ width: "150px" }}
              >
                <InputLabel id="status">Select status</InputLabel>
                <Select
                  labelId="status"
                  name="status"
                  label="Select status"
                  value={search.status}
                  onChange={inputChangeHandler}
                >
                  <MenuItem value="all" className="menuItem">
                    All
                  </MenuItem>
                  <MenuItem value={"open"} className="menuItem">
                    Open
                  </MenuItem>
                  <MenuItem value={"closed"} className="menuItem">
                    Closed
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Button
                type="submit"
                variant="contained"
                size="medium"
                color="primary"
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="medium"
                className="ml6"
                onClick={(e) => resetHandler(e)}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ width: "100%" }}>
        {billData.length > 0 ? (
          <div className="tbl_header">
            <Button
              variant="contained"
              endIcon={<DownloadIcon />}
              onClick={triggerDownload}
            >
              Download
            </Button>
          </div>
        ) : null}
        <DataGrid
          hideFooter={true}
          autoHeight
          density="compact"
          columns={columns}
          getRowId={(row) => row.id}
          sx={{ backgroundColor: "primary.contrastText" }}
          initialState={{
            ...columns,
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          disableSelectionOnClick
          rows={billData.map((elm, key) => {
            return {
              ...elm,
              srNo: paginationModel.page * paginationModel.pageSize + key + 1
            }
          })}
          rowsPerPageOptions={[100]}
          pagination
          paginationMode="server"
        />
      </Paper>
      <CustomPagination
        page={paginationModel.page}
        rowsPerPage={paginationModel.pageSize}
        count={pageState.total}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </>
  );
};

export default BillRegister;
