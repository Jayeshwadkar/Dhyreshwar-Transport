import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Alert, Stack } from "@mui/material";

import { mobileNoRegEx, validatePhoneNumber } from "../../../../services/utils";
import { LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import { getDriver, selectIsLoading, updateDriver } from "./slice/driverSlice";

const initialState = {
  driver_name: "",
  corresp_address: "",
  permanat_address: "",
  date_of_birth: null,
  telephoneno: "",
  mobile: "",
  father_name: "",
  referenceby: "",
  eyesight: "",
  licenseno: "",
  license_type: "",
  qualification: "",
  joining_date: null,
  blood_group: "",
  renewdate: null,
  expiry: null,
  remarks: "",
};

const initialErrorState = {
  name: {
    invalid: false,
    message: "",
  },
  correspondenceAddress: {
    invalid: false,
    message: "",
  },
  telephone: {
    invalid: false,
    message: "",
  },
  mobile: {
    invalid: false,
    message: "",
  },
  licenseNo: {
    invalid: false,
    message: "",
  },
};

const DriverEdit = () => {
  const [driver, setDriver] = useState(initialState);
  const [fetchedDriver, setFetchedDriver] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { driverId } = location.state;
  const isLoading = useSelector(selectIsLoading);

  const goToDriversList = useCallback(() => {
    navigate("/master/drivers");
  }, [navigate]);

  useEffect(() => {
    if (driverId !== "") {
      dispatch(getDriver(driverId))
        .then(({ payload = {} }) => {
          const { message, date_of_birth, joining_date, renewdate, expiry } =
            payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            if (date_of_birth && dayjs(date_of_birth).isValid()) {             
              payload.data.date_of_birth = dayjs(date_of_birth);
            } else {
              payload.data.date_of_birth = null
            }
            
            if (joining_date && dayjs(joining_date).isValid()) {             
              payload.data.joining_date = dayjs(joining_date);
            } else {
              payload.data.joining_date = null
            }

            if (renewdate && dayjs(renewdate).isValid()) {             
              payload.data.renewdate = dayjs(renewdate);
            } else {
              payload.data.renewdate = null
            }

            if (expiry && dayjs(expiry).isValid()) {             
              payload.data.expiry = dayjs(expiry);
            } else {
              payload.data.expiry = null
            }
            
            // if (expiry) {
            //   payload.data.expiry = dayjs(expiry);
            // }
            setDriver(payload?.data);
            setFetchedDriver(payload?.data);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [driverId]);

  const resetButtonHandler = () => {
    setDriver(fetchedDriver);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const backButtonHandler = () => {
    goToDriversList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setDriver((currState) => {
      return {
        ...currState,
        [name]: name === "driver_name" ? value.toUpperCase() : value
      };
    });
  };
  const autocompleteChangeListener = (value, name) => {
    setDriver((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };
  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(driver)) {
      const updatedDriver = driver;
      if (updatedDriver.date_of_birth) {
        updatedDriver.date_of_birth = new Date(updatedDriver.date_of_birth);
      }
      if (updatedDriver.joining_date) {
        updatedDriver.joining_date = new Date(updatedDriver.joining_date);
      }
      if (updatedDriver.renewdate) {
        updatedDriver.renewdate = new Date(updatedDriver.renewdate);
      }
      if (updatedDriver.expiry) {
        updatedDriver.expiry = new Date(updatedDriver.expiry);
      }
      dispatch(updateDriver(updatedDriver))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setDriver(initialState);
            goToDriversList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const dateInputChangeHandler = (name, date) => {
    setDriver((currState) => {
      return {
        ...currState,
        [name]: date,
      };
    });
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.driver_name?.trim?.()) {
      errors.name = { invalid: true, message: "Name is required" };
    }
    
    if (!formData.licenseno?.trim?.()) {
      errors.licenseNo = { invalid: true, message: "License no is required" };
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

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Edit a driver</h1>
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
                <FormControl fullWidth error={formErrors.name.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Driver name"
                    value={driver.driver_name}
                    error={formErrors.name.invalid}
                    onChange={inputChangeHandler}
                    name="driver_name"
                    id="name"
                  />
                  {formErrors.name.invalid && (
                    <FormHelperText>{formErrors.name.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl
                  fullWidth
                  error={formErrors.correspondenceAddress.invalid}
                >
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Correspondence address"
                    value={driver.corresp_address}
                    error={formErrors.correspondenceAddress.invalid}
                    onChange={inputChangeHandler}
                    name="corresp_address"
                    id="correspondenceAddress"
                  />
                  {formErrors.correspondenceAddress.invalid && (
                    <FormHelperText>
                      {formErrors.correspondenceAddress.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Permanent address"
                    value={driver.permanat_address}
                    onChange={inputChangeHandler}
                    name="permanat_address"
                    id="permanentAddress"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of birth"
                      inputFormat="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      value={driver.date_of_birth}
                      disableFuture={true}
                      onChange={dateInputChangeHandler.bind(
                        null,
                        "date_of_birth"
                      )}
                      renderInput={(params) => (
                        <TextField
                          name="date_of_birth"
                          size="small"
                          {...params}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.telephone.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Phone"
                    value={driver.telephoneno}
                    error={formErrors.telephone.invalid}
                    onChange={inputChangeHandler}
                    onInput={validatePhoneNumber}
                    name="telephoneno"
                    id="telephone"
                  />
                  {formErrors.telephone.invalid && (
                    <FormHelperText>
                      {formErrors.telephone.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Father name"
                    value={driver.father_name}
                    onChange={inputChangeHandler}
                    name="father_name"
                    id="fatherName"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Referenced by"
                    value={driver.referenceby}
                    onChange={inputChangeHandler}
                    name="referenceby"
                    id="referencedBy"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="eyesight"
                    getOptionLabel={(option) => option}
                    options={["Normal", "Good"]}
                    value={driver.eyesight}
                    onChange={(e, value) =>
                      autocompleteChangeListener(value, "eyesight")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} label="Eyesight" fullWidth />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.licenseNo.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="License no"
                    value={driver.licenseno}
                    error={formErrors.licenseNo.invalid}
                    onChange={inputChangeHandler}
                    name="licenseno"
                    id="licenseNo"
                  />
                  {formErrors.licenseNo.invalid && (
                    <FormHelperText>
                      {formErrors.licenseNo.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="license_type"
                    options={["Higher heavy", "Heavy", "Non-heavy", "Normal"]}
                    value={driver.license_type}
                    onChange={(e, value) =>
                      autocompleteChangeListener(value, "license_type")
                    }
                    getOptionLabel={(option) => option}
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} label="License type" fullWidth />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Renew date"
                      inputFormat="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      value={driver.renewdate}
                      onChange={dateInputChangeHandler.bind(null, "renewdate")}
                      renderInput={(params) => (
                        <TextField name="renewdate" size="small" {...params} />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Expiry date"
                      inputFormat="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      value={driver.expiry}
                      onChange={dateInputChangeHandler.bind(null, "expiry")}
                      renderInput={(params) => (
                        <TextField name="expiry" size="small" {...params} />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Qualification"
                    value={driver.qualification}
                    onChange={inputChangeHandler}
                    name="qualification"
                    id="qualification"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Joining date"
                      inputFormat="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      value={driver.joining_date}
                      onChange={dateInputChangeHandler.bind(
                        null,
                        "joining_date"
                      )}
                      renderInput={(params) => (
                        <TextField
                          name="joining_date"
                          size="small"
                          {...params}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="blood_group"
                    options={["A-", "B-", "AB-", "O-", "A+", "B+", "AB+", "O+"]}
                    value={driver.blood_group}
                    getOptionLabel={(option) => option}
                    onChange={(e, value) =>
                      autocompleteChangeListener(value, "blood_group")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField {...params} label="Blood group" fullWidth />
                    )}
                  />
                </FormControl>
              </div>

              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Remark"
                    value={driver.remarks}
                    onChange={inputChangeHandler}
                    name="remarks"
                    id="remark"
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
                variant="outlined"
                size="medium"
                onClick={resetButtonHandler}
                className="ml6"
              >
                Reset
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
    </>
  );
};

export default DriverEdit;
