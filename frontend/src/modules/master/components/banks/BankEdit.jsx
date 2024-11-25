import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";

import {
  mobileNoRegEx,
  emailRegEx,
  validatePhoneNumber,
} from "../../../../services/utils";
import { useDispatch, useSelector } from "react-redux";
import { getBank, selectIsLoading, updateBank } from "./slice/bankSlice";
import { LoadingSpinner } from "../../../../ui-controls";



//bank_id, bank_name, branch_name, address, ifsc_code, micr_code, 
//telephone, emailid, branch_code, active

const initialState = {
  bank_name: "",
  branch_name: "",
  branch_code: "",
  address: "",
  ifsc_code: "",
  micr_code: "",
  telephone: "",
  emailid: "",
};

const initialErrorState = {
  name: {
    invalid: false,
    message: "",
  },
  branchName: {
    invalid: false,
    message: "",
  },
  branchCode: {
    invalid: false,
    message: "",
  },
  address: {
    invalid: false,
    message: "",
  },
  ifsc: {
    invalid: false,
    message: "",
  },
  micr: {
    invalid: false,
    message: "",
  },
  phone: {
    invalid: false,
    message: "",
  },
  email: {
    invalid: false,
    message: "",
  },
};

const BankEdit = () => {
  const [bank, setBank] = useState(initialState);
  const [fetchedBank, setFetchedBank] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const navigate = useNavigate();
  const location = useLocation();
  const { bankId } = location.state;

  const goToBankList = useCallback(() => {
    navigate("/master/banks");
  }, [navigate]);

  useEffect(() => {
    if (bankId) {
      dispatch(getBank(bankId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setBank(payload?.data);
            setFetchedBank(payload?.data);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [bankId]);

  const resetButtonHandler = () => {
    setBank(fetchedBank);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const backButtonHandler = () => {
    goToBankList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setBank((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(bank)) {
      dispatch(updateBank(bank))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setBank(initialState);
            goToBankList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.bank_name?.trim?.()) {
      errors.name = { invalid: true, message: "Bank name is required" };
    }

    if (!formData.ifsc_code?.trim?.()) {
      errors.ifsc = { invalid: true, message: "IFSC code is required" };
    }
    if (
      formData.telephone &&
      formData.telephone?.trim?.() !== "" &&
      !mobileNoRegEx.test(formData.telephone)
    ) {
      errors.phone = {
        invalid: true,
        message: "Phone should be 10 digits number",
      };
    }
    if (
      formData.emailid &&
      formData.emailid?.trim?.() !== "" &&
      !emailRegEx.test(formData.emailid)
    ) {
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

      <h1 className="pageHead">Edit a bank</h1>
      <div className="inner-wrap">
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
                    label="Bank name"
                    value={bank.bank_name}
                    error={formErrors.name.invalid}
                    onChange={inputChangeHandler}
                    name="bank_name"
                    id="name"
                  />
                  {formErrors.name.invalid && (
                    <FormHelperText>{formErrors.name.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.branchName.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Branch name"
                    value={bank.branch_name}
                    error={formErrors.branchName.invalid}
                    onChange={inputChangeHandler}
                    name="branch_name"
                    id="branchName"
                  />
                  {formErrors.branchName.invalid && (
                    <FormHelperText>
                      {formErrors.branchName.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.branchCode.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Branch code"
                    value={bank.branch_code}
                    error={formErrors.branchCode.invalid}
                    onChange={inputChangeHandler}
                    name="branch_code"
                    id="branchCode"
                  />
                  {formErrors.branchCode.invalid && (
                    <FormHelperText>
                      {formErrors.branchCode.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.address.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Address"
                    value={bank.address}
                    error={formErrors.address.invalid}
                    onChange={inputChangeHandler}
                    name="address"
                    id="address"
                  />
                  {formErrors.address.invalid && (
                    <FormHelperText>
                      {formErrors.address.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>

              <div className="grid-item">
                <FormControl fullWidth error={formErrors.ifsc.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="IFSC code"
                    value={bank.ifsc_code}
                    error={formErrors.ifsc.invalid}
                    onChange={inputChangeHandler}
                    name="ifsc_code"
                    id="ifsc"
                  />
                  {formErrors.ifsc.invalid && (
                    <FormHelperText>{formErrors.ifsc.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.micr.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="MICR code"
                    value={bank.micr_code}
                    error={formErrors.micr.invalid}
                    onChange={inputChangeHandler}
                    name="micr_code"
                    id="micr"
                  />
                  {formErrors.micr.invalid && (
                    <FormHelperText>{formErrors.micr.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.phone.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Phone"
                    value={bank.telephone}
                    error={formErrors.phone.invalid}
                    onChange={inputChangeHandler}
                    onInput={validatePhoneNumber}
                    name="telephone"
                    id="phone"
                  />
                  {formErrors.phone.invalid && (
                    <FormHelperText>{formErrors.phone.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.email.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Email"
                    value={bank.emailid}
                    error={formErrors.email.invalid}
                    onChange={inputChangeHandler}
                    name="emailid"
                    id="email"
                  />
                  {formErrors.email.invalid && (
                    <FormHelperText>{formErrors.email.message}</FormHelperText>
                  )}
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
          </form>
        </Paper>
      </div>
    </>
  );
};

export default BankEdit;
