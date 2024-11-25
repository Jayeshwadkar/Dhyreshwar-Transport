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
import { useDispatch, useSelector } from "react-redux";
import {
  getVehicleType,
  selectIsLoading,
  updateVehicleType,
} from "./slice/vehicleTypeSlice";
import { LoadingSpinner } from "../../../../ui-controls";
import { validateNumber } from "../../../../services/utils";

const initialState = {
  vehicle_type: "",
  tyre_qty: "",
};

const initialErrorState = {
  type: {
    invalid: false,
    message: "",
  },
  tyreQuantity: {
    invalid: false,
    message: "",
  },
};

const VehicleTypeEdit = () => {
  const [vehicleType, setVehicleType] = useState(initialState);
  const [fetchedVehicleType, setFetchedVehicleType] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleTypeId } = location.state;
  const isLoading = useSelector(selectIsLoading);

  const goToVehicleTypesList = useCallback(() => {
    navigate("/master/vehicleTypes");
  }, [navigate]);

  useEffect(() => {
    dispatch(getVehicleType(vehicleTypeId))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          setVehicleType(payload?.data);
          setFetchedVehicleType(payload?.data);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  }, [vehicleTypeId]);

  const resetButtonHandler = () => {
    setVehicleType(fetchedVehicleType);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const cancelButtonHandler = () => {
    goToVehicleTypesList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setVehicleType((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(vehicleType)) {
      dispatch(updateVehicleType(vehicleType))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setVehicleType(payload?.data);
            setFetchedVehicleType(payload?.data);
            goToVehicleTypesList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.vehicle_type?.trim?.()) {
      errors.type = { invalid: true, message: "Vehicle type is required" };
    }
    if (isNaN(formData.tyre_qty)) {
      errors.tyreQuantity = {
        invalid: true,
        message: "Tyre quantity should be a number",
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

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <h1 className="pageHead">Edit a vehicle type</h1>
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
                <FormControl fullWidth error={formErrors.type.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Vehicle type"
                    value={vehicleType.vehicle_type}
                    error={formErrors.type.invalid}
                    onChange={inputChangeHandler}
                    name="vehicle_type"
                    id="type"
                  />
                  {formErrors.type.invalid && (
                    <FormHelperText>{formErrors.type.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.tyreQuantity.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Tyre quantity"
                    value={vehicleType.tyre_qty || ""}
                    error={formErrors.tyreQuantity.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="tyre_qty"
                    id="tyreQuantity"
                  />
                  {formErrors.tyreQuantity.invalid && (
                    <FormHelperText>
                      {formErrors.tyreQuantity.message}
                    </FormHelperText>
                  )}
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

export default VehicleTypeEdit;
