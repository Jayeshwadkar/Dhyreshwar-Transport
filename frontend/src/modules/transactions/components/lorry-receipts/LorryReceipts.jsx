import React, { useEffect, useLayoutEffect, useState } from "react";
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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  InputLabel,
  DialogActions,
  fabClasses,
  Slide,
} from "@mui/material";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import {
  LoadingSpinner,
  Dialog as CustomDialog,
  SendEmail,
} from "../../../../ui-controls";
import {
  base64ToObjectURL,
  downloadFile,
  getFormattedDate,
  // isSuperAdminOrAdmin,
} from "../../../../services/utils";
import { checkAuth } from "../../../../router/RequireAuth";
import {
  downloadLorryReceipt,
  getBranches,
  getLorryReceiptsWithCount,
  getLorryReceiptsBySearch,
  selectIsLoading,
  deleteLorryReceipt as removeLorryReceipt,
  getemail,
} from "./slice/lorryReceiptSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";
import { PAY_TYPES } from "../../../../services/constants";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";
import { idID } from "@mui/material/locale";

let filterData = "";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});
const LorryReceipts = () => {
  const user = useSelector((state) => state.user);

  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  const isUser = () => user.type.toLowerCase() === 'user';
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    id: "",
    toEmail: "",
    message: "",
  });

  const fetchfilename = async (id, lr_no, branch_code) => {
    try {
      setIsloading(true);
      // const result = await dispatch(
      //   downloadLorryReceipt({
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
      //   const fileURL = payload?.data.lrnum;

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
        message: `Please find the attached file: LR-${branch_code}-${lr_no}`,
      });
      setOpenEmailModal(true)
    } catch (error) {
      console.log("Error:", error);
      // setHttpError(error.message);
    } finally {
      setIsloading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    {
      field: "lr_no",
      headerName: "ConsignNo",
      flex: 1,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };
        return <Button style={{ color: 'blue' }} disabled={!write || params.row.status == 5 || params.row.status == 4 || params.row.ack_date != null} size="small" onClick={triggerEdit} color="primary">
          {/* {branches.find(branch => branch.branch_id === params.row.branch)?.branch_code + "-" + params.row.lr_no} */}
          {params.row.lrNo}
        </Button>;
      },
    },
    {
      field: "lr_date",
      headerName: "ConsignDate",
      flex: 1,
    },
    {
      field: "consigner",
      headerName: "Consignor",
      flex: 1,
    },
    { field: "loc_from", headerName: "From", flex: 1 },
    {
      field: "consignee",
      headerName: "Consignee",
      flex: 1,
    },
    { field: "loc_to", headerName: "To", flex: 1 },
    {
      field: "pay_type", headerName: "Pay Mode", flex: 1,
      renderCell: (params) => {
        return <>{PAY_TYPES[Number(params.row.pay_type)]?.label || params.row.pay_type}</>;
      },
    },
    {
      field: "total",
      headerName: "Grand total",
      headerAlign: "start",
      type: "number",
      flex: 1,
      renderCell: (params) => {
        // return <strong>₹ {params.row.total}</strong>;
        return (
          <div style={{ width: "100%", textAlign: 'start' }}>
            <strong>₹ {params.row.total}</strong>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const triggerView = (e) => {
          e.stopPropagation();
          setViewLRId({ ...params.row, download: false });
        };

        const triggerDownload = (e) => {
          e.stopPropagation();
          setViewLRId({ ...params.row, download: true });
        };

        // const triggerEmail = (e) => {
        //   e.stopPropagation();
        //   setIsOpenEmail(true);
        //   setSelectedLR({ ...params.row });
        // };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteLorryReceipt(params.row.id);
        };

        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };
        const handlemail = async (id, lr_no, branch_code) => {
          setIsloading(true)
          fetchfilename(id, lr_no, branch_code)



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
            <IconButton disabled={!write || params.row.status == 5 || params.row.status == 4 || params.row.ack_date != null} size="small" onClick={triggerEdit}
              color="primary"
              style={{ color: !write || params.row.status == 5 || params.row.status == 4 || params.row.ack_date != null ? '#d4d4d4' : "black" }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handlemail(params.row.id, params.row.lr_no, params.row.branch_code)} size="small" color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <MailOutlinedIcon />
            </IconButton>
            {
              isUser() ? null :
                <IconButton disabled={!write || params.row.status != 1 || params.row.ack_date != null} size="small" onClick={triggerDelete}
                  style={{ color: !write || params.row.status != 1 || params.row.ack_date != null ? '#d4d4d4' : "red" }}>
                  <DeleteIcon />
                </IconButton>
            }

          </>
        );
      },
    },
  ];

  const navigate = useNavigate();

  const isLoading = useSelector(selectIsLoading);
  const [Isloading, setIsloading] = useState(false)
  const { places } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );
  const users = useSelector((state) => state.user.permissions.Accounts.LorryReceipt);

  const [branches, setbranches] = React.useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [write, setWrite] = useState(false);
  const [lrData, setLrData] = useState([])
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [viewLRId, setViewLRId] = useState("");
  const [isOpenEmail, setIsOpenEmail] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedLR, setSelectedLR] = useState(null);
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setSnackColour] = useState("")
  const [email, setEmail] = useState([])
  const apiRef = useGridApiRef();
  const dispatch = useDispatch();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });

  const [pageState, setPageState] = useState({
    total: 0,
  });

  const [isSearch, setSearch] = useState(false);

  useEffect(() => {
    filterData = "";
  }, []);
  useEffect(() => {
    console.log(user.read, user.write)
    if (users.write) {
      console.log("user.write", user.write)
      setWrite(true)
    }

  }, [user]);
  useLayoutEffect(() => {
    const menuItem = document.querySelector("li a[href='/transactions/lorryReceipts']");
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
          setbranches(payload.data);
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
  }, []);

  const fetchData = () => {
    let requestObject = {}

    if (user.type.toLowerCase() == 'superadmin') {
      requestObject = {
        branch: selectedBranch?.branch_id,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100
      };
    } else {
      requestObject = {
        branch: parseInt(user.branch),
        page: paginationModel.page,
        pageSize: paginationModel.pageSize ? paginationModel.pageSize : 100
      };
    }

    dispatch(getLorryReceiptsWithCount(requestObject))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("")
          setLrData(payload?.data.lorryReceipts)
          setPageState({ total: payload?.data.total });
        }
        setSearch(false);
      })
      .catch((error) => {
        setSearch(false);
        setHttpError(error.message);
      });
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
  const handleInputChange = (event, newInputValue) => {
    setEmailForm({ ...emailForm, toEmail: newInputValue });
  };

  const handleChange = (event, newValue) => {
    const newemail = newValue.emailid
    setEmailForm({ ...emailForm, toEmail: newemail });
  };
  const searchData = () => {
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

    dispatch(getLorryReceiptsBySearch(requestObject))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("")
          setLrData(payload?.data.lorryReceipts)
          setPageState({ total: payload?.data.total });
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
        searchData();
      }

      if (!isSuperAdminOrAdmin()) {
        searchData();
      }
    }
  }, [isSearch, paginationModel]);

  useEffect(() => {
    if (viewLRId) {
      dispatch(
        downloadLorryReceipt({
          id: viewLRId.id,
          email: "",
          user: user?.employee?.employee_name || "",
        })
      )
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};

          if (message) {
            //setHttpError(message);
          } else {
            const fileURL = base64ToObjectURL(payload?.data.file);
            const selectedLR = payload?.data.lrnum
            if (fileURL) {
              if (viewLRId.download) {
                const name = "LR-" + selectedLR + ".pdf";
                downloadFile(fileURL, name);
              } else {
                window.open(fileURL, "_blank");
              }
            }
          }
        })
        .catch((error) => {
          setHttpError("Something Went Wrong!!");
          console.log("error.message", error.message)
        });
    }
  }, [viewLRId]);

  useEffect(() => {
    if (sendEmail && emailAddress && selectedLR) {
      setIsOpenEmail(false);
      dispatch(
        downloadLorryReceipt({
          id: selectedLR.id,
          email: emailAddress,
          user: user?.employee?.name || "",
        })
      )
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          }
          setSendEmail(false);
          setSelectedLR(null);
        })
        .catch((error) => {
          setHttpError(error.message);
          setSelectedLR(null);
        });
    }
  }, [sendEmail, emailAddress, selectedLR]);

  const handleSendEmail = (email) => {
    setSendEmail(true);
    setEmailAddress(email);
  };

  const handleAddLR = () => {
    // if (checkAuth("Accounts", "LorryReceipt", ["read", "write"])) {
    navigate("/transactions/lorryReceipts/addLorryReceipt", {
      state: selectedBranch,
    });
    // }
  };

  const navigateToEdit = (id) => {
    // if (checkAuth("Accounts", "LorryReceipt", ["read", "write"])) {
    navigate("/transactions/lorryReceipts/editLorryReceipt", {
      state: { lrId: id },
    });
    //  }
  };

  const deleteLorryReceipt = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (e) => {
    setIsDialogOpen(true);
    if (e.target.value === "true") {
      dispatch(removeLorryReceipt(selectedId))
        .then(({ payload = {} }) => {
          const { message } = payload.data?.[0] || {};
          if (message) {
            setConfirmationopen(true)
            setConfirmmessage(message)
            setSnackColour(message.includes("LR Deleted Successfully") ? 'success' : 'error')
            // setHttpError(message);
          }
          setIsDialogOpen(false);
          fetchData();
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    } else {
      setSelectedId("");
    }
    setIsDialogOpen(false);
  };

  const branchChangeHandler = (e, value) => {
    setSelectedBranch(value);
    if (value?.branch_id) {
      window.localStorage.setItem("branch", JSON.stringify(value));
    }
    // setSearch(true);
    setPaginationModel({
      page: 0,
      pageSize: 100,
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
  const Send = async () => {
    console.log(emailForm)
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
        downloadLorryReceipt({
          id: emailForm.id,
          email: emailForm.toEmail,
          user: user?.employee?.employee_name || "",
          message: emailForm.message,
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

  const handleMessageChange = (e) => {
    setEmailForm((prev) => ({ ...prev, message: e.target.value }));
  };


  return (
    <>
      {(Isloading || isLoading) && <LoadingSpinner />}
      <div className="inner-wrap">
        {isDialogOpen && (
          <CustomDialog
            isOpen={true}
            onClose={handleDialogClose}
            title="Are you sure?"
            content="Do you want to delete the lorry receipt?"
            warning
          />
        )}

        <div className="page_head">
          <h1 className="pageHead">Lorry receipts</h1>
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
                  getOptionLabel={(branch) => branch.branch_name || ""}
                  isOptionEqualToValue={(option, value) => option.branch_id === value.branch_id}
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
              onClick={handleAddLR}
              style={{ backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add a lorry receipt
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
            paginationMode="server"
            columns={columns}
            getRowId={(row) => row.id}
            rows={lrData.map((elm, key) => {
              return {
                ...elm,
                srNo: paginationModel.page * paginationModel.pageSize + key + 1
              }
            })}
            // sx={{
            //   backgroundColor: "transparent",
            //   '& .MuiDataGrid-columnHeadersInner': {
            //     backgroundColor: '#006699',
            //     color: '#ffffff'
            //   },
            // }}
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
            pageSize={10}
            rowsPerPageOptions={[10]}
          />
          <CustomPagination
            page={paginationModel.page}
            rowsPerPage={paginationModel.pageSize}
            count={pageState.total}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />

        </div>
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
            // onChange={(e) =>
            //   setEmailForm({ ...emailForm, message: e.target.value })
            onChange={handleMessageChange}
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

export default LorryReceipts;