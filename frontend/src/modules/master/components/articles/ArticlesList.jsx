import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Snackbar,
  IconButton,
  Alert,
  Stack,
  InputBase,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { debounce } from "@mui/material/utils";
import { LoadingSpinner, Dialog } from "../../../../ui-controls";
import { checkAuth } from "../../../../router/RequireAuth";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteArticle as removeArticle,
  selectIsLoading,
  getBranches,
  getArticlesBySearch,
  getAllArticlesByPage
} from "./slice/articleSlice";
import CustomPagination from '../../../../components/ui/CustomPagination'
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

let filterData = "";

const ArticlesList = () => {
  const columns = [
    { field: "articles_id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    { field: "articles_name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return navigateToEdit(params.row.articles_id);
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteArticle(params.row.articles_id);
        };

        return (
          <>
            <IconButton size="small" onClick={triggerEdit} color="primary" style={{color: !write ? '#d4d4d4' : "black" }} disabled={!write}>
              <EditIcon />
            </IconButton>
            &nbsp;&nbsp;
            <IconButton size="small" onClick={triggerDelete} style={{color: !write ? '#d4d4d4' : "red" }} disabled={!write}>
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];
  const isLoading = useSelector(selectIsLoading);
  const { search } = useSelector(({ article }) => article);
  const user = useSelector((state) => state.user.permissions.Admin.Article);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isUnauth, setIsUnauth] = useState(false);
  const [isloading, setLoading] = useState(false);
  const apiRef = useGridApiRef();
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
   const [write, setWrite] = useState(false);
  useEffect(() => {
    filterData = "";
  }, []);
  useEffect(() => {
    console.log(user.read, user.write)
     if(user.write){
      console.log("user.write",user.write)
      setWrite(true)
    }
     
  }, [user]);
  const fetchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize
    };

    dispatch(getAllArticlesByPage({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setArticles(payload?.data.article);
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false)
      })
      .catch(() => {
        setSearch(false)
        setHttpError('Something went wrong! Please try later or contact Administrator.');
      });
  };

  const searchData = () => {
    const temp = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize, filterData
    };

    dispatch(getArticlesBySearch({ temp }))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setArticles(payload?.data.article);
          const total = payload?.data.total
          setPageState({ total: total })
        }
        setSearch(false)
      })
      .catch(() => {
        setSearch(false)
        setHttpError('Something went wrong! Please try later or contact Administrator.');
      });
  };

  useEffect(() => {
    if (!isSearch) {
      fetchData();
    }
  }, [paginationModel]);

  useEffect(() => {
    if (isSearch) {
      searchData();
    }
  }, [isSearch, paginationModel]);

  useEffect(() => {
    if (dispatch) {
      dispatch(getBranches());
    }
  }, [dispatch]);

  const updateSearchValue = useMemo(() => {
    return debounce((newValue) => {
      apiRef.current.setQuickFilterValues(
        newValue.split?.(" ")?.filter?.((word) => word !== "")
      );
    }, 500);
  }, [apiRef]);

  useEffect(() => {
    if (search && articles?.length) {
      setLoading(true);
      updateSearchValue(search);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [articles]);

  const handleAddArticle = () => {
    navigate("/master/articles/addArticle");
  };

  const navigateToEdit = (id) => {
    if (checkAuth("Admin", "Article", "write")) {
      navigate("/master/articles/editArticle", { state: { articleId: id } });
    } else {
      setIsUnauth(true);
    }
  };

  const deleteArticle = (id) => {
    if (checkAuth("Admin", "Article", "write")) {
      setSelectedId(id);
      setIsDialogOpen(true);
    } else {
      setIsUnauth(true);
    }
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(removeArticle(selectedId))
        .then(() => {
          setIsDialogOpen(false);
          setConfirmationopen(true)
          setConfirmmessage("Article Delete Successfully")
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
          {/* <TextField placeholder="Search…" inputProps={{ 'aria-label': 'search' }} style={{ width: '150px' }}
            value={searchModel}
            onChange={handleSearch}
          />  &nbsp;&nbsp;&nbsp;&nbsp; */}
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
          content="Do you want to delete the article?"
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
          <h1 className="pageHead">Article list</h1>
          <div className="page_actions">
            <Button
              variant="contained"
              size="small"
              type="button"
              color="primary"
              className="ml6"
              onClick={handleAddArticle}
              style={{backgroundColor: !write ? '#d4d4d4' : "black", }} disabled={!write}
            >
              Add an article
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
              getRowId={(row) => row.articles_id}
              rows={articles.map((elm, key) => {
                return {
                  ...elm,
                  srNo: paginationModel.page * paginationModel.pageSize + key + 1
                }
              })}
              columns={columns}
              hideFooter={true}
              components={{ Toolbar: CustomToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: false,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              initialState={{
                ...columns,
                columns: {
                  columnVisibilityModel: {
                    articles_id: false,
                  },
                },
              }}
              disableSelectionOnClick
              disableColumnFilter
              // disableColumnSelector
              disableDensitySelector

              filterMode="server"
              pageSize={10}
              rowsPerPageOptions={[10]}
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

export default ArticlesList;