import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Autocomplete,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LoadingSpinner from "@ui-controls/LoadingSpinner";
import { useDispatch, useSelector } from "react-redux";
import {
  getAcknowledgeById,
  selectIsLoading,
  updateLorryReceiptAck,
} from "./slice-old/acknowledgeSlice";
import { getFormattedLSNumber } from "../../../../services/utils";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

const initialState = {
  lrNo: "",
  deliveryDate: null,
  unloadDate: null,
  unloadBranch: null,
  loadingSlip: { lsNo: "" },
  unloadTo: null,
  deliveryType: "",
  payType: "",
  toBilled: "",
  closeReason: "",
  close: "",
  collectAt: "",
  total: "",
  eWayBillNo: "",
  id: "",
};

const initialErrorState = {
  deliveryDate: {
    invalid: false,
    message: "",
  },
  unloadDate: {
    invalid: false,
    message: "",
  },
  unloadTo: {
    invalid: false,
    message: "",
  },
};
const DELIVERY_TYPES = [
  { label: "Door", value: 0 },
  { label: "Godown", value: 1 },
  { label: "Office", value: 2 },
];
const LRAcknowledgementEdit = () => {
  // const isLoading = useSelector(selectIsLoading);
  const [isLoading, setIsLoading] = useState(false);

  // const { branches } = useSelector(({ acknowledge }) => acknowledge);
  const [lorryReceipt, setLorryReceipt] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [isClosed, setClosed] = useState(false);
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setSnackColour] = useState("")

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const { lrId, branches } = location.state;

  const goToLRAcknowledgement = useCallback(() => {
    navigate("/transactions/lrAcknowledgement");
  }, [navigate]);

  useEffect(() => {
    if (lrId && !lorryReceipt.id) {
      setIsLoading(true);
      dispatch(getAcknowledgeById(lrId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setLorryReceipt((currState) => {
              return {
                ...currState,
                ...(payload?.data || {}),
                collectAt: branches?.find?.(
                  ({ branch_id }) => {
                    return branch_id == payload?.data.collectAt;
                  }
                ),
                unloadBranch: branches.filter((b) => b.branch_id == payload?.data.unloadBranch)?.[0],
                unloadTo: DELIVERY_TYPES?.[Number(payload?.data?.unloadTo)] || null
              };
            });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          setHttpError(error.message);
        });
    }
  }, [lrId, lorryReceipt._id]);

  useEffect(() => {
    if (!lorryReceipt.unloadDate || !lorryReceipt.unloadTo) {
      setClosed(true);
      setLorryReceipt((currState) => {
        return {
          ...currState,
          deliveryDate: null,
          close: false,
          closeReason: "",
        };
      });
    } else {
      setClosed(false);
    }
  }, [lorryReceipt.unloadDate, lorryReceipt.unloadTo]);

  const backButtonHandler = () => {
    goToLRAcknowledgement();
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(lorryReceipt)) {
      const updatedLR = lorryReceipt;
      setIsLoading(true);
      if (updatedLR.unloadTo) {
        updatedLR.unloadTo = updatedLR.unloadTo?.value;
      }

      dispatch(updateLorryReceiptAck(updatedLR))
        .then(({ payload = {} }) => {
          const { message } = payload?.data?.[0] || {};
          console.log(payload)
          if (message) {
            // setHttpError(message);
            setConfirmationopen(true)
            setConfirmmessage(message)
            setSnackColour('success')
            setTimeout(() => {
              goToLRAcknowledgement();
            }, 1000)
          } else {
            setHttpError("");
            setFormErrors(initialErrorState);
            goToLRAcknowledgement();
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };

    if (!formData.unloadDate) {
      errors.unloadDate = {
        invalid: true,
        message: "Unload date is required",
      };
    }
    if (!formData.unloadTo) {
      errors.unloadTo = {
        invalid: true,
        message: "Unload to is required",
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

  const dateInputChangeHandler = (name, date) => {
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
  };

  const autocompleteChangeListener = (e, option, name) => {
    console.log(name, option)
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const checkboxChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.checked;
    if (value) {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          [name]: value,
        };
      });
      return
    }
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: value,
        closeReason: ""
      };
    });
  };

  const clearDate = (name) => {
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: null,
      };
    });
  };


  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Edit a lorry receipt acknowledgement</h1>
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
        <form action="" onSubmit={submitHandler}>
          <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Lorry receipt no"
                    value={lorryReceipt.lrNo}
                    name="lrNo"
                    id="lrNo"
                    inputProps={{ readOnly: true }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Way bill no"
                    value={lorryReceipt.eWayBillNo}
                    name="eWayBillNo"
                    id="eWayBillNo"
                    inputProps={{ readOnly: true }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Loading slip no"
                    value={getFormattedLSNumber(
                      lorryReceipt.lsNo || ""
                    )}
                    name="lsNo"
                    id="lsNo"
                    inputProps={{ readOnly: true }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="unloadTo"
                    options={DELIVERY_TYPES || []}
                    value={lorryReceipt.unloadTo || null}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "unloadTo")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unload to"
                        fullWidth
                        error={formErrors.unloadTo.invalid}
                      />
                    )}
                  />
                  {formErrors.unloadTo.invalid && (
                    <FormHelperText>
                      {formErrors.unloadTo.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <div className="bl_date">
                  <FormControl fullWidth error={formErrors.unloadDate.invalid}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        error={formErrors.unloadDate.invalid}
                        label="Unload date"
                        inputFormat="DD/MM/YYYY"
                        value={lorryReceipt.unloadDate}
                        onChange={dateInputChangeHandler.bind(
                          null,
                          "unloadDate"
                        )}
                        inputProps={{
                          readOnly: true,
                        }}
                        renderInput={(params) => (
                          <TextField
                            name="unloadDate"
                            size="small"
                            {...params}
                            error={formErrors.unloadDate.invalid}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    {formErrors.unloadDate.invalid && (
                      <FormHelperText>
                        {formErrors.unloadDate.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <Button
                    variant="text"
                    size="medium"
                    className="clearHandler"
                    onClick={clearDate.bind(null, "unloadDate")}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="unloadBranch"
                    options={branches || []}
                    value={lorryReceipt.unloadBranch || null}
                    getOptionLabel={(branch) => branch.branch_name || ""}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "unloadBranch")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} label="Unload branch" fullWidth />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <div className="bl_date">
                  <FormControl
                    fullWidth
                    error={formErrors.deliveryDate.invalid}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        error={formErrors.deliveryDate.invalid}
                        label="Delivery date"
                        inputFormat="DD/MM/YYYY"
                        value={lorryReceipt.deliveryDate}
                        onChange={dateInputChangeHandler.bind(
                          null,
                          "deliveryDate"
                        )}
                        inputProps={{
                          readOnly: true,
                        }}
                        renderInput={(params) => (
                          <TextField
                            name="deliveryDate"
                            size="small"
                            {...params}
                            error={formErrors.deliveryDate.invalid}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    {formErrors.deliveryDate.invalid && (
                      <FormHelperText>
                        {formErrors.deliveryDate.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <Button
                    variant="text"
                    size="medium"
                    className="clearHandler"
                    onClick={clearDate.bind(null, "deliveryDate")}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Delivery place"
                    value={lorryReceipt.deliveryType}
                    name="deliveryType"
                    id="deliveryType"
                    inputProps={{
                      readOnly: true,
                    }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Receivable amount"
                    value={lorryReceipt.total}
                    name="total"
                    id="total"
                    onChange={inputChangeHandler}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          &#8377;
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Amount to be paid"
                    value={lorryReceipt.total}
                    name="toBePaid"
                    id="toBePaid"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          &#8377;
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <TextField
                    size="small"
                    variant="outlined"
                    name="payType"
                    label="Pay type"
                    value={lorryReceipt.payType}
                    inputProps={{ readOnly: true }}
                    onChange={inputChangeHandler}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <TextField
                    size="small"
                    variant="outlined"
                    name="toBilled"
                    label="To billed"
                    value={lorryReceipt.toBilled}
                    inputProps={{ readOnly: true }}
                    onChange={inputChangeHandler}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    id="collectAt"
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    className="multi-select"
                    size="small"
                    name="collectAt"
                    options={branches || []}
                    value={lorryReceipt.collectAt}
                    getOptionLabel={(option) => option.branch_name || ""}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "collectAt")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="collectAt"
                        label=""
                        fullWidth
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControlLabel
                  label="Close"
                  control={
                    <Checkbox
                      name="close"
                      disabled={isClosed}
                      checked={lorryReceipt.close}
                      onChange={checkboxChangeHandler}
                    />
                  }
                />
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Closing reason"
                    value={lorryReceipt.closeReason}
                    name="closeReason"
                    id="closeReason"
                    InputProps={{
                      disabled: !lorryReceipt.close,
                    }}
                    onChange={inputChangeHandler}
                  />
                </FormControl>
              </div>
            </div>
            <div className="right">
              <Button
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
          </Paper>
        </form>
      </div>
      <CustomSnackbar
        open={isConfirmationopen}
        message={confirmmessage}
        onClose={() => setConfirmationopen(false)}
        color={snackColour}
      />
    </>
  );
};

export default LRAcknowledgementEdit;
