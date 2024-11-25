import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  IconButton,
  Alert,
  Stack,
  FormControl,
  Button,
  TextField,
  InputAdornment,
  debounce,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  InputLabel,
  DialogActions,
  Slide,
} from "@mui/material";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  LoadingSpinner,
  Dialog as CustomDialog,
  SendEmail,
} from "../../../../ui-controls";
import {
  base64ToObjectURL,
  downloadFile,
  getFormattedDate,
  getFormattedLSNumber,
  // isSuperAdminOrAdmin,
} from "../../../../services/utils";
import {
  deleteLoadingSlip,
  downloadLoadingSlip,
  getBranches,
  getCustomers,
  getDrivers,
  getLoadingSlips,
  getLoadingSlipsSearch,
  getPlaces,
  getSuppliers,
  getVehicles,
  selectIsLoading,
  setSearch as onSearch,
} from "./slice/loadingSlipSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";
import { getemail } from "../lorry-receipts/slice/lorryReceiptSlice";

let filterData = "";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});
const LoadingSlips = () => {
  const users = useSelector((state) => state.user.permissions.Accounts.LoadingSlip);
  const [write, setWrite] = useState(false);
  const user = useSelector((state) => state.user);
  const [Isloading, setIsloading] = useState(false)
  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  const isUser = () => user.type.toLowerCase() === 'user';
  const columns = [
    { field: "id", headerName: "Id", flex: 1 },
    { field: "srNo", headerName: "SR.No" },
    {
      field: "lsNo",
      headerName: "LS no.",
      flex: 1,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };
        return <Button style={{ color: 'blue' }} size="small" onClick={triggerEdit} color="primary" disabled={!write}>
          {params.row.lsNo}
        </Button>;
      },
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
    },
    { field: "vehicle_number", headerName: "Vehicle no.", width: 120, flex: 1 },
    {
      field: "from_loc",
      headerName: "From",
      flex: 1,
    },
    {
      field: "to_loc",
      headerName: "To",
      flex: 1,
    },
    {
      field: "hire",
      headerName: "Hire amount",
      flex: 1,
    },
    // {
    //   field: "advance",
    //   headerName: "Advance",
    //   flex: 1,
    // },
    {
      field: "total",
      headerName: "Balance",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        const triggerView = (e) => {
          e.stopPropagation();
          triggerViewLS({ ...params.row, download: false });
        };

        const triggerDownload = (e) => {
          e.stopPropagation();
          triggerViewLS({ ...params.row, download: true });
        };

        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteLS(params.row.id);
        };
        const handlemail = async (id, lsNo) => {
          setIsloading(true)
          fetchfilename(id, lsNo)
        };
        return (
          <>
            <IconButton size="small" onClick={triggerView} color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <VisibilityIcon />
            </IconButton>
            <IconButton size="small" onClick={triggerDownload} color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <DownloadIcon />
            </IconButton>
            {/* <IconButton size="small" onClick={triggerEmail} color="primary">
              <EmailIcon />
            </IconButton> */}
            <IconButton size="small" onClick={triggerEdit} color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handlemail(params.row.id, params.row.lsNo)} size="small" color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <MailOutlinedIcon />
            </IconButton>
            {
              isUser() ? null :
                <IconButton size="small" onClick={triggerDelete} style={{ color: !write ? '#d4d4d4' : "red" }} disabled={!write}>
                  <DeleteIcon />
                </IconButton>
            }
          </>
        );
      },
      flex: 1,
    },
  ];
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    id: "",
    toEmail: "",
    message: "",
  });
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingslip, setLoadingSlips] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [viewLS, setViewLS] = useState(null);
  const [isOpenEmail, setIsOpenEmail] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedLS, setSelectedLS] = useState(null);
  const [isloading, setLoading] = useState(false);
  const [email, setEmail] = useState([])
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setSnackColour] = useState("")
  const { search: searchData } = useSelector(({ loadingslip }) => loadingslip);
  const apiRef = useGridApiRef();

  const [isSearch, setSearch] = useState(false);

  useEffect(() => {
    filterData = "";
  }, []);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });
  useEffect(() => {
    if (users.write) {
      setWrite(true)
    }
  }, [user]);

  const triggerViewLS = (ls) => {
    console.log(ls)
    setViewLS(ls);
  };


  const fetchemail = () => {
    dispatch(getemail())
      .then(({ payload = {} }) => {

        const { message } = payload?.data || {};

        const mailList = Array.isArray(payload?.data)
          ? payload.data.map((mail) => ({
            mail_id: mail.id,
            emailid: mail.emailid,
          }))
          : [{
            mail_id: payload.data.id,
            emailid: payload.data.emailid,
          }];
        setEmail(mailList)

        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
        }
      })
      .catch((error) => {
        console.log("Error in dispatch:", error);
        setSearch(false);
        setHttpError(error.message);
      });
  };


  useEffect(() => {
    fetchemail()
  }, [])
  const Send = async () => {
    if (!emailForm.toEmail) {
      setConfirmationopen(true)
      setConfirmmessage("Please Select Mail")
      setSnackColour('warning')
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.toEmail)) {
      setConfirmationopen(true)
      setConfirmmessage("Please Enter Valid Email")
      setSnackColour('warning')
      return;
    }
    try {
      setIsloading(true);
      setOpenEmailModal(false)
      const result = await dispatch(
        downloadLoadingSlip({
          id: emailForm.id,
          email: emailForm.toEmail,
          user: user?.employee?.employee_name || "",
          sendmail: true
        })
      );

      const { payload = {} } = result;
      const { message } = payload?.data || {};

      if (message) {

        // setHttpError(message);
      } else {
        const fileURL = payload?.data.success;

        if (fileURL == true) {
          setConfirmmessage('Email Send Successfully');
          setConfirmationopen(true);
          setSnackColour('green')
        }

      }
    } catch (error) {
      console.log("Error:", error);
      // setHttpError(error.message);
    } finally {
      setIsloading(false);
      fetchemail()
    }

  }
  const fetchfilename = async (id, lsNo) => {
    try {
      setIsloading(true);
      // const result = await dispatch(
      //   downloadLoadingSlip({
      //     id: id,
      //     email: "",
      //     user: user?.employee?.employee_name || "",
      //   })
      // );

      // const { payload = {} } = result;
      // const { message } = payload?.data || {};

      // if (message) {

      //   // setHttpError(message);
      // } else {
      //   console.log(payload?.data)
      //   const fileURL = payload?.data.lts_no;

      //   if (fileURL) {
      //     setEmailForm({
      //       ...emailForm,
      //       id: id,
      //       toEmail: "",
      //       message: `Please find the attached file: ${fileURL}`,
      //     });
      //     setOpenEmailModal(true)
      //   }
      // }

      setEmailForm({
        ...emailForm,
        id: id,
        toEmail: "",
        message: `Please find the attached file: LS-${lsNo}`,
      });
      setOpenEmailModal(true)
    } catch (error) {
      console.log("Error:", error);
      // setHttpError(error.message);
    } finally {
      setIsloading(false);
    }
  };
  useLayoutEffect(() => {
    const menuItem = document.querySelector("li a[href='/transactions/loadingSlips']");
    if (menuItem && isSuperAdminOrAdmin()) {
      menuItem.addEventListener('click', () => {
        setSelectedBranch({
          branch_name: "All",
          branch_id: ""
        });
        setSearch(true)
      })
    }
  }, []);

  useEffect(() => {
    dispatch(getBranches())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setBranches(payload?.data);
          const branchMemo = window.localStorage.getItem('branch');

          if (!isSuperAdminOrAdmin()) {
            if (payload?.data?.length) {
              const filteredBranch = payload?.data?.find?.(
                (branch) => branch.branch_id === user.branch
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
    dispatch(getCustomers());
    dispatch(getVehicles());
    dispatch(getSuppliers());
    dispatch(getPlaces());
    dispatch(getDrivers());
  }, [user.branch]);

  const fetchData = () => {
    setLoading(true)
    let requestObject = {}
    if (user.type.toLowerCase() == 'superadmin') {
      requestObject = {
        branch: selectedBranch?.branch_id,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,

      };
    } else {
      requestObject = {
        branch: parseInt(user.branch),
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,

      };
    }
    dispatch(getLoadingSlips(requestObject))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        // console.log(payload?.data)
        if (message) {
          setHttpError(message);
        } else {
          // const updatedLS = payload?.data.loadingSlips?.filter?.((ls) => {
          //   ls.date = getFormattedDate(new Date(ls.dc_date));
          //   ls.hire = ls.hire ? parseFloat(ls.hire).toFixed(2) : 0;
          //   ls.total = ls.total ? parseFloat(ls.total).toFixed(2) : 0;
          //   // ls.advance = ls.adv_amt ? parseFloat(ls.adv_amt).toFixed(2) : 0;
          //  // ls.lsNo = branches.filter(br => br.branch_id == ls.branch)[0]?.branch_code + "-" + ls.dc_no.toString();
          //   return !ls.isLocalMemo;
          // });
          setLoadingSlips(payload?.data.loadingSlips);
          setPageState((currState) => {
            return {
              ...currState,
              isLoading: false,
              total: payload?.data.total,
            };
          });
        }
        setSearch(false);
        setLoading(false)
      })
      .catch((error) => {

        setSearch(false);
        setHttpError(error.message);
      });
  };

  const searchLSData = () => {
    let requestObject = {}
    if (user.type.toLowerCase() == 'superadmin') {
      requestObject = {
        branch: selectedBranch?.branch_id,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
        filterData
      };
    } else {
      requestObject = {
        branch: parseInt(user.branch),
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100,
        filterData
      };
    }
    dispatch(getLoadingSlipsSearch(requestObject))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        console.log("dataaaa", payload?.data)
        if (message) {
          setHttpError(message);
        } else {
          // const updatedLS = payload?.data.loadingSlips?.filter?.((ls) => {
          //   ls.date = getFormattedDate(new Date(ls.dc_date));
          //   ls.hire = ls.hire ? parseFloat(ls.hire).toFixed(2) : 0;
          //   ls.total = ls.total ? parseFloat(ls.total).toFixed(2) : 0;
          //   ls.advance = ls.adv_amt ? parseFloat(ls.adv_amt).toFixed(2) : 0;
          //   ls.lsNo = branches.filter(br => br.branch_id === ls.branch)[0]?.branch_code + "-" + ls.dc_no.toString();
          //   return !ls.isLocalMemo;
          // });
          setLoadingSlips(payload?.data.loadingSlips);
          setPageState((currState) => {
            return {
              ...currState,
              isLoading: false,
              total: payload?.data.total,
            };
          });
        }
        setSearch(false);
      })
      .catch((error) => {

        setSearch(false);
        setHttpError(error.message);
      });
  };

  useEffect(() => {
    if (!isSearch) {
      if (isSuperAdminOrAdmin()) {
        fetchData();
      }

      if (!isSuperAdminOrAdmin()) {
        fetchData();
      }
    }
  }, [selectedBranch, paginationModel]);

  useEffect(() => {
    if (isSearch) {
      if (isSuperAdminOrAdmin()) {
        searchLSData();
      }

      if (!isSuperAdminOrAdmin()) {
        searchLSData();
      }
    }
  }, [isSearch, paginationModel]);

  useEffect(() => {
    if (viewLS && viewLS.id) {
      dispatch(downloadLoadingSlip({ id: viewLS.id, email: "" }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};

          if (message) {
            setHttpError(message);
          } else {
            if (payload?.data?.file) {

              const fileURL = base64ToObjectURL(payload?.data.file);
              const name = viewLS.lsNo + ".pdf";
              if (viewLS.download) {
                downloadFile(fileURL, name);
              } else {
                window.open(fileURL, "_blank");
              }
            }
            setViewLS(null);
          }
        })
        .catch((error) => {
          console.log(error)
          setHttpError(error.message);
        });
    }
  }, [viewLS]);

  useEffect(() => {
    if (sendEmail && emailAddress && selectedLS) {
      setIsOpenEmail(false);
      dispatch(downloadLoadingSlip({ id: selectedLS._id, email: emailAddress }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          }
          setSendEmail(false);
          setSelectedLS(null);
        })
        .catch((error) => {
          setHttpError(error.message);
          setSendEmail(false);
          setSelectedLS(null);
        });
    }
  }, [sendEmail, emailAddress, selectedLS]);

  const updateSearchValue = useMemo(() => {
    return debounce((newValue) => {
      apiRef.current.setQuickFilterValues(
        newValue.split?.(" ")?.filter?.((word) => word !== "")
      );
    }, 500);
  }, [apiRef]);

  useEffect(() => {
    if (searchData && loadingslip?.length) {
      setLoading(true);
      updateSearchValue(searchData);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [loadingslip]);
  const handleInputChange = (event, newInputValue) => {
    setEmailForm({ ...emailForm, toEmail: newInputValue });
  };
  const handleSendEmail = (email) => {
    setSendEmail(true);
    setEmailAddress(email);
  };

  const deleteLS = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const branchChangeHandler = (e, value) => {
    setSelectedBranch(value);
    if (value?.branch_id) {
      window.localStorage.setItem("branch", JSON.stringify(value));
    }
    if (filterData) { setSearch(true); }
    setPaginationModel({
      page: 0,
      pageSize: 100,
    });
  };

  const handleDialogClose = (e) => {
    setIsDialogOpen(true);
    if (e.target.value === "true") {
      dispatch(deleteLoadingSlip(selectedId))
        .then(({ payload = {} }) => {
          const { message } = payload.data?.[0];
          if (message) {
            setConfirmationopen(true)
            setConfirmmessage(message)
            setSnackColour(message.includes("Deleted Successfully!") ? 'success' : 'error')
            // setHttpError(message);
            fetchData();
          } else {
            fetchData();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    } else {
      setSelectedId("");
    }
    setIsDialogOpen(false);
  };
  const handleChange = (event, newValue) => {
    const newemail = newValue.emailid
    setEmailForm({ ...emailForm, toEmail: newemail });
  };
  const handleAddLS = () => {
    navigate("/transactions/loadingSlips/addLoadingSlip", {
      state: selectedBranch,
    });
  };

  const navigateToEdit = (id) => {
    navigate("/transactions/loadingSlips/editLoadingSlip", {
      state: { lsId: id },
    });
  };

  const onFilterChange = (searchInput) => {
    filterData = searchInput;

    if (filterData === "") {
      setSearch(true);
    }
    return searchInput
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== '')
  };

  const onFilterSubmit = (e) => {
    e.preventDefault();
    setPaginationModel({ ...paginationModel, page: 0 });
    setSearch(true);
  }

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

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
        <div></div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px' }}>
          <GridToolbarQuickFilter
            sx={{ marginTop: '5px' }} variant="outlined" size="small" quickFilterParser={onFilterChange} />  &nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={onFilterSubmit} type="button" variant="contained">Search</Button>
        </div>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      {(Isloading || isLoading || isloading) && <LoadingSpinner />}
      <div className="inner-wrap">
        {isDialogOpen && (
          <CustomDialog
            isOpen={true}
            onClose={handleDialogClose}
            title="Are you sure?"
            content="Do you want to delete the loading slip?"
            warning
          />
        )}

        <div className="page_head">
          <h1 className="pageHead">Loading slips</h1>
          <div className="page_actions">
            {
              isSuperAdminOrAdmin() ? <FormControl
                size="small"
                sx={{ width: "210px", marginRight: "5px" }}
              >
                <Autocomplete
                  disablePortal
                  size="small"
                  name="branch"
                  className="multi-select"
                  options={isSuperAdminOrAdmin() ? [{
                    branch_name: "All",
                    branch_id: ""
                  },
                  ...branches] : (branches || [])}
                  value={selectedBranch || null}
                  onChange={branchChangeHandler}
                  disabled={!isSuperAdminOrAdmin()}
                  getOptionLabel={(branch) => branch.branch_name}
                  openOnFocus
                  renderInput={(params) => (
                    <TextField {...params} label="Select branch" fullWidth />
                  )}
                />
              </FormControl> : null
            }

            <Button
              variant="contained"
              size="small"
              type="button"
              color="primary"
              className="ml6"
              onClick={handleAddLS}
              style={{ backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add a Loading Slip
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

        <div style={{ width: "100%" }}>
          <DataGrid
            hideFooter={true}
            apiRef={apiRef}
            autoHeight
            density="compact"
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            columns={columns}
            getRowId={(row) => row.id}
            rows={loadingslip.map((ls, key) => {
              return {
                ...ls,
                srNo: paginationModel.page * paginationModel.pageSize + key + 1
              }
            })}
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
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            components={{ Toolbar: CustomToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: false,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            filterMode="server"
          />
        </div>
        <CustomPagination
          page={paginationModel.page}
          rowsPerPage={paginationModel.pageSize}
          count={pageState.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        {/* <SendEmail
          isOpen={isOpenEmail}
          setIsOpen={setIsOpenEmail}
          handleEmailClose={() => {
            setIsOpenEmail(false);
            setSelectedLS(null);
          }}
          handleSendEmail={(email) => handleSendEmail(email)}
          contentBody=""
        /> */}
      </div>
      <CustomSnackbar
        open={isConfirmationopen}
        message={confirmmessage}
        onClose={() => setConfirmationopen(false)}
        color={snackColour}
      />
      <Dialog
        open={openEmailModal}
        onClose={() => setOpenEmailModal(false)}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth="sm"
        TransitionComponent={Transition} // Apply the sliding transition
        sx={{
          "& .MuiDialog-paper": {
            width: "30%",
            maxWidth: "600px",
            borderRadius: '10px'
          },
        }}
      >
        <DialogTitle id="form-dialog-title">Compose Email</DialogTitle>
        <DialogContent>
          <InputLabel htmlFor="to-input">Customer Email</InputLabel>
          <Autocomplete
            freeSolo
            options={email}
            getOptionLabel={(option) => option.emailid}
            onChange={handleChange}
            value={email.find((emailItem) => emailItem.emailid == emailForm.toEmail) || null}

            onInputChange={handleInputChange}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                placeholder="To"
                type="email"

                fullWidth
                size="small"
                inputProps={{
                  ...params.inputProps,
                  autoCapitalize: "none", // Disable auto-capitalization

                }}
              />

            )}
          />
          <InputLabel htmlFor="message-input">Subject</InputLabel>
          <TextField
            id="message-input"
            placeholder="Enter your message"
            multiline
            rows={4}
            fullWidth
            value={emailForm.message}
            onChange={(e) =>
              setEmailForm({ ...emailForm, message: e.target.value })
            }
            disabled={true}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: "center" }}>
          <Button onClick={Send} color="success" variant="contained">
            Send
          </Button>
          <Button
            onClick={() => setOpenEmailModal(false)}
            color="error"
            variant="contained"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoadingSlips;
