import React, { useEffect, useState } from "react";
import {
  Button,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import { Alert, Stack } from "@mui/material";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingSpinner, Dialog } from "../../../../ui-controls";
import { checkAuth } from "../../../../router/RequireAuth";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCustomer as removeCustomer,
  selectIsLoading,
  getBranches,
  getCustomersBySearch,
  downloadCustomer,
  getCustomersByPage
} from "./slice/customerSlice";
import FileSaver from "file-saver";
import CustomPagination from "../../../../components/ui/CustomPagination";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

let filterData = "";
const CustomersList = () => {
  const columns = [
    { field: "customer_id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    { field: "customer_name", headerName: "Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "emailid", headerName: "Email", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "gstno", headerName: "GST No", flex: 1 },
    { field: "telephoneno", headerName: "Contact No", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.customer_id);
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteCustomer(params.row.customer_id);
        };

        return (
          <>
            <IconButton size="small" onClick={triggerEdit} color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <EditIcon />
            </IconButton>
            &nbsp;&nbsp;
            <IconButton size="small" onClick={triggerDelete} style={{ color: !write ? '#d4d4d4' : "red" }} disabled={!write}>
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.permissions.Admin.Customers);
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUnauth, setIsUnauth] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const isLoading = useSelector(selectIsLoading);
  const [isSearch, setSearch] = useState(false);
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setSnackColour] = useState("error")

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [pageState, setPageState] = useState({
    total: 0,
  });
  // const [searchModel, setSearchModel] = useState(null);
  const [write, setWrite] = useState(false);

  useEffect(() => {
    console.log(user.read, user.write)
    if (user.write) {
      console.log("user.write", user.write)
      setWrite(true)
    }

  }, [user]);

  useEffect(() => {
    filterData = "";
  }, []);

  const fetchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize
    };

    dispatch(getCustomersByPage({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setCustomers(payload?.data.customer);
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false);
      })
      .catch(() => {
        setSearch(false);
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      });
  };

  const searchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize, filterData
    };

    dispatch(getCustomersBySearch({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setCustomers(payload?.data.customer);
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false);
      })
      .catch(() => {
        setSearch(false);
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      });
  };

  useEffect(() => {
    if (isSearch) {
      searchData();
    }
  }, [isSearch, paginationModel]);

  useEffect(() => {
    if (!isSearch) {
      fetchData();
    }
  }, [paginationModel]);


  useEffect(() => {
    dispatch(getBranches());
  }, []);



  const handleAddCustomer = () => {
    navigate("/master/customers/addCustomer");
  };

  const navigateToEdit = (id) => {
    if (checkAuth("Admin", "Customers", "write")) {
      navigate("/master/customers/editCustomer", { state: { customerId: id } });
    } else {
      setIsUnauth(true);
    }
  };

  const deleteCustomer = (id) => {
    if (checkAuth("Admin", "Customers", "write")) {
      setSelectedId(id);
      setIsDialogOpen(true);
    } else {
      setIsUnauth(true);
    }
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(removeCustomer(selectedId))
        .then(() => {
          setIsDialogOpen(false);
          setConfirmationopen(true)
          setConfirmmessage("Customer Delete Successfully")
          setSnackColour('success')
          fetchData();
        })
        .catch(() => {
          setHttpError(
            "Something went wrong! Please try later or contact Administrator."
          );
        });
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleUnauthClose = () => {
    setIsUnauth(false);
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

  const triggerDownload = (e) => {
    e.preventDefault();

    dispatch(downloadCustomer({ filterData }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          const blob = new Blob([payload?.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          FileSaver.saveAs(blob, "customers.xlsx");
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
        <div>
          <Button onClick={triggerDownload}>Download</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px' }}>
          <GridToolbarQuickFilter sx={{ marginTop: '5px' }} variant="outlined" size="small" quickFilterParser={onFilterChange} />  &nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={onFilterSubmit} type="button" variant="contained">Search</Button>
        </div>
      </GridToolbarContainer>
    );
  }

  const handleRowsPerPageChange = (event) => {
    setPaginationModel({
      ...paginationModel,
      pageSize: parseInt(event.target.value, 100),
      page: 0,
    });
  };

  const handlePageChange = (newPage) => {
    setPaginationModel({
      ...paginationModel,
      page: newPage,
    });
  };

  return (
    <>
      {(isLoading) && <LoadingSpinner />}

      {isDialogOpen && (
        <Dialog
          isOpen={true}
          onClose={handleDialogClose}
          title="Are you sure?"
          content="Do you want to delete the customer?"
          warning
        />
      )}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isUnauth}
        autoHideDuration={6000}
        onClose={handleUnauthClose}
      >
        <Alert severity="warning">
          You are not authorized to perform the action
        </Alert>
      </Snackbar>

      <div className="inner-wrap">
        <div className="page_head">
          <h1 className="pageHead">Customers list</h1>
          <div className="page_actions">
            <Button
              variant="contained"
              size="small"
              type="button"
              color="primary"
              className="ml6"
              onClick={handleAddCustomer}
              style={{ backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add a customer
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
        {
          <div style={{ width: "100%" }}>
            <DataGrid
              apiRef={apiRef}
              sx={{ backgroundColor: "primary.contrastText" }}
              autoHeight
              density="compact"
              getRowId={(row) => row.customer_id}
              rows={customers.map((elm, key) => {
                return {
                  ...elm,
                  srNo: paginationModel.page * paginationModel.pageSize + key + 1
                }
              })}
              columns={columns}
              hideFooter={true}
              initialState={{
                ...columns,
                columns: {
                  columnVisibilityModel: {
                    customer_id: false,
                  },
                },
              }}
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
              disableSelectionOnClick
              disableColumnFilter
              disableDensitySelector
            />
          </div>
        }
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
    </>
  );
};

export default CustomersList;
