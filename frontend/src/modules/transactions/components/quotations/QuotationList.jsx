import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridToolbarContainer,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  IconButton,
  Alert,
  Stack,
  Button,
  debounce,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";

import {
  LoadingSpinner,
  Dialog as CustomDialog,
  SendEmail,
} from "../../../../ui-controls";
import {
  getFormattedLSNumber,
  getFormattedDate,
  base64ToObjectURL,
  downloadFile,
  pad,
} from "../../../../services/utils";
import {
  getQuotations,
  deleteQuotation as removeQuotation,
  downloadQuotation,
  selectIsLoading,
  getPlaces,
  setSearch,
} from "./slice/quotationSlice";
import SearchOutlined from "@mui/icons-material/SearchOutlined";

const QuotationList = () => {
  const columns = [
    { field: "_id", headerName: "Id" },
    {
      field: "quotationNo",
      headerName: "Quotation no.",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const triggerView = (e) => {
          e.stopPropagation();
          setViewQuotation({ ...params.row, download: false });
        };

        const triggerDownload = (e) => {
          e.stopPropagation();
          setViewQuotation({ ...params.row, download: true });
        };

        const triggerEmail = (e) => {
          e.stopPropagation();
          setIsOpenEmail(true);
          setSelectedQuotation({ ...params.row });
        };

        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteQuotation(params.row._id);
        };

        const triggerEdit = (e) => {
          e.stopPropagation();
          navigate("/transactions/quotations/editQuotation", {
            state: { quotationId: params.row._id },
          });
        };

        return (
          <>
            <IconButton size="small" onClick={triggerView} color="primary">
              <VisibilityIcon />
            </IconButton>
            <IconButton size="small" onClick={triggerDownload} color="primary">
              <DownloadIcon />
            </IconButton>
            <IconButton size="small" onClick={triggerEmail} color="primary">
              <EmailIcon />
            </IconButton>
            <IconButton size="small" onClick={triggerEdit} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={triggerDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];
  const dispatch = useDispatch();
  const apiRef = useGridApiRef();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);
  const { search } = useSelector(({ quotation }) => quotation);
  const [quotations, setQuotations] = useState([]);
  const [httpError, setHttpError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [viewQuotation, setViewQuotation] = useState(null);
  const [isOpenEmail, setIsOpenEmail] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isloading, setLoading] = useState(false);

  const fetchData = () => {
    dispatch(getQuotations())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setQuotations(
            payload?.data?.map?.((quot) => ({
              ...quot,
              date: getFormattedDate(new Date(quot.date)),
              quotationNo: getFormattedLSNumber(quot.quotationNo),
              customer: quot.customer?.name
                ? quot.customer.name
                : quot.customer,
            }))
          );
        }
      })
      .catch(() => {
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      });
  };
  useEffect(() => {
    fetchData();
    dispatch(getPlaces());
  }, []);

  const updateSearchValue = useMemo(() => {
    return debounce((newValue) => {
      apiRef.current.setQuickFilterValues(
        newValue.split?.(" ")?.filter?.((word) => word !== "")
      );
    }, 500);
  }, [apiRef]);

  useEffect(() => {
    if (search && quotations?.length) {
      setLoading(true);
      updateSearchValue(search);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [quotations]);

  const onSearchChange = (e) => {
    updateSearchValue(e.target.value);
    dispatch(setSearch(e.target.value));
  };

  useEffect(() => {
    if (viewQuotation && viewQuotation._id) {
      dispatch(downloadQuotation({ id: viewQuotation._id, email: "" }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            if (payload?.data.file) {
              const selectedQuotation = quotations?.find?.(
                (quotation) => quotation._id === viewQuotation._id
              );
              const name = pad(selectedQuotation.quotationNo, 6) + ".pdf";
              const fileURL = base64ToObjectURL(payload?.data.file);

              if (viewQuotation.download) {
                downloadFile(fileURL, name);
              } else {
                window.open(fileURL, "_blank");
              }
            }
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [viewQuotation]);

  const deleteQuotation = (id) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (e) => {
    if (e.target.value === "true") {
      dispatch(removeQuotation(selectedId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            fetchData();
            setIsDialogOpen(false);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleAddQuotation = () => {
    navigate("/transactions/quotations/addQuotation");
  };

  useEffect(() => {
    if (sendEmail && emailAddress && selectedQuotation) {
      setIsOpenEmail(false);
      dispatch(
        downloadQuotation({ id: selectedQuotation._id, email: emailAddress })
      )
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          }
          setSendEmail(false);
          setSelectedQuotation(null);
        })
        .catch((error) => {
          setHttpError(error.message);
          setSelectedQuotation(null);
        });
    }
  }, [sendEmail, emailAddress, selectedQuotation]);

  const handleSendEmail = (email) => {
    setSendEmail(true);
    setEmailAddress(email);
  };

  return (
    <>
      {(isLoading || isloading) && <LoadingSpinner />}
      <div className="inner-wrap">
        {isDialogOpen && (
          <CustomDialog
            isOpen={true}
            onClose={handleDialogClose}
            title="Are you sure?"
            content="Do you want to delete the quotation"
            warning
          />
        )}

        <div className="page_head">
          <h1 className="pageHead">Quotations</h1>
          <div className="page_actions">
            <Button
              variant="contained"
              size="small"
              type="button"
              color="primary"
              className="ml6"
              onClick={handleAddQuotation}
            >
              Add a quotation
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
            apiRef={apiRef}
            sx={{ backgroundColor: "primary.contrastText" }}
            autoHeight
            density="compact"
            getRowId={(row) => row._id}
            rows={quotations}
            columns={columns}
            initialState={{
              ...columns,
              columns: {
                columnVisibilityModel: {
                  _id: false,
                },
              },
            }}
            components={{
              Toolbar: () => (
                <GridToolbarContainer
                  sx={{
                    gap: "6px",
                    mb: "10px",
                    justifyContent: "end",
                    border: "none",
                  }}
                >
                  <TextField
                    variant="standard"
                    placeholder="Search..."
                    autoFocus={!!search}
                    onChange={onSearchChange}
                    value={search}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />
                </GridToolbarContainer>
              ),
            }}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
          />
        </div>
        <SendEmail
          isOpen={isOpenEmail}
          setIsOpen={setIsOpenEmail}
          handleEmailClose={() => {
            setIsOpenEmail(false);
            setSelectedQuotation(null);
          }}
          handleSendEmail={(email) => handleSendEmail(email)}
          contentBody=""
        />
      </div>
    </>
  );
};
export default QuotationList;
