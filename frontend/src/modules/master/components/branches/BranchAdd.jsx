import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useDispatch, useSelector } from "react-redux";
import { createBranch, getPlaces, selectIsLoading } from "./slice/branchSlice";
import { validateNumber } from "../../../../services/utils";

const initialBranchState = {
  branchCode: "",
  abbreviation: "",
  name: "",
  description: "",
  place: "",
  balanceType: null,
  openingBalance: "",
};

const initialErrorState = {
  branchCode: {
    invalid: false,
    message: "",
  },
  abbreviation: {
    invalid: false,
    message: "",
  },
  name: {
    invalid: false,
    message: "",
  },
  place: {
    invalid: false,
    message: "",
  },
};

const BranchAdd = () => {
  const [branch, setBranch] = useState(initialBranchState);
  // const [places, setPlaces] = useState();
  const { places } = useSelector(({ branch }) => branch);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);

  const goToBranchList = useCallback(() => {
    navigate("/master/branches");
  }, [navigate]);

  useEffect(() => {
    dispatch(getPlaces())
    console.log(places)
    // .then(({ payload = {} }) => {
    //   const { message } = payload?.data || {};
    //   if (message) {
    //     setHttpError(message);
    //   } else {
    //     setPlaces(payload?.data);
    //   }
    // })
    // .catch((error) => {
    //   setHttpError(error.message);
    // });
  }, []);


  const resetButtonHandler = () => {
    setBranch(initialBranchState);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const backButtonHandler = () => {
    goToBranchList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setBranch((currState) => {
      return {
        ...currState,
        [name]: name === "name" ? value.toUpperCase() : value
      };
    });
  };
  const autocompleteChangeListener = (e, value) => {
    console.log(value)
    setBranch((currState) => {
      return {
        ...currState,
        place: value,
      };
    });
  };

  const autocompleteType = (e, value) => {
    setBranch((currState) => {
      return {
        ...currState,
        balanceType: value,
      };
    });
  };
  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(branch)) {
      dispatch(createBranch({ ...branch, place: branch.place?.value }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message.includes("Already Exists!")) {
            setHttpError(message);
          } else {
            setHttpError("");
            setBranch(initialBranchState);
            goToBranchList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.abbreviation?.trim?.()) {
      errors.abbreviation = {
        invalid: true,
        message: "Abbreviation is required",
      };
    }
    if (!formData.name?.trim?.()) {
      errors.name = { invalid: true, message: "Branch name is required" };
    }
    if (!formData.place) {
      errors.place = { invalid: true, message: "Place is required" };
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
      <h1 className="pageHead">Add a branch</h1>
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
      <div className="inner-wrap">
        <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
          <form action="" onSubmit={submitHandler}>
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.branchCode.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Branch code"
                    value={branch.branchCode}
                    onChange={inputChangeHandler}
                    name="branchCode"
                    id="branchCode"
                    error={formErrors.branchCode.invalid}
                  />
                  {formErrors.branchCode.invalid && (
                    <FormHelperText>
                      {formErrors.branchCode.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.abbreviation.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Abbreviation"
                    error={formErrors.abbreviation.invalid}
                    value={branch.abbreviation}
                    onChange={inputChangeHandler}
                    name="abbreviation"
                    id="abbreviation"
                  />
                  {formErrors.abbreviation.invalid && (
                    <FormHelperText>
                      {formErrors.abbreviation.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.name.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Name"
                    error={formErrors.name.invalid}
                    value={branch.name}
                    onChange={inputChangeHandler}
                    name="name"
                    id="name"
                  />
                  {formErrors.name.invalid && (
                    <FormHelperText>{formErrors.name.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Description"
                    value={branch.description}
                    onChange={inputChangeHandler}
                    name="description"
                    id="description"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.place.invalid}
                >
                  <Autocomplete
                    disablePortal
                    size="small"
                    name="place"
                    options={places || []}
                    value={branch.place || null}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value)
                    }
                    openOnFocus
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Place"
                        error={formErrors.place.invalid}
                        fullWidth
                      />
                    )}
                  />
                  {formErrors.place.invalid && (
                    <FormHelperText>{formErrors.place.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Opening balance"
                    value={branch.openingBalance}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="openingBalance"
                    id="openingBalance"
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <Autocomplete
                    autoSelect
                    size="small"
                    name="balanceType"
                    options={["Credit", "Debit"]}
                    value={branch.balanceType || null}
                    onChange={(e, value) => autocompleteType(e, value)}
                    openOnFocus
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                      <TextField {...params} label="Balance type" fullWidth />
                    )}
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
          </form>
        </Paper>
      </div>
    </>
  );
};

export default BranchAdd;
