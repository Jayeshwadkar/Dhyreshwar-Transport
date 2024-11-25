import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Autocomplete,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { Alert, Stack } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LoadingSpinner } from "../../../../ui-controls";

import TaxDetailForm from "../taxes/TaxDetailForm";
import TaxDetailList from "../taxes/TaxDetailList";
import { useDispatch, useSelector } from "react-redux";
import {
  getSuppliers,
  getVehicle,
  getVehicleTypes,
  selectIsLoading,
  updateVehicle,
  getVehicleTaxDetails
} from "./slice/vehicleSlice";

const initialState = {
  owner: "",
  vehicleType: "",
  vehicleno: "",
  make: "",
  capacity: "",
  reg_date: null,
  vehicleexpdate : null,
  chasisno: "",
  engineno: "",
  description: "",
  taxDetails: [],
  pucexpdate: null,
  body: "",
  pucno: "",
};

const initialErrorState = {
  owner: {
    invalid: false,
    message: "",
  },
  vehicleType: {
    invalid: false,
    message: "",
  },
  vehicleNo: {
    invalid: false,
    message: "",
  },
  taxDetails: {
    invalid: false,
    message: "",
  },
};

const VehicleAdd = () => {
  const { suppliers, vehicleTypes } = useSelector(({ vehicle }) => vehicle);
  const [vehicle, setVehicle] = useState(initialState);
  const [taxDetails, setTaxDetails] = useState([])
  const [fetchedVehicle, setFetchedVehicle] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [editTax, setEditTax] = useState(null);
  const isLoading = useSelector(selectIsLoading);

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId } = location.state;

  const goToVehiclesList = useCallback(() => {
    navigate("/master/vehicles");
  }, [navigate]);

  useEffect(() => {
    setVehicle({
      ...fetchedVehicle,
      owner: suppliers?.find?.(({ supplier_id }) => fetchedVehicle?.owner === supplier_id),
      vehicleType: vehicleTypes?.find?.(
        ({ vt_id }) => fetchedVehicle?.vehicleType === vt_id
      ),
    });
  }, [suppliers, fetchedVehicle, vehicleTypes]);

  useEffect(() => {
    if (vehicleId) {
      dispatch(getVehicle(vehicleId))
        .then(({ payload = {} }) => {
          const { message, reg_date } = payload?.data?.vehicle || {};
          if (message) {
            setHttpError(message);
          } else {
            if (reg_date) {
              payload.data.reg_date = dayjs(reg_date);
            }
            setVehicle(payload?.data?.vehicle);
            setFetchedVehicle(payload?.data?.vehicle);
            setTaxDetails(payload?.data?.tax_details)
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [vehicleId]);

  useEffect(() => {
    dispatch(getSuppliers());
  }, []);

  useEffect(() => {
    dispatch(getVehicleTypes());
  }, []);

  const resetButtonHandler = () => {
    setVehicle({
      ...fetchedVehicle,
      owner: suppliers?.find?.(({ supplier_id }) => fetchedVehicle?.owner === supplier_id),
      vehicleType: vehicleTypes?.find?.(
        ({ vt_id }) => fetchedVehicle?.vehicleType === vt_id
      ),
    });
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const backButtonHandler = () => {
    goToVehiclesList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setVehicle((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const autocompleteChangeListener = (value, name) => {
    setVehicle((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const dateInputChangeHandler = (name, date) => {
    setVehicle((currState) => {
      return {
        ...currState,
        [name]: date,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(vehicle)) {
      dispatch(
        updateVehicle({
          ...vehicle,
          owner: vehicle?.owner?.supplier_id,
          vehicleType: vehicle?.vehicleType?.vt_id,
          taxDetails: taxDetails
        })
      )
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setVehicle(initialState);
            goToVehiclesList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };

    if (!formData.vehicleno?.trim?.()) {
      errors.vehicleNo = {
        invalid: true,
        message: "Vehicle number is required",
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

  // const handleOnTaxDetailAdd = (receivedTaxDetail) => {
  //   if (!editTax) {
  //     setVehicle((currentState) => {
  //       const currentVehicle = { ...currentState };
  //       currentVehicle.taxDetails?.push?.(receivedTaxDetail);
  //       return currentVehicle;
  //     });
  //   } else {
  //     const editedTaxDetail = { ...editTax };
  //     const updatedReceivedTaxDetail = { ...receivedTaxDetail };
  //     delete updatedReceivedTaxDetail.index;
  //     setVehicle((currentState) => {
  //       const currentVehicle = { ...currentState };
  //       const currentVehicleTaxDetails = [...currentState.taxDetails];
  //       currentVehicleTaxDetails[editedTaxDetail.index] = {
  //         ...updatedReceivedTaxDetail,
  //       };
  //       currentVehicle.taxDetails = [...currentVehicleTaxDetails];
  //       return currentVehicle;
  //     });
  //     setEditTax(null);
  //   }
  // };

  const handleOnTaxDetailAdd = (receivedTaxDetail) => {
    if (!editTax) {
      setTaxDetails((prev) => [...prev, receivedTaxDetail])
    } else {
      const editedTaxDetail = { ...editTax };
      const updatedReceivedTaxDetail = { ...receivedTaxDetail };
      delete updatedReceivedTaxDetail.index;
      setTaxDetails((currentState) => {
        const currentVehicleTaxDetails = [...currentState];
        currentVehicleTaxDetails[editedTaxDetail.index] = {
          ...updatedReceivedTaxDetail,
        };
        return currentVehicleTaxDetails;
      });
      setEditTax(null);
    }
  }

  // const handleTriggerEdit = (index) => {
  //   setEditTax({ ...vehicle.taxDetails[index], index: index });
  // };

  const handleTriggerEdit = (index) => {
    setEditTax({ ...taxDetails[index], index: index });
  };

  // const handleTriggerDelete = (contactIndex) => {
  //   setVehicle((currentState) => {
  //     const currentVehicle = { ...currentState };
  //     currentVehicle.taxDetails = currentVehicle.taxDetails?.filter?.(
  //       (contact, index) => index !== contactIndex
  //     );
  //     return currentVehicle;
  //   });
  // };

  const handleTriggerDelete = (contactIndex) => {
    setTaxDetails((currentState) => {
      const currentContact = currentState.filter((contact, index) => index != contactIndex);
      return currentContact;
    });
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <h1 className="pageHead">Edit a vehicle</h1>
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
          <form action="" id="customerForm" onSubmit={submitHandler}>
            <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
              <div className="grid grid-6-col">
                <div className="grid-item">
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.owner.invalid}
                  >
                    <Autocomplete
                      autoSelect
                      size="small"
                      name="owner"
                      options={suppliers || []}
                      value={vehicle.owner || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(value, "owner")
                      }
                      openOnFocus
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vehicle owner"
                          error={formErrors.owner.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.owner.invalid && (
                      <FormHelperText>
                        {formErrors.owner.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.vehicleType.invalid}
                  >
                    <Autocomplete
                      autoSelect
                      size="small"
                      name="vehicleType"
                      options={vehicleTypes || []}
                      value={vehicle.vehicleType || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(value, "vehicleType")
                      }
                      openOnFocus
                      getOptionLabel={(option) => option.vehicle_type}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vehicle type"
                          error={formErrors.vehicleType.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.vehicleType.invalid && (
                      <FormHelperText>
                        {formErrors.vehicleType.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth error={formErrors.vehicleNo.invalid}>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Vehicle number"
                      value={vehicle.vehicleno}
                      error={formErrors.vehicleNo.invalid}
                      onChange={inputChangeHandler}
                      name="vehicleno"
                      id="vehicleNo"
                    />
                    {formErrors.vehicleNo.invalid && (
                      <FormHelperText>
                        {formErrors.vehicleNo.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Capacity"
                      value={vehicle.capacity}
                      onChange={inputChangeHandler}
                      name="capacity"
                      id="capacity"
                    />
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Make"
                      value={vehicle.make}
                      onChange={inputChangeHandler}
                      name="make"
                      id="make"
                    />
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Description"
                      value={vehicle.description}
                      onChange={inputChangeHandler}
                      name="description"
                      id="description"
                    />
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth error>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Registration date"
                        inputFormat="DD/MM/YYYY"
                        format="DD/MM/YYYY"
                        value={vehicle.reg_date}
                        disableFuture={true}
                        onChange={dateInputChangeHandler.bind(null, "reg_date")}
                        renderInput={(params) => (
                          <TextField name="reg_date" size="small" {...params} />
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
                        value={vehicle.vehicleexpdate}
                        onChange={dateInputChangeHandler.bind(null, "vehicleexpdate")}
                        renderInput={(params) => (
                          <TextField name="vehicleexpdate" size="small" {...params} />
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
                      label="Engine number"
                      value={vehicle.engineno}
                      onChange={inputChangeHandler}
                      name="engineno"
                      id="engineNo"
                    />
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Chassis number"
                      value={vehicle.chasisno}
                      onChange={inputChangeHandler}
                      name="chasisno"
                      id="chassisNo"
                    />
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="PUC number"
                      value={vehicle.pucno}
                      onChange={inputChangeHandler}
                      name="pucno"
                      id="pucNo"
                    />
                  </FormControl>
                </div>
                <div className="grid-item">
                  <FormControl fullWidth error>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="PUC expiry date"
                        inputFormat="DD/MM/YYYY"
                        format="DD/MM/YYYY"
                        value={vehicle.pucexpdate}
                        onChange={dateInputChangeHandler.bind(
                          null,
                          "pucexpdate"
                        )}
                        renderInput={(params) => (
                          <TextField
                            name="pucexpdate"
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
                      autoSelect
                      size="small"
                      name="body"
                      options={["Open", "Close"]}
                      value={vehicle.body || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(value, "body")
                      }
                      openOnFocus
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField {...params} label="Body" fullWidth />
                      )}
                    />
                  </FormControl>
                </div>
              </div>
            </Paper>
          </form>

          <div className="bl_contact_person">
            <div className="bl_form">
              <TaxDetailForm
                onTaxDetailAdd={handleOnTaxDetailAdd}
                editTaxDetail={editTax}
              />
            </div>
            <div className="bl_content">
              <TaxDetailList
                taxDetails={taxDetails}
                handleTriggerEdit={handleTriggerEdit}
                handleTriggerDelete={handleTriggerDelete}
              />
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
              form="customerForm"
              className="ml6"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleAdd;
