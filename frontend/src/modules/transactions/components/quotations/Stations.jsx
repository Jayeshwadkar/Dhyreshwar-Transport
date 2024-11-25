import React, { useState } from "react";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import { validateNumber } from "../../../../services/utils";

const initialState = {
  station: null,
  amount: "",
  otherFieldValue: "",
};

const initialErrorState = {
  station: {
    invalid: false,
    message: "",
  },
  amount: {
    invalid: false,
    message: "",
  },
};
const Stations = ({ places, quotation, setQuotation }) => {
  const [station, setStation] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setStation((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const autocompleteChangeListener = (e, option, name) => {
    setStation((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(station)) {
      const prevStations = quotation.stations;
      const newStation = station;
      newStation.station = newStation.station.name;
      setQuotation((currState) => {
        return {
          ...currState,
          stations: [...prevStations, newStation],
        };
      });
      setStation(initialState);
      setFormErrors(initialErrorState);
    }
  };

  const resetButtonHandler = (e) => {
    e.preventDefault();
    setStation(initialState);
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.station) {
      errors.station = { invalid: true, message: "Station is required" };
    }
    if (!formData.amount?.trim?.()) {
      errors.amount = { invalid: true, message: "Amount is required" };
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
      <h2 className="mb20">Add Stations</h2>
      <form action="" onSubmit={submitHandler} id="stationForm">
        <div className="grid grid-6-col">
          <div className="grid-item">
            <FormControl
              fullWidth
              size="small"
              error={formErrors.station.invalid}
            >
              <Autocomplete
                disablePortal
                autoSelect
                size="small"
                name="station"
                options={places || []}
                value={station.station}
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
                <FormHelperText>{formErrors.station.message}</FormHelperText>
              )}
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl
              fullWidth
              size="small"
              error={formErrors.amount.invalid}
            >
              <TextField
                size="small"
                variant="outlined"
                label="Amount"
                error={formErrors.amount.invalid}
                value={station.amount || ""}
                onChange={inputChangeHandler}
                onInput={validateNumber}
                name="amount"
                id="amount"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">&#8377;</InputAdornment>
                  ),
                }}
              />

              {formErrors.amount.invalid && (
                <FormHelperText>{formErrors.amount.message}</FormHelperText>
              )}
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl fullWidth size="small">
              <TextField
                size="small"
                variant="outlined"
                label="Other field value"
                value={station.otherFieldValue || ""}
                onInput={validateNumber}
                onChange={inputChangeHandler}
                name="otherFieldValue"
                id="otherFieldValue"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">&#8377;</InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </div>
          <div className="grid-item">
            <Button
              variant="contained"
              size="medium"
              type="submit"
              color="primary"
              form="stationForm"
              className="ml6"
            >
              Add
            </Button>{" "}
            <Button
              variant="outlined"
              size="medium"
              onClick={resetButtonHandler}
              className="ml6"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
export default Stations;
