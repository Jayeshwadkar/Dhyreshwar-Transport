import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  debounce,
  InputAdornment,
  Snackbar,
  TextField,
} from "@mui/material";
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
  getSuppliersBySearch,getSuppliersByPage,
  deleteSupplier as removeSupplier,
  selectIsLoading,
  // setSearch,
} from "./slice/supplierSlice";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CustomPagination from "../../../../components/ui/CustomPagination";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

let filterData = "";

const SuppliersList = () => {
  const columns = [
    { field: "supplier_id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    { field: "name", headerName: "Name", flex: 1 },
    // { field: "type", headerName: "Type", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "phone", headerName: "Contact No", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.supplier_id);
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteSupplier(params.row.supplier_id);
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
  const user = useSelector((state) => state.user.permissions.Admin.Supplier);
  const apiRef = useGridApiRef();
  const { search } = useSelector(({ supplier }) => supplier);
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isUnauth, setIsUnauth] = useState(false);
  const isLoading = useSelector(selectIsLoading);
  const [isloading, setLoading] = useState(false);
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

  const fetchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize, filterData
    };

    dispatch(getSuppliersByPage({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setSuppliers(payload?.data.supplier);
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false)
      })
      .catch(() => {
        setSearch(false)
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

    dispatch(getSuppliersBySearch({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setSuppliers(payload?.data.supplier);
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false)
      })
      .catch(() => {
        setSearch(false)
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const updateSearchValue = useMemo(() => {
    return debounce((newValue) => {
      apiRef.current.setQuickFilterValues(
        newValue.split?.(" ")?.filter?.((word) => word !== "")
      );
    }, 500);
  }, [apiRef]);

  useEffect(() => {
    if (search && suppliers?.length) {
      setLoading(true);
      updateSearchValue(search);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [suppliers]);

  const onSearchChange = (e) => {
    updateSearchValue(e.target.value);
    dispatch(setSearch(e.target.value));
  };

  const handleAddSupplier = () => {
    navigate("/master/suppliers/addSupplier");
  };

  const navigateToEdit = (id) => {
    if (checkAuth("Admin", "Supplier", "write")) {
      navigate("/master/suppliers/editSupplier", { state: { supplierId: id } });
    } else {
      setIsUnauth(true);
    }
  };

  const deleteSupplier = (id) => {
    if (checkAuth("Admin", "Supplier", "write")) {
      setSelectedId(id);
      setIsDialogOpen(true);
    } else {
      setIsUnauth(true);
    }
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(removeSupplier(selectedId))
        .then(({ payload }) => {
          const message = payload.data?.[0]?.message
          setIsDialogOpen(false);
          setConfirmationopen(true)
          setConfirmmessage(message)
          if (message === "Supplier Delete Successfully") { setSnackColour('success') }
          else { setSnackColour('error') }
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

    if (filterData == "") {
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

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
        <div></div>
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
      {(isLoading || isloading) && <LoadingSpinner />}

      {isDialogOpen && (
        <Dialog
          isOpen={true}
          onClose={handleDialogClose}
          title="Are you sure?"
          content="Do you want to delete the supplier?"
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
          <h1 className="pageHead">Suppliers list</h1>
          <div className="page_actions">
            <Button
              variant="contained"
              size="small"
              type="button"
              color="primary"
              className="ml6"
              onClick={handleAddSupplier}
              style={{ backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add a supplier
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

        {<div style={{ width: "100%" }}>
          <DataGrid
            apiRef={apiRef}
            sx={{ backgroundColor: "primary.contrastText" }}
            autoHeight
            density="compact"
            getRowId={(row) => row.supplier_id}
            rows={suppliers.map((elm, key) => {
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
                  supplier_id: false,
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
            // disableColumnSelector
            disableDensitySelector
          />
        </div>}
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

export default SuppliersList;
