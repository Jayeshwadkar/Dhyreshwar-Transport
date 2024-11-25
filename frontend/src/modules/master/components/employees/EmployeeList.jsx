import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  debounce,
  Snackbar,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { Alert, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getFormattedDate } from "../../../../services/utils";
import { checkAuth } from "../../../../router/RequireAuth";
import { Dialog, LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteEmployee,
  getEmployeesBySearch,
  selectIsLoading,
  getEmployeesByPage
} from "./slice/employeeSlice";
import CustomPagination from "../../../../components/ui/CustomPagination";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

let filterData = "";

const EmployeeList = () => {
  const columns = [
    { field: "emp_id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    { field: "employee_name", headerName: "Name", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    { field: "emailid", headerName: "Email Id", flex: 1 },
    {
      field: "joining_date",
      headerName: "Joining date",
      flex: 1,
    },
    { field: "mobileno", headerName: "Mobile no", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const onClick = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.emp_id);
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteBranch(params.row.emp_id);
        };

        return (
          <>
            <IconButton size="small" onClick={onClick} color="primary" style={{ color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
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
  const user = useSelector((state) => state.user.permissions.Admin.Employee);
  const apiRef = useGridApiRef();
  const { search } = useSelector(({ employee }) => employee);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  useEffect(() => {
    filterData = "";
  }, []);

  const fetchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize
    };

    dispatch(getEmployeesByPage({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setEmployees(
            payload?.data?.employee.map?.((employee) => ({
              ...employee,
              joining_date: employee.joining_date
                ? getFormattedDate(new Date(employee.joining_date))
                : "",
            }))
          );
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false);
      })
      .catch(() => {
        setSearch(false);
      });
  };


  const searchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize, filterData
    };

    dispatch(getEmployeesBySearch({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setEmployees(
            payload?.data?.employee.map?.((employee) => ({
              ...employee,
              joining_date: employee.joining_date
                ? getFormattedDate(new Date(employee.joining_date))
                : "",
            }))
          );
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false);
      })
      .catch(() => {
        setSearch(false);
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

  const updateSearchValue = useMemo(() => {
    return debounce((newValue) => {
      apiRef.current.setQuickFilterValues(
        newValue.split?.(" ")?.filter?.((word) => word !== "")
      );
    }, 500);
  }, [apiRef]);

  useEffect(() => {
    if (search && employees?.length) {
      setLoading(true);
      updateSearchValue(search);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [employees]);

  const handleAddEmployee = () => {
    navigate("/master/employees/addEmployee");
  };

  const navigateToEdit = (id) => {
    navigate("/master/employees/editEmployee", { state: { employeeId: id } });
  };

  const deleteBranch = (id) => {
    if (checkAuth("Admin", "Employee", "write")) {
      setSelectedId(id);
      setIsDialogOpen(true);
    } else {
      setIsUnauth(true);
    }
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(deleteEmployee(selectedId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setConfirmationopen(true)
            setConfirmmessage("Employee Delete Successfully")
            setSnackColour('success')
            fetchData();
          }
          setIsDialogOpen(false);
        })
        .catch((error) => {
          setHttpError(error.message);
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
          content="Do you want to delete the employee?"
          warning
        />
      )}
      <Snackbar
        open={isUnauth}
        autoHideDuration={6000}
        onClose={handleUnauthClose}
        message="You are not authorized to perform delete"
      />
      <div className="inner-wrap">
        <div className="page_head">
          <h1 className="pageHead">Employee list</h1>
          <div className="page_actions">
            <Button
              variant="contained"
              size="small"
              type="button"
              color="primary"
              className="ml6"
              onClick={handleAddEmployee}
              style={{ backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add an employee
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
              getRowId={(row) => row.emp_id}
              rows={employees.map((elm, key) => {
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
                    emp_id: false,
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

export default EmployeeList;
