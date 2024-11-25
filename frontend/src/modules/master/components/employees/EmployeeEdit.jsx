import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Autocomplete,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  emailRegEx,
  mobileNoRegEx,
  validatePhoneNumber,
} from "../../../../services/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmployee,
  selectIsLoading,
  updateEmployee,
} from "./slice/employeeSlice";

const initialEmployeeState = {
  code: "",
  employee_name: "",
  corresp_address: "",
  permanat_address: "",
  date_of_birth: null,
  telephone: "",
  mobileno: "",
  emailid: "",
  joining_date: null,
  qualification: "",
  blood_group: "",
  designation: "",
};

const initialErrorState = {
  name: {
    invalid: false,
    message: "",
  },
  address: {
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
  email: {
    invalid: false,
    message: "",
  },
};

const EmployeeEdit = () => {
  const [employee, setEmployee] = useState(initialEmployeeState);
  const [fetchedEmployee, setFetchedEmployee] = useState(initialEmployeeState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const isLoading = useSelector(selectIsLoading);

  const location = useLocation();
  const { employeeId } = location.state;
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const goToEmployeeList = useCallback(() => {
    navigate("/master/employees");
  }, [navigate]);

  useEffect(() => {
    if (employeeId && employeeId !== "") {
      dispatch(getEmployee(employeeId))
        .then(({ payload = {} }) => {
          const { message, date_of_birth, joining_date } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            if (date_of_birth) {
              payload.data.date_of_birth = dayjs(date_of_birth);
            }
            if (joining_date) {
              payload.data.joining_date = dayjs(joining_date);
            }
            setEmployee(payload?.data);
            setFetchedEmployee(payload?.data);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [employeeId]);

  const resetButtonHandler = () => {
    setEmployee(fetchedEmployee);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setEmployee((currState) => {
      return {
        ...currState,
        [name]: name === "employee_name" ? value.toUpperCase() : value
      };
    });
  };
  const autocompleteChangeListener = (value, name) => {
    setEmployee((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };
  const dateInputChangeHandler = (name, date) => {
    setEmployee((currState) => {
      return {
        ...currState,
        [name]: date,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(employee)) {
      dispatch(updateEmployee(employee))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setEmployee(payload?.data);
            goToEmployeeList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const cancelButtonHandler = () => {
    goToEmployeeList();
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.employee_name?.trim?.()) {
      errors.name = { invalid: true, message: "Name is required" };
    }
    if (
      formData.mobileno?.trim?.() !== "" &&
      !mobileNoRegEx.test(formData.mobileno)
    ) {
      errors.mobile = { invalid: true, message: "Mobile number is invalid" };
    } else if (!formData.mobileno) {
      errors.mobile = { invalid: true, message: "Mobile is required" };
    }
    if (formData.emailid !== "" && !emailRegEx.test(formData.emailid)) {
      errors.email = { invalid: true, message: "Email is invalid" };
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
        <h1 className="pageHead">Edit an employee</h1>
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
        <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
          <form action="" onSubmit={submitHandler}>
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.name.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Name"
                    error={formErrors.name.invalid}
                    value={employee.employee_name}
                    onChange={inputChangeHandler}
                    name="employee_name"
                    id="name"
                  />
                  {formErrors.name.invalid && (
                    <FormHelperText>{formErrors.name.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.address.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Correspondence address"
                    error={formErrors.address.invalid}
                    value={employee.corresp_address}
                    onChange={inputChangeHandler}
                    name="corresp_address"
                    id="correspondenceAddress"
                  />
                  {formErrors.address.invalid && (
                    <FormHelperText>
                      {formErrors.address.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Permenant address"
                    value={employee.permanat_address}
                    onChange={inputChangeHandler}
                    name="permanat_address"
                    id="permanentAddress"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of birth"
                      inputFormat="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      value={employee.date_of_birth}
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
                <FormControl fullWidth error={formErrors.mobile.invalid}>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Mobile no."
                    error={formErrors.mobile.invalid}
                    value={employee.mobileno}
                    onChange={inputChangeHandler}
                    onInput={validatePhoneNumber}
                    name="mobileno"
                    id="mobile"
                  />
                  {formErrors.mobile.invalid && (
                    <FormHelperText>{formErrors.mobile.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.email.invalid}>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Email"
                    error={formErrors.email.invalid}
                    value={employee.emailid}
                    onChange={inputChangeHandler}
                    name="emailid"
                    id="email"
                  />
                  {formErrors.email.invalid && (
                    <FormHelperText>{formErrors.email.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Joining date"
                      inputFormat="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      value={employee.joining_date}
                      disableFuture={true}
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
                <FormControl fullWidth>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Qualification"
                    value={employee.qualification}
                    onChange={inputChangeHandler}
                    name="qualification"
                    id="qualification"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="blood_group"
                    options={["A-", "B-", "AB-", "O-", "A+", "B+", "AB+", "O+"]}
                    value={employee.blood_group}
                    onChange={(e, value) =>
                      autocompleteChangeListener(value, "blood_group")
                    }
                    getOptionLabel={(option) => option}
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
                    variant="outlined"
                    size="small"
                    label="Designation"
                    value={employee.designation}
                    onChange={inputChangeHandler}
                    name="designation"
                    id="designation"
                  />
                </FormControl>
              </div>
            </div>
            <div className="right">
              <Button
                variant="outlined"
                size="medium"
                onClick={cancelButtonHandler}
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
          </form>
        </Paper>
      </div>
    </>
  );
};

export default EmployeeEdit;
