import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  debounce,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  InputLabel,
  DialogActions,
  Autocomplete,
  Slide,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import {
  SendEmail,
  LoadingSpinner,
  Dialog as CustomDialog,
} from "../../../../ui-controls";
import {
  base64ToObjectURL,
  downloadFile,
  getFormattedDate,
  getFormattedLSNumber,
  // isSuperAdminOrAdmin,
} from "../../../../services/utils";
import {
  getBillsByBranch,
  getBillsBySearch,
  getBranches,
  deleteBill as removeBill,
  downloadBill,
  selectIsLoading,
} from "./slice/billSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";
import { getemail } from "../lorry-receipts/slice/lorryReceiptSlice";

let filterData = "";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const BillList = () => {
  const user = useSelector((state) => state.user);
  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  const isUser = () => user.type.toLowerCase() === 'user';
  const columns = [
    { field: "id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    {
      field: "bill_no",
      headerName: "Bill no.",
      flex: 1,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };
        return <Button style={{ color: 'blue' }} size="small" onClick={triggerEdit} color="primary" disabled={!write}>
          {params.row.bill_no}
        </Button>;
      },
    },
    {
      field: "bill_date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "customer_name",
      headerName: "Customer",
      flex: 1,
    },
    {
      field: "tot_amount",
      headerName: "Bill amount",
      flex: 1,
      renderCell: (params) => {
        return <strong>₹ {parseFloat(params.row.tot_amount).toFixed(2)}</strong>;
      },
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const triggerView = (e) => {
          e.stopPropagation();
          setViewBill({ ...params.row, download: false });
        };

        const triggerDownload = (e) => {
          e.stopPropagation();
          setViewBill({ ...params.row, download: true });
        };

        const triggerEmail = (e) => {
          e.stopPropagation();
          setIsOpenEmail(true);
          setSelectedBill({ ...params.row });
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteBill(params.row.id);
        };

        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.id);
        };

        const handlemail = async (id, bill_no) => {
          setLoading(true)
          fetchfilename(id, bill_no)
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
            <IconButton disabled={!write || params.row.paymentCollection && params.row.paymentCollection.length} size="small" onClick={triggerEdit}
              color="primary"
              style={{ color: !write ? '#d4d4d4' : "black" }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handlemail(params.row.id, params.row.bill_no)} size="small" color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <MailOutlinedIcon />
            </IconButton>
            {
              isUser() ? null :
                <IconButton size="small" disabled={!write || params.row.paymentCollection && params.row.paymentCollection.length}
                  onClick={triggerDelete}
                  style={{ color: !write ? '#d4d4d4' : "red" }}>
                  <DeleteIcon />
                </IconButton>
            }
          </>
        );
      },
    },
  ];
  const dispatch = useDispatch();

  const isLoading = useSelector(selectIsLoading);
  const users = useSelector((state) => state.user.permissions.Accounts.RouteBill);
  const [write, setWrite] = useState(false);
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [viewBill, setViewBill] = useState(null);
  const [isOpenEmail, setIsOpenEmail] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [isSearch, setSearch] = useState(false);
  const [billsData, setBillsData] = useState([])
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setSnackColour] = useState("")
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [email, setEmail] = useState([])
  const [Isloading, setIsloading] = useState(false)
  const [emailForm, setEmailForm] = useState({
    id: "",
    toEmail: "",
    message: "",
  });

  useEffect(() => {
    filterData = "";
  }, []);
  useEffect(() => {
    if (users.write) {
      setWrite(true)
    }
  }, [user]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });

  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
  });
  const [isloading, setLoading] = useState(false);
  const { search: searchData } = useSelector(({ bill }) => bill);
  const apiRef = useGridApiRef();

  const fetchfilename = async (id, bill_no) => {
    try {
      setIsloading(true);
      // const result = await dispatch(
      //   downloadBill({
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
      //   // console.log(payload?.data)
      //   const fileURL = payload?.data.bill_no;

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
        message: `Please find the attached file: ${bill_no}`,
      });
      setOpenEmailModal(true)
    } catch (error) {
      console.log("Error:", error);
      // setHttpError(error.message);
    } finally {
      setLoading(false);
    }
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
      setLoading(true);
      setOpenEmailModal(false)
      const result = await dispatch(
        downloadBill({
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
      setLoading(false);
      fetchemail()
    }

  }


  useLayoutEffect(() => {
    const menuItem = document.querySelector("li a[href='/transactions/billList']");

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
  }, []);

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
    dispatch(getBillsByBranch(requestObject))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          if (payload?.data?.bills) {
            setBillsData(payload.data.bills)
            setPageState((currState) => {
              return {
                ...currState,
                isLoading: false,
                total: payload?.data.count,
              };
            });
            setLoading(false)
          }
        }
        setSearch(false);
      })
      .catch((error) => {
        setSearch(false);
        setHttpError(error.message);
      });
  };

  // Search 
  const searchDataBill = () => {
    setLoading(true)
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
    dispatch(getBillsBySearch(requestObject))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          if (payload?.data?.bills) {
            setBillsData(payload.data.bills)
            setPageState((currState) => {
              return {
                ...currState,
                isLoading: false,
                total: payload?.data.count,
              };
            });
          }
        }
        setSearch(false);
        setLoading(false)
      })
      .catch((error) => {
        setSearch(false);
        setHttpError(error.message);
      });
  };

  const handleChange = (event, newValue) => {
    const newemail = newValue.emailid
    setEmailForm({ ...emailForm, toEmail: newemail });
  };

  const handleInputChange = (event, newInputValue) => {
    setEmailForm({ ...emailForm, toEmail: newInputValue });
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
        searchDataBill();
      }

      if (!isSuperAdminOrAdmin()) {
        searchDataBill();
      }
    }
  }, [isSearch, paginationModel]);

  useEffect(() => {
    if (viewBill && viewBill.id) {
      setLoading(true)
      dispatch(downloadBill({ id: viewBill.id, email: "" }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            if (payload?.data.file) {
              const fileURL = base64ToObjectURL(payload?.data.file);
              const name = viewBill.bill_no + ".pdf";
              if (viewBill.download) {
                downloadFile(fileURL, name);
              } else {
                window.open(fileURL, "_blank");
              }
            }
          }
          setViewBill(null);
          setLoading(false)
        })
        .catch((error) => {
          setHttpError(error.message);
          setViewBill(null);
        });
    }
  }, [viewBill]);
  console.log("selectedBranch", selectedBranch)
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

  const deleteBill = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(removeBill(selectedId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            // setHttpError(message);
            setConfirmationopen(true)
            setConfirmmessage(message)
            setSnackColour(message.includes("Bill Deleted Successfully") ? 'success' : 'error')
          }
          setIsDialogOpen(false);
          fetchData();
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleAddBill = () => {
    navigate("/transactions/billList/addBill", {
      state: selectedBranch,
    });
  };

  const navigateToEdit = (id) => {
    navigate("/transactions/billList/editBill", { state: { billId: id } });
  };

  useEffect(() => {
    if (sendEmail && emailAddress && selectedBill) {
      setIsOpenEmail(false);
      dispatch(downloadBill({ id: selectedBill._id, email: emailAddress }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          }
          setSendEmail(false);
          setSelectedBill(null);
        })
        .catch((error) => {
          setHttpError(error.message);
          setSelectedBill(null);
        });
    }
  }, [sendEmail, emailAddress, selectedBill]);

  const handleSendEmail = (email) => {
    setSendEmail(true);
    setEmailAddress(email);
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
      {(isloading || isLoading) && <LoadingSpinner />}
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
          <h1 className="pageHead">Bills</h1>
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
                  value={selectedBranch}
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
              onClick={handleAddBill}
              style={{ backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add a bill
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
            rows={billsData.map((bill, key) => {
              return {
                ...bill,
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
        <CustomSnackbar
          open={isConfirmationopen}
          message={confirmmessage}
          onClose={() => setConfirmationopen(false)}
          color={snackColour}
        />
        <SendEmail
          isOpen={isOpenEmail}
          setIsOpen={setIsOpenEmail}
          handleEmailClose={() => {
            setIsOpenEmail(false);
            setSelectedBill(null);
          }}
          handleSendEmail={(email) => handleSendEmail(email)}
          contentBody=""
        />
      </div>
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
          <InputLabel htmlFor="message-input">Text</InputLabel>
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

export default BillList;
