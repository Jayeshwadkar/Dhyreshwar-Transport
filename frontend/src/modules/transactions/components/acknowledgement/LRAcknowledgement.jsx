import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DataGrid,
  GridToolbarContainer,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  IconButton,
  Alert,
  Stack,
  FormControl,
  Paper,
  TextField,
  FormHelperText,
  Button,
  InputAdornment,
  debounce,
  Typography
  // Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { LoadingSpinner, Dialog as CustomDialog, } from "../../../../ui-controls";
import {
  getFormattedDate,
  // getFormattedLSNumber,
  // getFormattedTime,
  // isSuperAdmin,
  // isSuperAdminOrAdmin,
} from "../../../../services/utils";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  getBranches,
  getLoadingSlipsById,
  getLRAckWithCount,
  getPlaces,
  selectIsLoading,
  setSearch as onSearch,
  deleteLorryReceiptAck
} from "./slice-old/acknowledgeSlice";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import dayjs from "dayjs";
import CustomPagination from "../../../../components/ui/CustomPagination";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

const initialState = {
  startDate: null,
  endDate: null,
  type: "",
  lrNo: "",
  searchStr: ""
};

const initialErrorState = {
  startDate: {
    invalid: false,
    message: "",
  },
  endDate: {
    invalid: false,
    message: "",
  },
};

