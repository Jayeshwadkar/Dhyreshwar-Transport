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
import Grid from "@material-ui/core/Grid";
import DownloadIcon from "@mui/icons-material/Download";
import { DataGrid } from "@mui/x-data-grid";
import FileSaver from "file-saver";
import {
  getFormattedDate,
  getFormattedLRNumber,
  getFormattedLSNumber,
  // isAdminOrSuperadmin,
} from "../../../../services/utils";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  downloadBilledLRReport,
  getBilledLRReport,
  getBranches,
} from "./slice/billLRStatusSlice";
import {
  getCustomers
} from "../../../transactions/components/lorry-receipts/slice/lorryReceiptSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";

const initialState = {
  customer: null,
  lrno: "",
  billed: "",
};
const BilledLRStatus = () => {
  const columns = [
    { field: "lr_id", headerName: "Id" },
    {
      field: "srno",
      headerName: "SR No.",
      flex: 0.3,
      renderHeader: () => (
        <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>SR No.</div>
        </div>
      ),
    },
    {
      field: "formattedLRNo",
      headerName: "LR no.",
      flex: 1,
      renderHeader: () => (
        <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>LR No</div>
          <div style={{ margin: '0', padding: '0' }}>LR Date</div>
        </div>
      ),
      renderCell: (params) => {
        return <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>{`${params.row.lr_no}`}</div>
          <div style={{ margin: '0', padding: '0' }}>{`${params.row.lr_date}`}</div>
        </div>
      },
    },
    {
      field: "memoNo",
      headerName: "Memo No",
      flex: 1,
      renderHeader: () => (
        <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>Memo No</div>
          <div style={{ margin: '0', padding: '0' }}>Memo Date</div>
        </div>
      ),
      renderCell: (params) => {
        return params.row.dc_no ? <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>{`${params.row.dc_no}`}</div>
          <div style={{ margin: '0', padding: '0' }}>{`${params.row.dc_date}`}</div>
        </div> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><b>-</b></div>
      },
    },
    // {
    //   field: "localMemoNo",
    //   headerName: "LocalMemo No.",
    //   flex: 1,
    //   renderHeader: () => (
    //     <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>LocalMemo No</div>
    //       <div style={{ margin: '0', padding: '0' }}>Memo Date</div>
    //     </div>
    //   ),
    //   renderCell: () => {
    //     return <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>-</div>
    //     </div>
    //   },
    // },
    // {
    //   field: "acknowledgementDate",
    //   headerName: "Acknowledgement",
    //   flex: 1,
    //   renderHeader: () => (
    //     <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>Acknowledgement Date</div>
    //     </div>
    //   ),
    //   renderCell: () => {
    //     return <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>-</div>
    //     </div>
    //   },
    // },
    {
      field: "billNo",
      headerName: "Bill no.",
      flex: 1,
      renderHeader: () => (
        <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>Bill No</div>
          <div style={{ margin: '0', padding: '0' }}>Bill Date</div>
        </div>
      ),
      renderCell: (params) => {
        return params.row.bill_no ? <div style={{ textAlign: "center", lineHeight: '1' }}>
          <div style={{ margin: '0', padding: '0' }}>{`${params.row.bill_no}`}</div>
          <div style={{ margin: '0', padding: '0' }}>{`${params.row.bill_date}`}</div>
        </div> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><b>-</b></div>
      },
    },
    // {
    //   field: "paymentCollectionNo",
    //   headerName: "Payment Collection No.",
    //   flex: 1,
    //   renderHeader: () => (
    //     <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>PaymentCollection No</div>
    //       <div style={{ margin: '0', padding: '0' }}>PaymentCollection Date</div>
    //     </div>
    //   ),
    //   renderCell: () => {
    //     return <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>-</div>
    //     </div>
    //   },
    // },
    // {
    //   field: "paymentAdvoiceno",
    //   headerName: "Payment Advoicen No.",
    //   flex: 1,
    //   renderHeader: () => (
    //     <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>PaymentAdvoicen No</div>
    //       <div style={{ margin: '0', padding: '0' }}>PaymentAdvoicen Date</div>
    //     </div>
    //   ),
    //   renderCell: () => {
    //     return <div style={{ textAlign: "center", lineHeight: '1' }}>
    //       <div style={{ margin: '0', padding: '0' }}>-</div>
    //     </div>
    //   },
    // },
  ];

  const user = useSelector((state) => state.user);
  const isAdminOrSuperadmin = () => user.type.toLowerCase() === 'superadmin';
  // const isLoading = useSelector(selectIsLoading);

  const [lorryReceipts, setLorryReceipts] = useState([]);
  // const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [search, setSearch] = useState(initialState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [rowCountState, setRowCountState] = useState(0);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });

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
        const { message } = payload.data;
        if (message) {
          setHttpError(message);
        } else {
          setBranches(payload.data);
          setSelectedBranch({
            branch_name: "All",
            branch_id: ""
          });
          // if (!isAdminOrSuperadmin()) {
          //   if (user && user.branch) {
          //     const filteredBranch = payload.data?.find?.(
          //       (branch) => branch.branch_id == user.branch
          //     );
          //     setSelectedBranch(filteredBranch || "");
          //   }
          // } else {
          //   setSelectedBranch({
          //     branch_name: "All",
          //     branch_id: ""
          //   });
          // }
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });

    dispatch(getCustomers())
      .then(({ payload = {} }) => {
        const { message } = payload.data;
        if (message) {
          setHttpError(message);
        } else {
          const updatedCustomers = payload.data?.map?.((customer) => {
            return {
              ...customer,
              label: customer.name,
            };
          });
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  }, []);

  const fetch = () => {

    if (isSubmitted) {
      const query = {};
      if (selectedBranch && selectedBranch.branch_id) {
        query.branch = selectedBranch.branch_id;
      }
      if (search.customer) {
        query.customer = search.customer.customer_id;
      }
      if (search.lrno) {
        query.lrno = search.lrno;
      }
      // if (search.billed) {
      //   query.billed = search.billed;
      // }
      const params = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
        query: query,
      };
      setIsLoading(true)
      dispatch(getBilledLRReport(params))
        .then(({ payload = {} }) => {
          const { lorryReceipts = [], count } = payload.data;

          setLorryReceipts(lorryReceipts);
          setPageState((prev) => ({ ...prev, total: count }))
          setIsSubmitted(false);
        })
        .catch((error) => {
          setIsSubmitted(false);
          setHttpError(error.message);
        }).finally(() => setIsLoading(false));
    } else {
      setIsSubmitted(false)
      //setLorryReceipts([])
    }
  }

  useEffect(() => {
    fetch()
  }, [isSubmitted, selectedBranch, page, pageSize, search]);

  useEffect(() => {
    if (isDownload) {
      const query = {};
      if (selectedBranch && selectedBranch.branch_id) {
        query.branch = selectedBranch.branch_id;
      }
      if (search.customer) {
        query.customer = search.customer.customer_id;
      }
      // if (search.billed) {
      //   query.billed = search.billed;
      // }
      if (search.lrno) {
        query.lrno = search.lrno;
      }
      setIsLoading(true);
      dispatch(downloadBilledLRReport({ query }))
        .then(({ payload = {} }) => {
          const { message } = payload.data;
          if (message) {
            setHttpError(message);
          } else {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0'); // 24-hour format
            const minutes = String(now.getMinutes()).padStart(2, '0');
            FileSaver.saveAs(payload.data, `Over_All_Report_${day}-${month}-${year}_${hours}-${minutes}.xlsx`);
          }
          setIsDownload(false);
        })
        .catch((error) => {
          setIsDownload(false);
          setHttpError(error.message);
        }).finally(() => setIsLoading(false));
    }
  }, [search, isDownload, selectedBranch]);

  const triggerDownload = (e) => {
    e.preventDefault();
    setIsDownload(true);
  };

  const branchChangeHandler = (e, value) => {
    setSelectedBranch(value);
    setIsSubmitted(true);
    // setSearch(initialState);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (search.customer || search.lrno) {
      setIsSubmitted(true);
    }

  };

  const autocompleteChangeListener = (e, option, name) => {
    setSearch((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  const inputChangeHandler = (e) => {
    setSearch((currState) => {
      return {
        ...currState,
        lrno: e.target.value,
      };
    });
  };

  const resetHandler = (e) => {
    e.preventDefault();
    setSearch(initialState);
    setIsSubmitted(true);
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
      <div
        className="page_head-1"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h1 className="pageHead">Over All Report</h1>
        <div className="page_actions">
          {/**isAdminOrSuperadmin() &&**/ (
            <FormControl
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
              <FormControl fullWidth size="small">
                <Autocomplete
                  disablePortal
                  autoSelect
                  autoHighlight={true}
                  size="small"
                  name="customer"
                  options={customers || []}
                  value={search.customer}
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
              <FormControl fullWidth>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="LR No."
                  value={search.lrno}
                  onChange={inputChangeHandler}
                  name="lrNo"
                  id="lrNo"
                  inputProps={{ maxLength: 400, tabIndex: 1 }}
                />
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
        {lorryReceipts.length > 0 ? (
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
          getRowId={(row) => row.lr_id}
          sx={{ backgroundColor: "primary.contrastText" }}
          initialState={{
            ...columns,
            columns: {
              columnVisibilityModel: {
                lr_id: false,
              },
            },
          }}
          disableSelectionOnClick
          // rows={lorryReceipts}
          rows={lorryReceipts.map((lr, key) => {
            return {
              ...lr,
              srno: paginationModel.page * paginationModel.pageSize + key + 1
            }
          })}
          // rowsPerPageOptions={[100]}
          // pagination
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

export default BilledLRStatus;
