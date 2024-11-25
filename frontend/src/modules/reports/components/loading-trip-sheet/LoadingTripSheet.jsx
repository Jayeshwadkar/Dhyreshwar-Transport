import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Stack,
  FormControl,
  Button,
  Paper,
  TextField,
  Autocomplete,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Grid from "@material-ui/core/Grid";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  getFormattedDate,
  getFormattedLSNumber,
  // isSuperAdminOrAdmin,
} from "../../../../services/utils";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  downloadChallanReport,
  getBranches,
  getLoadingSlipForReport,
  getSuppliers,
  getVehicles,
  selectIsLoading,
} from "./slice/tripSheetSlice";
import FileSaver from "file-saver";
import CustomPagination from "../../../../components/ui/CustomPagination";

const initialState = {
  from: null,
  to: null,
  lrNo: "",
  transporter: null,
  vehicleNo: null,
};

const LoadingTripSheet = () => {
  const columns = [
    { field: "id", headerName: "Id", flex: 1 },
    { field: "srNo", headerName: "Sr.No", flex: 1 },
    {
      field: "dc_no",
      headerName: "LS no.",
      flex: 1,
    },
    {
      field: "dc_date",
      headerName: "Date",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "vehicleno",
      headerName: "Vehicle no.",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "name",
      headerName: "Transporter name",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "loc_from",
      headerName: "From",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "loc_to",
      headerName: "To",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "hire",
      headerName: "Hire amount",
      type: "number",
      minWidth: 120,
      flex: 1,
    },
    {
      field: "adv_amt",
      headerName: "Advance",
      type: "number",
      minWidth: 120,
      flex: 1,
    },
    // {
    //   field: "totalPaid",
    //   headerName: "Total paid",
    //   type: "number",
    //   minWidth: 120,
    //   flex: 1,
    // },
    {
      field: "total",
      headerName: "Balance",
      type: "number",
      minWidth: 120,
      flex: 1,
    },
  ];
  const isLoading = useSelector(selectIsLoading);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  const { vehicles, suppliers } =
    useSelector(({ tripsheetreport }) => tripsheetreport) || {};
  const [branches, setBranches] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [search, setSearch] = useState(initialState);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [lsData, setLsData] = useState([])
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });

  useEffect(() => {
    dispatch(getBranches())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setBranches(payload?.data);
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
              branch_id: ""
            });
          }
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });

    dispatch(getVehicles());
    dispatch(getSuppliers());
  }, []);

  useEffect(() => {
    if (isSubmitted && ((user.branch && selectedBranch) || !user.branch)) {
      const query = {};
      if (selectedBranch && selectedBranch.branch_id) {
        query.branch = selectedBranch.branch_id;
      }
      if (search.lrNo) {
        query.lrNo = search.lrNo.trim();
      }
      if (search.from) {
        query.from = search.from;
      }
      if (search.to) {
        query.to = search.to;
      }
      if (search.transporter && search.transporter.supplier_id) {
        query.transporter = search.transporter.supplier_id;
      }
      if (search.vehicleNo && search.vehicleNo.vehicle_id) {
        query.vehicleNo = search.vehicleNo.vehicle_id;
      }

      const requestObject = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
        query: query,
      };

      dispatch(getLoadingSlipForReport(requestObject))
        .then(({ payload = {} }) => {
          const { message, loadingSlips } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setLsData(loadingSlips)
            setPageState((prev) => ({ ...prev, total: payload?.data.count }))
            // const updatedLS = loadingSlips.map((ls) => {
            //   ls.formattedDate = getFormattedDate(ls.date);
            //   ls.formattedLSNo = getFormattedLSNumber(ls.lsNo);

            //   ls.fromPlace = ls.fromName;
            //   ls.toPlace = ls.toName;

            //   ls.hire = ls.hire?.toFixed(2);

            //   ls.totalPaid = ls.supplierPayments.reduce(
            //     (acc, payment) => acc + payment.paid,
            //     0
            //   );
            //   ls.totalBalance =
            //     +ls.hire +
            //     +ls.hamali -
            //     +ls.advance -
            //     +ls.commission -
            //     +ls.stacking -
            //     ls.totalPaid;
            //   return ls;
            // });
            // setPageState((currState) => {
            //   return {
            //     ...currState,
            //     isLoading: false,
            //     data: updatedLS || [],
            //     total: payload?.data.count,
            //   };
            // });
          }
          setIsSubmitted(false);
        })
        .catch((error) => {
          setIsSubmitted(false);
          setHttpError(error.message);
        });
    }
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    selectedBranch,
    isSubmitted,
    dispatch,
    search.from,
    search.lrNo,
    search.to,
  ]);

  const triggerDownload = (e) => {
    e.preventDefault();
    const query = { isPrint: true };
    if (selectedBranch && selectedBranch.branch_id) {
      query.branch = selectedBranch.branch_id;
    }
    if (search.lrNo) {
      query.lrNo = search.lrNo.trim();
    }
    if (search.from) {
      query.from = search.from;
    }
    if (search.to) {
      query.to = search.to;
    }
    if (search.transporter && search.transporter.supplier_id) {
      query.transporter = search.transporter.supplier_id;
    }
    if (search.vehicleNo && search.vehicleNo.vehicle_id) {
      query.vehicleNo = search.vehicleNo.vehicle_id;
    }
    const requestObject = {
      pagination: {
        limit: paginationModel.pageSize ? paginationModel.pageSize : 100,
        page: paginationModel.page + 1,
      },
      query: query,
    };
    dispatch(downloadChallanReport(requestObject))
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
          FileSaver.saveAs(blob, `Memo_Report_${day}-${month}-${year}_${hours}-${minutes}.xlsx`);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  };

  const handleInputChange = (e) => {
    setSearch((prev) => ({ ...prev, lrNo: e.target.value }))
  }

  const autocompleteChangeListener = (e, option, name) => {
    setSearch((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  const branchChangeHandler = (e, value) => {
    setSelectedBranch(value);
    setIsSubmitted(true);
    setSearch(initialState);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const dateInputChangeHandler = (name, date) => {
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
      <div className="inner-wrap">
        <div
          className="page_head-1"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h1 className="pageHead">Loading Trip Register</h1>
          <div className="">
            {
              /**isSuperAdminOrAdmin() &&**/ <FormControl
                size="small"
                sx={{ width: "210px", marginRight: "5px", marginBottom: "20px" }}
              >
                <Autocomplete
                  disablePortal
                  size="small"
                  name="branch"
                  // options={isSuperAdminOrAdmin() ? [{
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
                  // disabled={!isSuperAdminOrAdmin()}
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
                  value={search.lrNo}
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
                    autoHighlight={true}
                    size="small"
                    name="transporter"
                    options={suppliers || []}
                    value={search.transporter}
                    getOptionLabel={(option) => option.name}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "transporter")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} label="Transporter" fullWidth />
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
                    name="vehicleNo"
                    options={vehicles || []}
                    value={search.vehicleNo}
                    getOptionLabel={(option) => option.vehicleno}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "vehicleNo")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} label="Vehicle No" fullWidth />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid style={{ display: "flex" }} item xs={2}>
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
          {lsData?.length > 0 ? (
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
            rows={lsData.map((elm, key) => {
              return {
                ...elm,
                srNo: paginationModel.page * paginationModel.pageSize + key + 1
              }
            })}
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

export default LoadingTripSheet;
