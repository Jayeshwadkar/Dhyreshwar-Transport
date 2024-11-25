import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Stack,
  FormControl,
  Button,
  Paper,
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import Grid from "@material-ui/core/Grid";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FileSaver from "file-saver";
import {
  getFormattedDate,
  // isAdminOrSuperadmin,
} from "../../../../services/utils";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  downloadLRReport,
  getLorryReceiptsForReport,
} from "./slice/lrRegisterSlice";

import {
  getCustomers,
  getBranches
} from "../../../transactions/components/lorry-receipts/slice/lorryReceiptSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";

const initialState = {
  lrno: "",
  consignor: null,
  consignee: null,
  from: null,
  to: null,
  payType: "",
};

const LorryReceiptRegister = () => {
  const columns = [
    { field: "id", headerName: "Id" },
    { field: "srNo", headerName: "Sr.No" },
    {
      field: "lr_no",
      headerName: "LR no.",
      flex: 1,
    },
    {
      field: "lr_date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "consigner",
      headerName: "Consignor",
      minWidth: 170,
      flex: 1,
    },
    {
      field: "consignee",
      headerName: "Consignee",
      minWidth: 170,
      flex: 1,
    },
    {
      field: "no_of_articles",
      headerName: "No of Articles",
      type: "number",
      flex: 1,
    },
    {
      field: "weight",
      headerName: "Weight",
      type: "number",
      flex: 1,
    },
  ];
  // const isLoading = useSelector(selectIsLoading);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isAdminOrSuperadmin = () => user.type.toLowerCase() === 'superadmin';
  // const [customers, setCustomers] = useState([]);
  // const [branches] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [lrData, setLrData] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [search, setSearch] = useState(initialState);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const { customers, branches } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });

  useEffect(() => {
    dispatch(getCustomers());
    // dispatch(getBranches());
    // const setBranch = branches.filter((row) => row.branch_id == user.branch)
    // setSelectedBranch(setBranch?.[0]);
    dispatch(getBranches())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          // setBranches(payload?.data);
          const branchMemo = window.localStorage.getItem('branch');

          if (!isAdminOrSuperadmin()) {
            if (payload?.data?.length) {
              const filteredBranch = payload?.data?.find?.(
                (branch) => branch.branch_id == user.branch
              );

              setSelectedBranch(filteredBranch || (branchMemo ? JSON.parse(branchMemo) : ""));
            } else {
              branchMemo && setSelectedBranch(JSON.parse(branchMemo));
            }
          } else {
            setSelectedBranch({
              branch_name: "All",
              branch_id: ""
            });
          }
        }
      })
      .catch(() => {
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      });
  }, []);

  // useEffect(() => {
  //   console.log(user.branch)
  //   console.log(branches)
  //   const setBranch = branches.filter((row) => row.branch_id == user.branch)
  //   console.log(setBranch)
  //   setSelectedBranch(setBranch?.[0]);
  // }, []);

  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({ searchName: target.value }));
  };

  const [isloading, setLoading] = useState(false);

  useEffect(() => {
    if (isSubmitted && ((user.branch && selectedBranch) || user.branch || user.usertype === '0')) {
      setLoading(true);
      const query = {};
      if (selectedBranch && selectedBranch.branch_id) {
        query.branch = selectedBranch.branch_id;
      }
      if (!selectedBranch && user.branch) {
        query.branch = user.branch;
      }
      if (search.lrno) {
        query.lrno = search.lrno.trim();
      }
      if (search.consignor && search.consignor.customer_id) {
        query.consignor = search.consignor.customer_id;
      }
      if (search.consignee && search.consignee.customer_id) {
        query.consignee = search.consignee.customer_id;
      }
      if (search.from) {
        query.from = search.from;
      }
      if (search.to) {
        query.to = search.to;
      }
      if (search.payType) {
        query.payType = search.payType;
      }
      const requestObject = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
        query: query,
      };

      dispatch(getLorryReceiptsForReport(requestObject))
        .then(({ payload = {} }) => {
          setLoading(false);
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            // const updatedLR = payload?.data.lorryReceipts?.map?.((lr) => {
            //   return {
            //     ...lr,
            //     date: getFormattedDate(new Date(lr.date)),
            //     totalWeight: lr.transactions
            //       ?.reduce?.((acc, lr) => acc + lr.chargeWeight, 0)
            //       ?.toFixed?.(2),
            //     totalArticles: lr.transactions
            //       ?.reduce?.((acc, lr) => acc + lr.articleNo, 0)
            //       ?.toFixed?.(2),
            //   };
            // });
            // setPageState((currState) => {
            //   return {
            //     ...currState,
            //     isLoading: false,
            //     data: updatedLR,
            //     total: payload?.data.count,
            //   };
            // });
            setHttpError("");
            setLrData(payload?.data.lorryReceipts)
            setPageState((prev) => ({ ...prev, total: payload?.data.count }))
          }
          setIsSubmitted(false);
        })
        .catch((error) => {
          setIsSubmitted(false);
          setHttpError(error.message);
          setLoading(false);
        });
    }
  }, [
    paginationModel,
    selectedBranch,
    isSubmitted,
  ]);

  const handleInputChange = (e) => {
    setSearch((prev) => ({ ...prev, lrno: e.target.value }))
  }

  const branchChangeHandler = (e, value) => {
    setSelectedBranch(value);
    setIsSubmitted(true);
    setSearch(initialState);
  };

  const submitHandler = (e) => {
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
    if (!date) {
      setSearch((currState) => {
        return {
          ...currState,
          [name]: null,
        };
      });
      return
    }
    setSearch((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
  };

  const resetHandler = (e) => {
    e.preventDefault();
    setSearch(initialState);
    setIsSubmitted(true);
  };

  const triggerDownload = (e) => {
    e.preventDefault();
    const query = {};
    if (selectedBranch && selectedBranch.branch_id) {
      query.branch = selectedBranch.branch_id;
    }
    if (search.lrno) {
      query.lrno = search.lrno.trim();
    }
    if (search.consignor && search.consignor.customer_id) {
      query.consignor = search.consignor.customer_id;
    }
    if (search.consignee && search.consignee.customer_id) {
      query.consignee = search.consignee.customer_id;
    }
    if (search.from) {
      query.from = search.from;
    }
    if (search.to) {
      query.to = search.to;
    }
    if (search.payType) {
      query.payType = search.payType;
    }
    setLoading(true)
    dispatch(downloadLRReport(query))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          const blob = new Blob([payload?.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          const hours = String(now.getHours()).padStart(2, '0'); // 24-hour format
          const minutes = String(now.getMinutes()).padStart(2, '0');
          FileSaver.saveAs(blob, `LR_Report_${day}-${month}-${year}_${hours}-${minutes}.xlsx`);
        }
        setLoading(false)
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  };

  const inputChangeHandler = (e) => {
    setSearch((currState) => {
      return {
        ...currState,
        payType: e.target.value,
      };
    });
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
      {(isloading) && <LoadingSpinner />}
      <div className="inner-wrap">
        <div
          className="page_head-1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h1 className="pageHead">Lorry Receipt Stock Status</h1>
          <div className="">
            {
              /** isAdminOrSuperadmin() && **/ <FormControl
                size="small"
                sx={{ width: "210px", marginRight: "5px", marginBottom: "20px" }}
              >
                <Autocomplete
                  disablePortal
                  size="small"
                  name="branch"
                  // options={isAdminOrSuperadmin() ? [{
                  //   branch_name: "All",
                  //   branch_id: ""
                  // },
                  // ...branches] : (branches || [])}
                  options={[{
                    branch_name: "All",
                    branch_id: ""
                  },
                  ...branches] || []}
                  value={selectedBranch || null}
                  onChange={branchChangeHandler}
                  // disabled={!isAdminOrSuperadmin()}
                  getOptionLabel={(branch) => branch.branch_name}
                  openOnFocus
                  renderInput={(params) => (
                    <TextField {...params} label="Select branch" fullWidth />
                  )}
                />
              </FormControl>
            }

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
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="consignor"
                    options={customers || []}
                    value={search.consignor}
                    onBlur={() => dispatch(getCustomers())}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "consignor")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} onChange={(e) => customerFilterOptions(e)} label="Consignor" fullWidth />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="consignee"
                    options={customers || []}
                    value={search.consignee}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "consignee")
                    }
                    onBlur={() => dispatch(getCustomers())}
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} onChange={(e) => customerFilterOptions(e)} label="Consignee" fullWidth />
                    )}
                  />
                </FormControl>
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
                <ToggleButtonGroup
                  color="primary"
                  value={search.payType}
                  exclusive
                  onChange={inputChangeHandler}
                  aria-label="Platform"
                  size="small"
                >
                  <ToggleButton value="">All</ToggleButton>
                  <ToggleButton value="0">TBB</ToggleButton>
                  <ToggleButton value="1">ToPay</ToggleButton>
                  <ToggleButton value="2">Paid</ToggleButton>
                  <ToggleButton value="3">FOC</ToggleButton>
                </ToggleButtonGroup>
              </Grid>


            </Grid>
            <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Grid style={{ marginTop: '15px', display: "flex" }} item xs={2}>
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
          {lrData?.length > 0 ? (
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
            rows={lrData.map((elm, key) => {
              return {
                ...elm,
                srNo: paginationModel.page * paginationModel.pageSize + key + 1
              }
            })}
            pageSizeOptions={[100]}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
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
          // disableColumnFilter
          // disableColumnSelector
          // disableDensitySelector
          // components={{ Toolbar: GridToolbar }}
          // componentsProps={{
          //   toolbar: {
          //     csvOptions: { disableToolbarButton: false },
          //     printOptions: { disableToolbarButton: true },
          //     showQuickFilter: true,
          //     quickFilterProps: { debounceMs: 300 },
          //   },
          // }}
          />
        </Paper>
      </div>
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

export default LorryReceiptRegister;
