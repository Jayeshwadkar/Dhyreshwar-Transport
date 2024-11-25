import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconButton,
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Alert, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LoadingSpinner } from "../../../../ui-controls";
import Stations from "./Stations";
import {
  getQuotation,
  selectIsLoading,
  updateQuotation,
} from "./slice/quotationSlice";

const initialState = {
  date: new Date(),
  customer: "",
  from: null,
  to: null,
  otherField: "",
  ratePer: "",
  stations: [],
};

const initialErrorState = {
  date: {
    invalid: false,
    message: "",
  },
  customer: {
    invalid: false,
    message: "",
  },
  from: {
    invalid: false,
    message: "",
  },
  to: {
    invalid: false,
    message: "",
  },
  ratePer: {
    invalid: false,
    message: "",
  },
  stations: {
    invalid: false,
    message: "",
  },
};

const QuotationEdit = () => {
  const isLoading = useSelector(selectIsLoading);
  const location = useLocation();
  const { quotationId } = location.state;
  const [quotation, setQuotation] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { places } = useSelector(({ quotation }) => quotation) || {};

  const goToQuotationList = useCallback(() => {
    navigate("/transactions/quotations");
  }, [navigate]);

  useEffect(() => {
    if (places?.length && quotationId) {
      dispatch(getQuotation(quotationId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setQuotation(payload?.data);
          }
        })
        .catch(() => {
          setHttpError(
            "Something went wrong! Please try later or contact Administrator."
          );
        });
    }
  }, [places]);

  const backButtonHandler = () => {
    goToQuotationList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setQuotation((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(quotation)) {
      dispatch(updateQuotation(quotation))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setFormErrors(initialErrorState);
            setQuotation(initialState);
            goToQuotationList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.date) {
      errors.date = { invalid: true, message: "Date is required" };
    }
    if (!formData.customer?.trim?.()) {
      errors.customer = { invalid: true, message: "Customer is required" };
    }
    if (!formData.from) {
      errors.from = { invalid: true, message: "From date is required" };
    }
    if (!formData.to) {
      errors.to = { invalid: true, message: "To date is required" };
    }
    if (!formData.ratePer?.trim?.()) {
      errors.ratePer = { invalid: true, message: "Rate type is required" };
    }
    if (!formData.stations?.length) {
      errors.stations = {
        invalid: true,
        message: "At least one entry is required",
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
    setQuotation((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
  };

  const stationDeleteHandler = (e, index) => {
    e.preventDefault();
    if (quotation.stations?.length) {
      const updatedStations = quotation.stations;
      updatedStations?.splice?.(index, 1);
      setQuotation((currState) => {
        return {
          ...currState,
          stations: updatedStations,
        };
      });
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <h1 className="pageHead">Edit a quotation</h1>
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
          <form action="" onSubmit={submitHandler} id="quotationForm">
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.date.invalid}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      error={formErrors.date.invalid}
                      label="Date"
                      inputFormat="DD/MM/YYYY"
                      value={quotation.date}
                      onChange={dateInputChangeHandler.bind(null, "date")}
                      renderInput={(params) => (
                        <TextField
                          name="date"
                          size="small"
                          autoComplete="off"
                          {...params}
                          error={formErrors.date.invalid}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  {formErrors.date.invalid && (
                    <FormHelperText>{formErrors.date.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.customer.invalid}
                >
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Customer"
                    value={quotation.customer}
                    error={formErrors.customer.invalid}
                    onChange={inputChangeHandler}
                    name="customer"
                    id="customer"
                  />

                  {formErrors.customer.invalid && (
                    <FormHelperText>
                      {formErrors.customer.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.from.invalid}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      error={formErrors.from.invalid}
                      label="From date"
                      inputFormat="DD/MM/YYYY"
                      value={quotation.from}
                      onChange={dateInputChangeHandler.bind(null, "from")}
                      renderInput={(params) => (
                        <TextField
                          name="from"
                          size="small"
                          autoComplete="off"
                          {...params}
                          error={formErrors.from.invalid}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  {formErrors.from.invalid && (
                    <FormHelperText>{formErrors.from.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.to.invalid}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      error={formErrors.to.invalid}
                      label="To date"
                      inputFormat="DD/MM/YYYY"
                      value={quotation.to}
                      onChange={dateInputChangeHandler.bind(null, "to")}
                      renderInput={(params) => (
                        <TextField
                          name="to"
                          size="small"
                          autoComplete="off"
                          {...params}
                          error={formErrors.to.invalid}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  {formErrors.to.invalid && (
                    <FormHelperText>{formErrors.to.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.ratePer.invalid}
                >
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Rate per"
                    value={quotation.ratePer}
                    error={formErrors.ratePer.invalid}
                    onChange={inputChangeHandler}
                    name="ratePer"
                    id="ratePer"
                  />

                  {formErrors.ratePer.invalid && (
                    <FormHelperText>
                      {formErrors.ratePer.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth size="small">
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Other header field"
                    value={quotation.otherField}
                    onChange={inputChangeHandler}
                    name="otherField"
                    id="otherField"
                  />
                </FormControl>
              </div>
            </div>
          </form>
          <Divider sx={{ margin: "20px 0" }} />
          {formErrors.stations.invalid && (
            <p className="error">{formErrors.stations.message}</p>
          )}
          <Stations
            places={places}
            quotation={quotation}
            setQuotation={setQuotation}
          />

          {quotation.stations?.length > 0 ? (
            <TableContainer>
              <Table sx={{ width: 500 }} className="tbl_jsm">
                <TableHead>
                  <TableRow>
                    <TableCell>Station</TableCell>
                    <TableCell align="right">
                      Rate per {quotation.ratePer}
                    </TableCell>
                    <TableCell align="right">{quotation.otherField}</TableCell>
                    <TableCell align="right">&nbsp;</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.stations?.map?.((station, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{station.station}</TableCell>
                      <TableCell align="right">
                        &#8377; {station.amount}
                      </TableCell>
                      <TableCell align="right">
                        &#8377; {station.otherFieldValue}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => stationDeleteHandler(e, index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
          <Divider sx={{ margin: "20px 0" }} />
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
              form="quotationForm"
              className="ml6"
            >
              Save
            </Button>
          </div>
        </Paper>
      </div>
    </>
  );
};

export default QuotationEdit;
