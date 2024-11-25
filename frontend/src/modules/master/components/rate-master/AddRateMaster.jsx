import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import {
  createRateMaster,
  getArticles,
  getCustomersForRateMaster,
  getPlaces,
  selectIsLoading,
} from "./slice/rateMasterSlice";
import { validateNumber } from "../../../../services/utils";

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

const AddRateMaster = () => {
  const initialState = {
    customer: null,
    customerName: "",
    rates: [],
    article: "",
    station: null,
    rate: "",
    ddCharges: "",
  };
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
        const triggerDelete = (e) => {
          e.stopPropagation();
          return deleteRate(params.row._id);
        };

        return (
          <>
            <IconButton size="small" onClick={triggerDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];
  const [rateList, setRateList] = useState(initialState);
  const [customers, setCustomers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [articles, setArticles] = useState([]);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const isLoading = useSelector(selectIsLoading);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToRateMasterList = useCallback(() => {
    navigate("/master/rateMasterList");
  }, [navigate]);

  const deleteRate = (id) => {
    const updatedRates = rateList.rates?.filter?.((rate) => rate._id !== id);
    setRateList((currState) => {
      return {
        ...currState,
        rates: updatedRates,
      };
    });
  };

  useEffect(() => {
    dispatch(getPlaces())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          const updatedPlaces = payload?.data?.map?.((place) => {
            return { ...place, label: place.name, value: place.name };
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

    dispatch(getCustomersForRateMaster())
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          const updatedResponse = payload?.data?.map?.((customer) => {
            return {
              ...customer,
              label: customer.name,
              value: customer.name,
            };
          });
          setCustomers(updatedResponse);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  }, []);

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
      updatedRateList.customer = updatedRateList.customer._id;
      updatedRateList.rates?.forEach?.((rate) => {
        rate.station = rate.station._id;
        delete rate._id;
      });

      dispatch(createRateMaster(updatedRateList))
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
      };
    });
  };

  const autocompleteChangeListener = (e, option, name) => {
    setRateList((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  const addButtonHandler = (e) => {
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
    if (!rateList.station) {
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
            station === rateListItem.station && article === rateListItem.article
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
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Add rate master</h1>
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
                        options={customers || []}
                        value={rateList.customer}
                        onChange={(e, value) =>
                          customerChangeListener(e, value, "customer")
                        }
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
                        value={rateList.article || null}
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
                        onChange={(e, value) =>
                          autocompleteChangeListener(e, value, "station")
                        }
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
                      onClick={addButtonHandler}
                    >
                      Add
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

export default AddRateMaster;
