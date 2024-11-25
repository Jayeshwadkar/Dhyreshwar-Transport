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
import { Alert, Stack } from "@mui/material";
import { LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import {
  getBranch,
  getPlaces,
  selectIsLoading,
  updateBranch,
} from "./slice/branchSlice";
import { validateNumber } from "../../../../services/utils";

const initialBranchState = {
  branch_code: "",
  branch_abbreviation: "",
  branch_name: "",
  description: "",
  place_id: "",
  opening_bal_type: null,
  opening_bal: "",
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

const BranchEdit = () => {
  const [branch, setBranch] = useState(initialBranchState);
  const { places } = useSelector(({ branch }) => branch);
  const [fetchedBranch, setFetchedBranch] = useState(initialBranchState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const isLoading = useSelector(selectIsLoading);

  const location = useLocation();
  const { branchId } = location.state;
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const goToBranchList = useCallback(() => {
    navigate("/master/branches");
  }, [navigate]);

  useEffect(() => {
    setBranch({
      ...fetchedBranch,
      place_id: places?.find?.(({ place_id }) => fetchedBranch?.place_id === place_id),
    });
  }, [fetchedBranch, places]);

  useEffect(() => {
    dispatch(getPlaces());
  }, []);

  useEffect(() => {
    if (branchId && branchId !== "") {
      dispatch(getBranch(branchId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setBranch(payload?.data);
            setFetchedBranch(payload?.data);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [branchId]);

  const resetButtonHandler = () => {
    const place = places?.find?.(({ place_id }) => fetchedBranch?.place_id === place_id);
    setBranch({ ...fetchedBranch, place_id: place });
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setBranch((currState) => {
      return {
        ...currState,
        [name]: name === "branch_name" ? value.toUpperCase() : value,
      };
    });
  };
  const autocompleteChangeListener = (e, value) => {
    setBranch((currState) => {
      return {
        ...currState,
        place_id: value,
      };
    });
  };

  const autocompleteType = (e, value) => {
    setBranch((currState) => {
      return {
        ...currState,
        opening_bal_type: value,
      };
    });
  };
  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(branch)) {
      dispatch(
        updateBranch({
          ...branch,
          place_id: branch.place_id?.place_id,
        })
      )
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
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
    if (!formData.branch_code?.trim?.()) {
      errors.branchCode = { invalid: true, message: "Branch code is required" };
    }
    if (!formData.branch_abbreviation?.trim?.()) {
      errors.abbreviation = {
        invalid: true,
        message: "Abbreviation is required",
      };
    }
    if (!formData.branch_name?.trim?.()) {
      errors.name = { invalid: true, message: "Branch name is required" };
    }
    if (!formData.place_id) {
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

  const cancelButtonHandler = () => {
    goToBranchList();
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <h1 className="pageHead">Edit a branch</h1>
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
              <FormControl fullWidth error={formErrors.branchCode.invalid}>
                <TextField
                  variant="outlined"
                  label="Branch code"
                  value={branch.branch_code}
                  onChange={inputChangeHandler}
                  name="branch_code"
                  id="branchCode"
                  size="small"
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
                  variant="outlined"
                  label="Abbreviation"
                  error={formErrors.abbreviation.invalid}
                  value={branch.branch_abbreviation}
                  onChange={inputChangeHandler}
                  name="branch_abbreviation"
                  id="abbreviation"
                  size="small"
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
                  variant="outlined"
                  label="Name"
                  error={formErrors.name.invalid}
                  value={branch.branch_name}
                  onChange={inputChangeHandler}
                  name="branch_name"
                  id="name"
                  size="small"
                />
                {formErrors.name.invalid && (
                  <FormHelperText>{formErrors.name.message}</FormHelperText>
                )}
              </FormControl>
            </div>
            <div className="grid-item">
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  label="Description"
                  value={branch.description}
                  onChange={inputChangeHandler}
                  name="description"
                  id="description"
                  size="small"
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
                  name="place_id"
                  options={places || []}
                  value={branch.place_id}
                  onChange={(e, value) => autocompleteChangeListener(e, value)}
                  openOnFocus
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
                  value={branch.opening_bal}
                  onChange={inputChangeHandler}
                  onInput={validateNumber}
                  name="opening_bal"
                  id="openingBalance"
                />
              </FormControl>
            </div>
            <div className="grid-item">
              <FormControl fullWidth size="small">
                <Autocomplete
                  autoSelect
                  size="small"
                  name="opening_bal_type"
                  options={["Credit", "Debit"]}
                  value={branch.opening_bal_type || null}
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
    </>
  );
};

export default BranchEdit;
