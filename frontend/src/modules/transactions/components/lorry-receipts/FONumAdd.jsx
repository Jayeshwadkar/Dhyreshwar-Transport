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
import { useDispatch, useSelector } from "react-redux";
import { Alert, Stack } from "@mui/material";
import {
  createFONum,
  getLorryReceipts,
  selectIsLoading,
} from "./slice/lorryReceiptSlice";
import { LoadingSpinner } from "../../../../ui-controls";

const initialState = {
  lr: "",
  foNum: "",
};

const initialErrorState = {
  lr: {
    invalid: false,
    message: "",
  },
  foNum: {
    invalid: false,
    message: "",
  },
};

const LorryReceiptAdd = () => {
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector((state) => state.user);
  const [lorryReceipt, setLorryReceipt] = useState(initialState);
  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToLorryReceipts = useCallback(() => {
    navigate("/transactions/lorryReceipts");
  }, [navigate]);

  useEffect(() => {
    dispatch(getLorryReceipts(user.branch))
      .then(({ payload = {} }) => {
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          setHttpError("");
          const updatedLR = payload?.data?.map?.((lr) => {
            return { ...lr, label: lr.lrNo, value: lr.lrNo };
          });
          setLorryReceipts(updatedLR);
        }
      })
      .catch((error) => {
        setHttpError(error.message);
      });
  }, []);

  const backButtonHandler = () => {
    goToLorryReceipts();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(lorryReceipt)) {
      const saveLR = {
        _id: lorryReceipt.lr._id,
        foNum: lorryReceipt.foNum,
      };
      dispatch(createFONum(saveLR))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setLorryReceipt(initialState);
            setFormErrors(initialErrorState);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.lr) {
      errors.lr = { invalid: true, message: "Lorry receipt is required" };
    }
    if (!formData.foNum?.trim?.()) {
      errors.foNum = { invalid: true, message: "FO no is required" };
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

  const autocompleteChangeListener = (e, option, name) => {
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Add FO no</h1>
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
        <form action="" onSubmit={submitHandler} id="lorryReceiptForm">
          <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.lr.invalid}
                >
                  <Autocomplete
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="vehicleNo"
                    options={lorryReceipts || []}
                    value={lorryReceipt.lr || null}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "lr")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lorry receipt"
                        error={formErrors.lr.invalid}
                        fullWidth
                      />
                    )}
                  />
                  {formErrors.lr.invalid && (
                    <FormHelperText>{formErrors.lr.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Consignor"
                    value={lorryReceipt.lr?.consignorName || ""}
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
                    label="From"
                    value={lorryReceipt.lr?.from || ""}
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
                    label="Consignee"
                    value={lorryReceipt.lr?.consigneeName || ""}
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
                    label="To"
                    value={lorryReceipt.lr?.to || ""}
                    name="lsNo"
                    id="lsNo"
                    inputProps={{
                      readOnly: true,
                    }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.foNum.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="FO no."
                    value={lorryReceipt.foNum}
                    onChange={inputChangeHandler}
                    error={formErrors.foNum.invalid}
                    name="foNum"
                    id="foNum"
                  />
                  {formErrors.foNum.invalid && (
                    <FormHelperText>{formErrors.foNum.message}</FormHelperText>
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
                variant="contained"
                size="medium"
                type="submit"
                color="primary"
                form="lorryReceiptForm"
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

export default LorryReceiptAdd;
