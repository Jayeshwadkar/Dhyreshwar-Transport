import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Autocomplete,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLRAck,
  getChallanAck,
  selectIsLoading,
  updateLorryReceiptAck,
} from "./slice/acknowledgeSlice";

const initialState = {
  lrNo: null,
  deliveryDate: new Date(),
};

const initialErrorState = {
  lrNo: {
    invalid: false,
    message: "",
  },
  deliveryDate: {
    invalid: false,
    message: "",
  },
};

const LRAcknowledgementAdd = () => {
  const isLoading = useSelector(selectIsLoading);
  const { state } = useLocation();
  const [lorryReceipt, setLorryReceipt] = useState(initialState);
  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [getUpdatedLR, setGetUpdatedLR] = useState(true);
  const [challanNo, setChallanNo] = useState("");
  const [isLocalMemo, setIsLocalMemo] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const ref = useRef(null);

  const goToLRAcknowledgement = useCallback(() => {
    navigate("/transactions/lrAcknowledgement");
  }, [navigate]);

  useEffect(() => {
    if (getUpdatedLR) {
      let query = {};
      if (state) {
        query = { branch: state };
      }
      dispatch(getAllLRAck(query))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            const updatedList = payload?.data?.map?.((lr) => {              
              return {
                ...lr,
                label: lr.lrNo,
                value: lr.lrNo,
              };
            });
            setLorryReceipts(updatedList);
            setGetUpdatedLR(false);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [getUpdatedLR]);

  const backButtonHandler = () => {
    goToLRAcknowledgement();
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(lorryReceipt)) {
      const updatedLR = {
        _id: lorryReceipt.lrNo._id,
        deliveryDate: lorryReceipt.deliveryDate,
      };
      dispatch(updateLorryReceiptAck(updatedLR))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setFormErrors(initialErrorState);
            setLorryReceipt(initialState);
            setChallanNo("");
            setGetUpdatedLR(true);
            goToLRAcknowledgement();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const onSelect = (e, value) => {
    const option = lorryReceipts?.find?.(
      ({ label }) =>
        value?.toLowerCase?.()?.trim?.() === label?.toLowerCase?.()?.trim?.()
    );
    if (option) {
      if (!lorryReceipt.isPrevented) {
        e.preventDefault();
        e.stopPropagation();
      }
      setLorryReceipt((currState) => {
        return {
          ...currState,
          lrNo: option,
          isPrevented: true,
        };
      });
      if (option._id) {
        dispatch(getChallanAck(option._id))
          .then(({ payload = {} }) => {
            setChallanNo(payload?.data?.lsNo || "");
          })
          .catch((error) => {
            setHttpError(error.message);
          });
      }
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };

    if (!formData.deliveryDate) {
      errors.deliveryDate = {
        invalid: true,
        message: "Delivery date is required",
      };
    }
    if (!formData.lrNo) {
      errors.lrNo = {
        invalid: true,
        message: "LR no is required",
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

  const clearDate = (name) => {
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: null,
      };
    });
  };

  const autocompleteChangeListener = (e, option, name) => {
    e.preventDefault();
    setIsLocalMemo(option.localMemoNo)
    setLorryReceipt((currState) => {      
      return {
        ...currState,
        [name]: option,
      };
    });
    if (option._id) {
      dispatch(getChallanAck(option._id))
        .then(({ payload = {} }) => {
          setChallanNo(payload?.data?.lsNo || "");          
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Update a lorry receipt acknowledgement</h1>
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
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.lrNo.invalid}
                >
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="lrNo"
                    options={lorryReceipts || []}
                    value={lorryReceipt.lrNo}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "lrNo")
                    }
                    ref={ref}
                    openOnFocus
                    disableClearable
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{
                          ...params.inputProps,
                          onKeyDown: (e) => {
                            if (e.key === "Enter") {
                              onSelect(e, e.target.value);
                              e.stopPropagation();
                            }
                          },
                        }}
                        label="Lorry receipt no"
                        error={formErrors.lrNo.invalid}
                        fullWidth
                      />
                    )}
                  />
                  {formErrors.lrNo.invalid && (
                    <FormHelperText>{formErrors.lrNo.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Loading Slip no."
                    value={challanNo}
                    name="lsNo"
                    id="lsNo"
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
                    label="Local Memo"
                    value={isLocalMemo ? isLocalMemo : "N/A"}
                    name="localMemo"
                    id="localMemo"
                    inputProps={{
                      readOnly: true,
                    }}
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
              
            </div>
            <div className="right">
              
              <Button
                variant="contained"
                size="medium"
                type="submit"
                color="primary"
                
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={backButtonHandler}
                className="ml6"
              >
                Back
              </Button>
            </div>
          </Paper>
        </form>
      </div>
    </>
  );
};

export default LRAcknowledgementAdd;
