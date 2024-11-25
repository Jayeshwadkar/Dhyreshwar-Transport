import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Autocomplete,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Alert, Stack } from "@mui/material";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import {
  getArticles,
  getPlaces,
  getRateMaster,
  selectIsLoading,
  updateRateMaster,
} from "./slice/rateMasterSlice";
import { validateNumber } from "../../../../services/utils";

const initialState = {
  customer: null,
  customerName: "",
  rates: [],
  article: "",
  station: null,
  rate: "",
  ddCharges: "",
};

const initialErrorState = {
  customer: {
    invalid: false,
    message: "",
  },
  rates: {
    invalid: false,
    message: "",
  },
  rate: {
    invalid: false,
    message: "",
  },
  article: {
    invalid: false,
    message: "",
  },
  station: {
    invalid: false,
    message: "",
  },
};

const EditRateMaster = () => {
  const columns = [
    { field: "_id", headerName: "Id" },
    { field: "article", headerName: "Article", flex: 1 },
    { field: "stationName", headerName: "Station", flex: 1 },
    { field: "rate", headerName: "Rate", flex: 1 },
    { field: "ddCharges", headerName: "DD charges", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          e.stopPropagation();
          return setEditId(params.row._id);
        };

        return (
          <>
            <IconButton size="small" onClick={triggerEdit} color="primary">
              <EditIcon />
            </IconButton>

            {/* <IconButton size="small" onClick={triggerDelete} color="error">
              <DeleteIcon />
            </IconButton> */}
          </>
        );
      },
    },
  ];
  const dispatch = useDispatch();

  const location = useLocation();
  const { rateMasterId } = location.state;
  const [rateList, setRateList] = useState(initialState);
  const [places, setPlaces] = useState([]);
  const [articles, setArticles] = useState([]);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [editId, setEditId] = useState("");
  const isLoading = useSelector(selectIsLoading);

  const navigate = useNavigate();

  const goToRateMasterList = useCallback(() => {
    navigate("/master/rateMasterList");
  }, [navigate]);

  useEffect(() => {
    if (rateMasterId && places?.length) {
      dispatch(getRateMaster(rateMasterId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setRateList((currState) => {
              const rates = payload?.data.rates?.map?.((rate) => {
                const station = places?.find?.(
                  (place) => place._id === rate.station
                );
                return {
                  ...rate,
                  station: station,
                  stationName: station.name,
                };
              });
              return {
                ...currState,
                ...payload?.data,
                rates: rates,
              };
            });
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [rateMasterId, places]);

  useEffect(() => {
    dispatch(getPlaces())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          const updatedPlaces = payload?.data?.map?.((place) => {
            return {
              ...place,
              label: place.name,
              value: place.name,
            };
          });
          setPlaces(updatedPlaces);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });

    dispatch(getArticles())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          const updatedArticles = payload?.data?.map?.((article) => {
            return { ...article, label: article.name, value: article.name };
          });
          setArticles(updatedArticles);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  }, []);

  useEffect(() => {
    if (editId) {
      const filterEdited = rateList.rates?.filter?.((rate) => {
        if (rate.id) {
          return rate.id === editId;
        }
        if (rate._id) {
          return rate._id === editId;
        }
      });
      let station;
      if (filterEdited?.length) {
        station = places?.find?.(
          (place) => place._id === filterEdited[0].station._id
        );
      }
      setRateList((currState) => {
        return {
          ...currState,
          rates: currState.rates?.filter?.((rate) => rate.id !== editId),
          article: filterEdited[0].article,
          station: station,
          stationName: station.name,
          rate: filterEdited[0].rate,
          ddCharges: filterEdited[0].ddCharges,
        };
      });
    }
  }, [editId, places]);

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setRateList((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(rateList)) {
      const updatedRateList = rateList;
      updatedRateList.rates?.forEach?.((rate) => {
        if (rate.station && rate.station._id && rate.station.name) {
          rate.stationName = rate.station.name;
          rate.station = rate.station._id;
        }
        delete rate._id;
      });
      dispatch(updateRateMaster(updatedRateList))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setRateList(initialState);
            goToRateMasterList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const backButtonHandler = () => {
    goToRateMasterList();
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.customer) {
      errors.customer = { invalid: true, message: "Customer is required" };
    }
    if (!formData.rates?.length) {
      errors.rates = {
        invalid: true,
        message: "At least one entry is required",
      };
    }
    let validationErrors = false;
    for (const key in errors) {
      if (errors[key].invalid === true) {
        validationErrors = true;
      }
    }
    if (validationErrors) {
      setFormErrors(errors);
    }
    return validationErrors;
  };

  const customerChangeListener = (e, option, name) => {
    setRateList((currState) => {
      return {
        ...currState,
        [name]: option,
        customerName: option?.name || "",
      };
    });
  };

  const articleChangeListener = (e, option) => {
    setRateList((currState) => {
      return {
        ...currState,
        article: option,
        articleName: option,
      };
    });
  };

  const stationChangeListener = (e, option) => {
    setRateList((currState) => {
      return {
        ...currState,
        station: option,
        stationName: option?.name,
      };
    });
  };

  const addUpdateButtonHandler = (e) => {
    e.preventDefault();
    const errors = { ...initialErrorState };
    if (!rateList.customer) {
      errors.customer = { invalid: true, message: "Customer is required" };
    } else {
      errors.customer = { invalid: false, message: "" };
    }
    if (!rateList.article) {
      errors.article = { invalid: true, message: "Article is required" };
    } else {
      errors.article = { invalid: false, message: "" };
    }
    if (!rateList.station || !rateList.station.name) {
      errors.station = { invalid: true, message: "Station is required" };
    } else {
      errors.station = { invalid: false, message: "" };
    }
    if (!rateList.rate || rateList.rate < 0) {
      errors.rate = { invalid: true, message: "Rate should be greater than 0" };
    } else {
      errors.rate = { invalid: false, message: "" };
    }

    let validationErrors = false;
    for (const key in errors) {
      if (errors[key].invalid === true) {
        validationErrors = true;
      }
    }
    if (validationErrors) {
      setFormErrors(errors);
    } else {
      if (!editId) {
        const rateListItem = {
          _id: Math.random(),
          article: rateList.article,
          station: rateList.station,
          stationName: rateList.station.name,
          rate: rateList.rate,
          ddCharges: rateList.ddCharges,
        };
        if (
          rateList.rates?.some?.(
            ({ station, article }) =>
              station === rateListItem.station &&
              article === rateListItem.article
          )
        ) {
          setHttpError("Already item exist.");
        } else {
          setRateList((currState) => {
            return {
              ...currState,
              rates: [...currState.rates, rateListItem],
              article: "",
              station: null,
              rate: "",
              ddCharges: "",
            };
          });
          setHttpError("");
        }
      } else {
        const filteredList = rateList.rates?.filter?.((item) => {
          if (item.id) {
            return item.id !== editId;
          }
          if (item._id) {
            return item._id !== editId;
          }
        });
        const rateListItem = {
          _id: Math.random(),
          article: rateList.article,
          station: rateList.station,
          stationName: rateList.station.name,
          rate: rateList.rate,
          ddCharges: rateList.ddCharges,
        };
        if (
          filteredList?.some?.(
            ({ station, article }) =>
              station === rateListItem.station &&
              article === rateListItem.article
          )
        ) {
          setHttpError("Already item exist.");
        } else {
          setRateList((currState) => {
            return {
              ...currState,
              rates: [...filteredList, rateListItem],
              article: "",
              station: null,
              rate: "",
              ddCharges: "",
            };
          });
          setEditId("");
          setHttpError("");
        }
      }
    }
  };

  const cancelResetButtonHandler = (e) => {
    e.preventDefault();
    setRateList((currState) => {
      return {
        ...currState,
        article: "",
        station: null,
        rate: "",
        ddCharges: "",
      };
    });
    setEditId("");
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Edit rates</h1>
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
        {!isLoading && (
          <div>
            <form action="" onSubmit={submitHandler}>
              <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
                <div className="grid grid-6-col">
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.customer.invalid}>
                      <Autocomplete
                        disablePortal
                        autoSelect
                        size="small"
                        name="customer"
                        options={[]}
                        value={rateList.customerName}
                        onChange={(e, value) =>
                          customerChangeListener(e, value, "customer")
                        }
                        disabled={true}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Customer"
                            error={formErrors.customer.invalid}
                            fullWidth
                          />
                        )}
                      />
                      {formErrors.customer.invalid && (
                        <FormHelperText>
                          {formErrors.customer.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                </div>
                <Divider className="mb10" />
                <div className="grid grid-6-col">
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.article.invalid}>
                      <Autocomplete
                        autoSelect
                        size="small"
                        name="article"
                        options={articles?.map?.((article) => article.name)}
                        value={rateList.article}
                        onChange={(e, value) => articleChangeListener(e, value)}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Article"
                            error={formErrors.article.invalid}
                            fullWidth
                          />
                        )}
                      />
                      {formErrors.article.invalid && (
                        <FormHelperText>
                          {formErrors.article.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.station.invalid}>
                      <Autocomplete
                        autoSelect
                        size="small"
                        name="place"
                        options={places || []}
                        value={rateList.station}
                        onChange={(e, value) => stationChangeListener(e, value)}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Station"
                            error={formErrors.station.invalid}
                            fullWidth
                          />
                        )}
                      />
                      {formErrors.station.invalid && (
                        <FormHelperText>
                          {formErrors.station.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.rate.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Rate"
                        value={rateList.rate || ""}
                        onChange={inputChangeHandler}
                        onInput={validateNumber}
                        name="rate"
                        id="rate"
                        error={formErrors.rate.invalid}
                      />
                      {formErrors.rate.invalid && (
                        <FormHelperText>
                          {formErrors.rate.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="DD charges"
                        value={rateList.ddCharges || ""}
                        onChange={inputChangeHandler}
                        onInput={validateNumber}
                        name="ddCharges"
                        id="ddCharges"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <Button
                      type="button"
                      variant="outlined"
                      size="medium"
                      onClick={addUpdateButtonHandler}
                    >
                      {editId ? "Update" : "Add"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      size="medium"
                      className="ml6"
                      onClick={cancelResetButtonHandler}
                    >
                      {editId ? "Cancel" : "Reset"}
                    </Button>
                  </div>
                </div>
              </Paper>
              <div style={{ width: "100%", marginBottom: "20px" }}>
                {formErrors.rates.invalid && (
                  <div>
                    <FormHelperText className="error">
                      {formErrors.rates.message}
                    </FormHelperText>
                  </div>
                )}
                <DataGrid
                  sx={{ backgroundColor: "primary.contrastText" }}
                  autoHeight
                  density="compact"
                  getRowId={(row) => row?._id || Math.random()}
                  rows={rateList.rates}
                  columns={columns}
                  initialState={{
                    ...columns,
                    columns: {
                      columnVisibilityModel: {
                        _id: false,
                      },
                    },
                  }}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  disableSelectionOnClick
                />
              </div>
              <div className="right">
                <Button
                  type="button"
                  variant="outlined"
                  size="medium"
                  onClick={backButtonHandler}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  type="submit"
                  color="primary"
                  className="ml6"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default EditRateMaster;