const LRAcknowledgement = () => {
  const user = useSelector((state) => state.user);
  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  const [branches, setBranches] = useState([]);
  const columns = [
    { field: "id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    { field: "invoiceNo", headerName: "Invoice No" },
    {
      field: "lrNo",
      headerName: "LR no.",
      // renderCell: (params) => {
      //   return `${branches.filter(brn => brn._id === params.row?.branch)[0]?.branchCode}-${params.row.lrNo}`;
      // },
    },
    { field: "eWayBillNo", headerName: "Way bill" },
    {
      field: "lsNo",
      headerName: "LS no.",
      // renderCell: (params) => {
      //   return params.row.associatedLS && `${branches.filter(brn => brn._id === params.row.associatedLS?.branch)[0]?.branchCode}-${params.row.associatedLS?.lsNo}`;
      // },
    },
    {
      field: "dc_date",
      headerName: "LS Date",
      minWidth: 100,
      // renderCell: (params) => {
      //   return params.row.associatedLS && `${dayjs(
      //     params.row.associatedLS?.date
      //   ).format("DD-MM-YYYY")}`;
      // },
    },
    { field: "lmNo", headerName: "Local Memo No", minWidth: 140, },
    {
      field: "unloadBranch",
      headerName: "Unloaded",
      renderCell: (params) => {
        return params.row.unloadBranch ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          ""
        );
      },
    },
    {
      field: "unloadDate",
      headerName: "Unloaded date",
      minWidth: 120,
      renderCell: (params) => {
        return params.row.unloadDate
          ? getFormattedDate(params.row.unloadDate)
          : "";
      },
    },
    { field: "unloadTo", headerName: "Unloaded to" },
    {
      field: "",
      headerName: "Delivered",
      renderCell: (params) => {
        return params.row.delivery_date ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          ""
        );
      },
    },
    { field: "deliveryType", headerName: "Delivery place" },
    {
      field: "delivery_date",
      headerName: "Delivered date",
      minWidth: 120,
      renderCell: (params) => {
        return params.row.delivery_date;
      },
    },
    {
      field: "ack_date",
      headerName: "Aknowledgement date",
      minWidth: 120,
      renderCell: (params) => {
        return params.row.delivery_date;
      },
    },
    { field: "payType", headerName: "Pay mode", maxWidth: 100 },
    {
      field: "total",
      headerName: "Receivable amount",
      type: "number",
      minWidth: 150,
      renderCell: (params) => {
        return <strong>₹ {params.row.total}</strong>;
      },
    },
    {
      field: "close",
      headerName: "Closed",
      renderCell: (params) => {
        return params.row.close ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          ""
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      maxWidth: 70,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteAck(params.row.id);
        };

        return (
          <>
            <IconButton disabled={!write || params.row.status == 5} size="small" onClick={triggerEdit} color="primary">
              <EditIcon style={{ color: !write || params.row.status == 5 ? '#d4d4d4' : "black" }} />
            </IconButton>
            {
              isSuperAdminOrAdmin() &&
              <IconButton disabled={!write || params.row.status == 5} size="small" onClick={triggerDelete}>
                <DeleteIcon style={{ color: !write || params.row.status == 5 ? '#d4d4d4' : "red" }} />
              </IconButton>
            }
          </>
        );
      },
    },
  ];
  const apiRef = useGridApiRef();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const users = useSelector((state) => state.user.permissions["Sales/Purchase"].LRAcknowledge)
  const [write, setWrite] = useState(false);

  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [search, setSearch] = useState(initialState);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);
  const [getLR, setGetLR] = useState(true);
  const [isloading, setLoading] = useState(false);
  const { search: searchData } = useSelector(({ acknowledge }) => acknowledge);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setSnackColour] = useState("")

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });

  const deleteAck = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (users.write) {
      setWrite(true)
    }
  }, [user]);

  useEffect(() => {
    dispatch(getBranches())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setBranches(payload?.data);
          if (user && user.branch) {
            const filteredBranch = payload?.data?.find?.(
              (branch) => branch.branch_id === user.branch
            );
            setSelectedBranch(filteredBranch || "");
          }
        }
      })
      .catch(() => {
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      });
    dispatch(getPlaces());
  }, []);

  useEffect(() => {
    if (isSubmitted && !hasErrors) {
      const requestObject = {
        query: search,
        branch: selectedBranch?.branch_id,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
      };
      setLoading(true)
      dispatch(getLRAckWithCount(requestObject))
        .then(({ payload = {} }) => {

          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setPageState((currState) => { return { ...currState, total: payload?.data.count } });
            setAcknowledgements(payload?.data.lorryReceipts);
          }
          setIsSubmitted(false);
          setLoading(false)
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [
    getLR,
    selectedBranch,
    paginationModel,
    isSubmitted,
  ]);

  // useEffect(() => {
  //   if (acknowledgements?.length) {
  //     const filteredLSList = acknowledgements?.filter?.(
  //       (lr) => lr.associatedLS
  //     );
  //     const lsList = filteredLSList?.map?.((lr) => lr.associatedLS);
  //     const uniqueLSList = [...new Set(lsList)];

  //     dispatch(getLoadingSlipsById(uniqueLSList))
  //       .then(({ payload = {} }) => {
  //         const { message } = payload?.data || {};
  //         if (message) {
  //           setHttpError(message);
  //         } else {
  //           const updatedLR = acknowledgements;
  //           updatedLR?.forEach?.((lr) => {
  //             const assoLS = payload?.data?.find?.(
  //               (ls) => ls._id === lr.associatedLS
  //             );
  //             lr.associatedLS = assoLS;
  //             lr.total = lr.total?.toFixed?.(2);
  //             lr.deliveryDate = lr.deliveryDate
  //               ? getFormattedDate(lr.deliveryDate)
  //               : "";
  //             // lr.lsNo = getFormattedLSNumber(assoLS?.lsNo);
  //           });
  //           setPageState((currState) => {
  //             return { ...currState, data: updatedLR };
  //           });
  //         }
  //       })
  //       .catch((error) => {
  //         setHttpError(error.message);
  //       });
  //   }
  // }, [acknowledgements]);

  const updateSearchValue = useMemo(() => {
    return debounce((newValue) => {
      apiRef.current.setQuickFilterValues(
        newValue.split?.(" ")?.filter?.((word) => word !== "")
      );
    }, 500);
  }, [apiRef]);

  useEffect(() => {
    if (searchData && pageState.data?.length) {
      setLoading(true);
      updateSearchValue(searchData);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [pageState.data]);

  const onSearchChange = (e) => {
    updateSearchValue(e.target.value);
    dispatch(onSearch(e.target.value));
  };

  const navigateToEdit = (id) => {
    navigate("/transactions/lrAcknowledgement/editLRAcknowledgement", {
      state: { lrId: id, branches },
    });
  };

  const branchChangeHandler = (e, value) => {
    setSelectedBranch(value);
    setIsSubmitted(true);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    // setFormErrors(() => validateForm(search));
    setIsSubmitted(true);
  };

  const inputDateChangeHandler = (name, date) => {
    setSearch((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
    setIsSubmitted(false);
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setSearch((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.startDate) {
      errors.startDate = { invalid: true, message: "Start date is required" };
    }
    if (!formData.endDate) {
      errors.endDate = { invalid: true, message: "End date is required" };
    }

    let validationErrors = false;
    for (const key in errors) {
      if (errors[key].invalid === true) {
        validationErrors = true;
      }
    }
    if (validationErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
    return errors;
  };

  const resetSearchForm = () => {
    setHasErrors(false);
    setFormErrors(initialErrorState);
    setIsSubmitted(true);
    setSearch(initialState);
    setGetLR(true);
  };

  const addAckHandler = () => {
    navigate("/transactions/lrAcknowledgement/addLRAcknowledgement", {
      state: selectedBranch?._id,
    });
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(deleteLorryReceiptAck(selectedId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data?.[0] || {};
          console.log(payload.data, message)
          if (message) {
            // setHttpError(message);
            setConfirmationopen(true)
            setConfirmmessage(message)
            setSnackColour('success')
          }
          setIsDialogOpen(false);
          setIsSubmitted(true);
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleRowsPerPageChange = (event) => {
    setPaginationModel({
      ...paginationModel,
      pageSize: parseInt(event.target.value, 100),
      page: 0,
    });
  };

  const handlePageChange = (newPage) => {
    if (filterData) { setSearch(true); }
    setPaginationModel({
      ...paginationModel,
      page: newPage,
    });
  };

  return (
    <>
      {isloading && <LoadingSpinner />}
      <div className="inner-wrap">
        {isDialogOpen && (
          <CustomDialog
            isOpen={true}
            onClose={handleDialogClose}
            title="Are you sure?"
            content="Do you want to delete the bill"
            warning
          />
        )}
        <div className="page_head">
          <h1 className="pageHead">LR acknowledgements</h1>
          <div className="page_actions">
            {/* <FormControl
              size="small"
              sx={{ width: "210px", marginRight: "5px", marginTop: "5px" }}
            >
              <Autocomplete
                disablePortal
                size="small"
                name="branch"
                className="multi-select"
                options={branches || []}
                value={selectedBranch}
                onChange={branchChangeHandler}
                disabled={!isSuperAdminOrAdmin()}
                getOptionLabel={(branch) => branch.name}
                openOnFocus
                renderInput={(params) => (
                  <TextField {...params} label="Select branch" fullWidth />
                )}
              />
            </FormControl> */}
            <Button
              style={{ marginTop: "5px", backgroundColor: !write ? '#d4d4d4' : "black" }}
              variant="contained"
              size="medium"
              type="button"
              color="primary"
              className="ml6"
              onClick={addAckHandler}
              disabled={!write}
            >
              Add acknowledgement
            </Button>
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
          <h2 style={{ marginBottom: "10px" }}>Search</h2>
          <form action="" onSubmit={submitHandler}>
            <div className="grid grid-5-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.startDate.invalid}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      inputFormat="DD/MM/YYYY"
                      value={search.startDate}
                      disableFuture={true}
                      disableMaskedInput={true}
                      onChange={inputDateChangeHandler.bind(null, "startDate")}
                      inputProps={{
                        readOnly: true,
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="date"
                          size="small"
                          {...params}
                          error={formErrors.startDate.invalid}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  {formErrors.startDate.invalid && (
                    <FormHelperText>
                      {formErrors.startDate.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.endDate.invalid}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End date"
                      inputFormat="DD/MM/YYYY"
                      value={search.endDate}
                      disableMaskedInput={true}
                      onChange={inputDateChangeHandler.bind(null, "endDate")}
                      inputProps={{
                        readOnly: true,
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="date"
                          size="small"
                          {...params}
                          error={formErrors.endDate.invalid}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  {formErrors.endDate.invalid && (
                    <FormHelperText>
                      {formErrors.endDate.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              {/* <div className="grid-item">
                <ToggleButtonGroup
                  sx={{ alignItems: "center" }}
                  color="primary"
                  name="type"
                  value={search.type}
                  size="small"
                  exclusive
                  onChange={inputChangeHandler}
                  style={{ width: "100%" }}
                >
                  <ToggleButton name="type" value="" style={{ width: "100%" }}>
                    All
                  </ToggleButton>
                  <ToggleButton
                    name="type"
                    value="loaded"
                    style={{ width: "100%" }}
                  >
                    Loaded
                  </ToggleButton>
                  <ToggleButton
                    name="type"
                    value="unloaded"
                    style={{ width: "100%" }}
                  >
                    Unloaded
                  </ToggleButton>
                </ToggleButtonGroup>
              </div> */}
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="LR no."
                    value={search.lrNo}
                    onChange={inputChangeHandler}
                    name="lrNo"
                    id="lrNo"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Search"
                    value={search.searchStr}
                    onChange={inputChangeHandler}
                    name="searchStr"
                    id="search"
                  />
                </FormControl>
                <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
                  Inv./WayBill./Memo/LMemo
                </Typography>
              </div>
              <div className="grid-item">
                <IconButton
                  size="small"
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ backgroundColor: "#274d62", marginLeft: "5px" }}
                >
                  <SearchIcon
                    style={{ color: "#ffffff", verticalAlign: "middle" }}
                  />
                </IconButton>
                <IconButton
                  size="small"
                  variant="contained"
                  color="primary"
                  type="button"
                  onClick={resetSearchForm}
                  style={{ backgroundColor: "#274d62", marginLeft: "5px" }}
                >
                  <RestartAltIcon
                    style={{ color: "#ffffff", verticalAlign: "middle" }}
                  />
                </IconButton>
              </div>
            </div>
          </form>
        </Paper>

        <DataGrid
          hideFooter={true}
          apiRef={apiRef}
          autoHeight
          density="compact"
          rows={acknowledgements}
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
          // components={{
          //   Toolbar: () => (
          //     <GridToolbarContainer
          //       sx={{
          //         gap: "6px",
          //         mb: "10px",
          //         justifyContent: "end",
          //         border: "none",
          //       }}
          //     >
          //       <TextField
          //         variant="standard"
          //         placeholder="Search..."
          //         autoFocus={!searchData}
          //         onChange={onSearchChange}
          //         value={searchData}
          //         InputProps={{
          //           startAdornment: (
          //             <InputAdornment position="start">
          //               <SearchOutlined />
          //             </InputAdornment>
          //           ),
          //         }}
          //       />
          //     </GridToolbarContainer>
          //   ),
          // }}
          disableSelectionOnClick
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
        />
      </div >
      <CustomPagination
        page={paginationModel.page}
        rowsPerPage={paginationModel.pageSize}
        count={pageState.total}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      <CustomSnackbar
        open={isConfirmationopen}
        message={confirmmessage}
        onClose={() => setConfirmationopen(false)}
        color={snackColour}
      />
    </>
  );
};

export default LRAcknowledgement;
