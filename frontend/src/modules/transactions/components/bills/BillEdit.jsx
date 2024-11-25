import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Divider,
  InputLabel,
  InputAdornment,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LorryReceipts from "./LorryReceipts";
import { LoadingSpinner } from "../../../../ui-controls";
import { base64ToObjectURL, validateNumber } from "../../../../services/utils";
import {
  downloadBill,
  downloadExcelBill,
  getBill,
  getLorryReceiptsByConsignor,
  getLorryReceiptsByConsignorForEdit,
  selectIsLoading,
  updateBill,
} from "./slice/billSlice";
import {
  getCustomers,
} from "../lorry-receipts/slice/lorryReceiptSlice";
import FileSaver from "file-saver";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

const initialState = {
  branch: "",
  date: new Date(),
  dueDate: new Date(),
  from: "",
  to: "",
  customer: "",
  lrList: [],
  totalFreight: "",
  freight: "",
  localFreight: "",
  cgst: "",
  cgstPercent: "",
  sgst: "",
  sgstPercent: "",
  total: "",
  grandTotal: "",
  remark: "",
  totalAmount: "",
  serviceTax: "",
};

const initialErrorState = {
  branch: {
    invalid: false,
    message: "",
  },
  date: {
    invalid: false,
    message: "",
  },
  customer: {
    invalid: false,
    message: "",
  },
  lrList: {
    invalid: false,
    message: "",
  },
  totalAmount: {
    invalid: false,
    message: "",
  },
  serviceTax: {
    invalid: false,
    message: "",
  },
  total: {
    invalid: false,
    message: "",
  },
  dueDate: {
    invalid: false,
    message: "",
  },
};

const BillEdit = () => {
  const user = useSelector((state) => state.user);
  const isLoading = useSelector(selectIsLoading);

  const { branches, customers } = useSelector(({ bill }) => bill) || {};

  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [fetchedLorryReceipts, setFetchedLorryReceipts] = useState([]);
  const [bill, setBill] = useState(initialState);
  const [fetchedBill, setFetchedBill] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [freightDetails, setFreightDetails] = useState([])
  const [defaultcheck, setDefaultcheck] = useState('')
  const [customer, setCustomer] = useState([])
  const [rowsData, setRowsData] = useState([])
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setColor] = useState("")
  const [getBillLrList, setGetBillLrList] = useState(false)
  const [checkboxes, setCheckboxes] = useState({
    whatsapp: false,
    emailCustomer: false,
    print: true,
  });

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { billId } = location.state;

  const goToBillList = useCallback(() => {
    navigate("/transactions/billList");
  }, [navigate]);

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({ searchName: target.value }));
  };

  useEffect(() => {
    const err = Object.keys(formErrors);
    if (err?.length) {
      const input = document.querySelector(`input[name=${err[0]}]`);

      input?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    }
  }, [formErrors]);

  useEffect(() => {
    if (httpError) {
      const input = document.getElementById(`alertError`);
      input?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    }
  }, [httpError]);

  // const fetchLorry = (consignor, from, to) => {
  //   dispatch(
  //     getLorryReceiptsByConsignor({
  //       consignor,
  //       from,
  //       to,
  //       edit: true
  //     })
  //   )
  //     .then(({ payload = {} }) => {
  //       const { message } = payload?.data || {};
  //       if (message) {
  //         setHttpError(message);
  //       } else {

  //         const updatedLR = [...(payload?.data || [])];
  //         updatedLR?.forEach?.((lr) => {
  //           lr.checked = false;
  //           lr.consignor =
  //             customers?.filter?.(
  //               (customer) => customer._id === lr.consignor
  //             )[0] || "";
  //           lr.consignee =
  //             customers?.filter?.(
  //               (customer) => customer._id === lr.consignee
  //             )[0] || "";
  //         });
  //         setFetchedLorryReceipts(updatedLR);
  //       }
  //     })
  //     .catch(() => {
  //       setHttpError(
  //         "Something went wrong! Please try later or contact Administrator."
  //       );
  //     });
  // };


  useEffect(() => {
    if (customer && getBillLrList) {
      dispatch(
        getLorryReceiptsByConsignorForEdit({
          consignor: customer,
          freightDetails: freightDetails,
          id: billId,
          Branch: bill?.branch
        })
      )
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            const checkbox = payload?.data.checkbox
            const updatedLR = payload?.data.lorryReceipts
            // const updatedLR = payload?.data?.filter?.(
            //   (lr) => !lr.billGenerated
            // );
            // updatedLR?.forEach?.((lr) => {
            //   lr.checked = false;
            //   lr.consignor =
            //     customers?.filter?.(
            //       (customer) => customer._id === lr.consignor
            //     )[0] || "";
            //   lr.consignee =
            //     customers?.filter?.(
            //       (customer) => customer._id === lr.consignee
            //     )[0] || "";
            // });
            setLorryReceipts(updatedLR);
            setDefaultcheck(checkbox)
            // setIsLoading(false)
            // setBill((currState) => {
            //   return {
            //     ...currState,
            //     lrList: [],
            //   };
            // });
          }
        })
        .catch(() => {
          setHttpError(
            "Something went wrong! Please try later or contact Administrator."
          );
        });
    }
  }, [customer, freightDetails, bill.branch, getBillLrList]);

  // useEffect(() => {
  //   if (fetchedBill.customer) {
  //     fetchLorry(
  //       fetchedBill.customer,
  //       fetchedBill.from,
  //       fetchedBill.to
  //     );
  //   }
  // }, [
  //   fetchedBill.customer,
  //   fetchedBill.from,
  //   fetchedBill.to,
  // ]);

  // useEffect(() => {
  //   if (bill.branch && bill.customer) {
  //     fetchLorry(bill.branch?._id, bill.customer?._id, bill.from, bill.to);
  //   }
  // }, [bill.branch, bill.customer, bill.from, bill.to]);

  useEffect(() => {
    if (billId) {
      dispatch(getBill(billId))
        .then(({ payload = {} }) => {
          const { message, rowDetails } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            const filteredBranch = branches?.find?.(
              (branch) => branch.branch_id == payload.data.branch
            );
            setBill({
              ...bill, ...payload.data, branch: filteredBranch,
              customer: {
                customer_id: payload?.data?.customer,
                customer_name: payload?.data?.customer_name,
                email: payload?.data?.customer_email
              }
            })
            setCustomer({ customer_id: payload?.data?.customer })
            setRowsData(rowDetails)
            setFetchedBill(payload?.data);
            setGetBillLrList(true)
          }
        })
        .catch(() => {
          setHttpError(
            "Something went wrong! Please try later or contact Administrator."
          );
        });
    }
  }, [billId]);

  // useEffect(() => {

  //   if (fetchedBill.id && lorryReceipts?.length) {
  //     const updatedBill = { ...fetchedBill };
  //     const updatedLorryReceipts = lorryReceipts?.map?.((fetchedLR) => {
  //       const isInBill = fetchedBill.lrList?.filter?.(
  //         (lr) => lr == fetchedLR.id
  //       );
  //       return {
  //         ...fetchedLR,
  //         checked: isInBill?.length ? true : false,
  //       };
  //     });
  //     let updatedFilteredLorryReceipts;
  //     if (billId) {
  //       updatedFilteredLorryReceipts = updatedLorryReceipts?.filter?.((lr) => {
  //         return (
  //           !lr.billGenerated || (lr.billGenerated && lr.assoBill === billId)
  //         );
  //       });
  //     }
  //     const filteredBranch = branches?.find?.(
  //       (branch) => branch.branch_id == fetchedBill.branch
  //     );
  //     updatedBill.lrList = updatedBill.lrList?.map?.((billLr) => {
  //       return (
  //         updatedLorryReceipts?.filter?.((lr) => lr.id === billLr)[0] || ""
  //       );
  //     });
  //     // const customer = customers?.find?.(
  //     //   (customer) => customer._id === fetchedBill.customer
  //     // );

  //     // setBill({ ...updatedBill, branch: filteredBranch });
  //     setLorryReceipts(updatedFilteredLorryReceipts);
  //   } else {
  //     setLorryReceipts([]);
  //   }
  // }, [fetchedBill, fetchedLorryReceipts, billId]);

  // useEffect(() => {
  //   let totalToPay = 0;
  //   bill.lrList.forEach((lr) => {
  //     totalToPay += +lr.total;
  //   });

  //   setBill((currState) => {
  //     return {
  //       ...currState,
  //       totalAmount: totalToPay,
  //     };
  //   });
  // }, [bill.lrList]);

  useEffect(() => {
    const serviceTaxAmount = (+bill.totalAmount * +bill.serviceTax) / 100;
    const total = +serviceTaxAmount + +bill.totalAmount;
    if (total) {
      setBill((currState) => {
        return {
          ...currState,
          total: total,
        };
      });
    } else {
      setBill((currState) => {
        return {
          ...currState,
          total: bill.totalAmount,
        };
      });
    }
  }, [bill.totalAmount, bill.serviceTax]);

  const resetButtonHandler = () => {
    // setBill(initialState);
    // setHttpError("");
    // setFormErrors(initialErrorState);
    window.location.reload(false)
  };

  const backButtonHandler = () => {
    goToBillList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setBill((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };
  const autocompleteChangeListener = (value, name) => {
    // console.log("see bill : ", value)

    if (!value) {
      console.error("Invalid value passed to autocompleteChangeListener");
      return;
    }

    if (name === "branch") {
      window.localStorage.setItem("branch", JSON.stringify(value));
      navigate("#", {
        state: value,
      });
    }

    if (name === "customer") { setCustomer(value) }

    setBill((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });

    setFetchedBill((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  let r1 = 0;
  let r2 = 0;
  const submitHandler = (e, isSaveAndPrint, isExport) => {
    e.preventDefault();
    if (!validateForm(bill)) {
      dispatch(
        updateBill({
          ...bill,
          branch: bill.branch?.branch_id,
          customer: bill.customer?.customer_id,
        })
      )
        .then(({ payload = {} }) => {
          console.log("Payload : ", payload)
          const { inserted_id, message } = payload?.data || {};
          // const message = payload?.data?.[0]?.[0]?.message
          if (message == "Something Went Wrong!") {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('error')
            //setIsLoading(false)
            return
          }
          if (checkboxes.emailCustomer) {
            if (inserted_id) {
              dispatch(downloadBill({ id: inserted_id, email: bill?.customer?.email }))
                .then(({ payload = {} }) => {
                  // const { message } = payload?.data || {};
                  // if (message) {
                  //   setHttpError(message);
                  // }

                  const fileURL = base64ToObjectURL(payload?.data.file);
                  r1 = 1

                  if (!checkboxes.print && checkboxes.emailCustomer) {
                    checkAndReload();
                  }

                })
                .catch((error) => {
                  setConfirmmessage(e.message);
                  setConfirmationopen(true);
                  setColor('error')
                  // setHttpError(error.message);
                  // setSelectedBill(null);
                });
            }
          } else {
            setHttpError("");
          }
          if (checkboxes.print) {
            if (inserted_id) {
              dispatch(downloadBill({ id: inserted_id, email: "" }))
                .then(({ payload = {} }) => {
                  const { message } = payload?.data || {};
                  if (message) {
                    setHttpError(message);
                  }
                  if (payload?.data.file) {
                    const fileURL = base64ToObjectURL(payload?.data.file);
                    if (fileURL) {
                      const winPrint = window.open(fileURL, "_blank");
                      winPrint?.focus();
                      winPrint?.print();
                      setHttpError("");
                      setFormErrors(initialErrorState);
                      // setBill(initialState);
                      // goToBillList();
                      r2 = 1;
                    }
                  }
                  checkAndReload();
                })
                .catch((error) => {
                  setConfirmmessage(e.message);
                  setConfirmationopen(true);
                  setColor('error')
                  // setHttpError(error.message);
                  // setSelectedBill(null);
                });
            }
          } else {
            setHttpError("");
          }

          if (message) {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('green')
          }
          else {
            setHttpError("");
            setFormErrors(initialErrorState);
          }

          if (!checkboxes.emailCustomer && !checkboxes.print) {
            // goToBillList();
            setTimeout(() => {
              goToBillList();
            }, 1500)
          }


          // if (message) {
          //   setHttpError(message);
          // } else {
          //   if (isSaveAndPrint) {
          //     dispatch(downloadBill({ id: payload?.data._id, email: "" }))
          //       .then(({ payload = {} }) => {
          //         const { message } = payload?.data || {};
          //         if (message) {
          //           setHttpError(message);
          //         }
          //         if (payload?.data.file) {
          //           const fileURL = base64ToObjectURL(payload?.data.file);
          //           if (fileURL) {
          //             const winPrint = window.open(fileURL, "_blank");
          //             winPrint.focus();
          //             winPrint.print();
          //             setHttpError("");
          //             setFormErrors(initialErrorState);
          //             setBill(initialState);
          //             goToBillList();
          //           }
          //         }
          //       })
          //       .catch((error) => {
          //         setHttpError(error.message);
          //       });
          //   } else if (isExport) {
          //     dispatch(downloadExcelBill({ id: payload?.data._id, email: "" }))
          //       .then(({ payload = {} }) => {
          //         const { message } = payload?.data || {};
          //         if (message) {
          //           setHttpError(message);
          //         } else {
          //           const blob = new Blob([payload?.data], {
          //             type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          //           });
          //           FileSaver.saveAs(blob, "Bill.xlsx");
          //           setHttpError("");
          //           setFormErrors(initialErrorState);
          //           setBill(initialState);
          //           goToBillList();
          //         }
          //       })
          //       .catch((error) => {
          //         setHttpError(error.message);
          //       });
          //   } else {
          //     setHttpError("");
          //     setFormErrors(initialErrorState);
          //     setBill(initialState);
          //     goToBillList();
          //   }
          // }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const checkAndReload = () => {
    console.log("message", r1, r2);
    if (r1 || r2) {
      // window.location.reload();
      goToBillList();
    }
  };

  const saveAndPrint = (e) => {
    e.preventDefault();
    if (!validateForm(bill)) {
      dispatch(
        updateBill({
          ...bill,
          branch: bill.branch?.branch_id,
          customer: bill.customer?.customer_id,
        })
      )
        .then(({ payload = {} }) => {
          console.log("Payload : ", payload)
          const { inserted_id, message } = payload?.data || {};
          // const message = payload?.data?.[0]?.[0]?.message
          if (message == "Something Went Wrong!") {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('error')
            //setIsLoading(false)
            return
          }
          
          if (message) {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('green')
            setTimeout(() => {
              goToBillList();
            }, 1500)
          }
          else {
            setHttpError("");
            setFormErrors(initialErrorState);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };
  // const saveAndExport = (e) => {
  //   e.preventDefault();
  //   submitHandler(e, false, true);
  // };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.branch) {
      errors.branch = { invalid: true, message: "Branch is required" };
    }
    if (!formData.date) {
      errors.date = { invalid: true, message: "Date is required" };
    }
    if (!formData.customer) {
      errors.customer = { invalid: true, message: "Customer is required" };
    }
    if (
      !formData.lrList.length ||
      !(formData.lrList || []).some?.((lr) => lr)
    ) {
      errors.lrList = {
        invalid: true,
        message: "At least one lorry receipt is required",
      };
    }
    if (!formData.totalAmount || isNaN(formData.totalAmount)) {
      errors.lrList = {
        invalid: true,
        message: "Total amount should be a number and greater than 0",
      };
    }
    const integerPart = String(formData.totalAmount).split('.')
    if (integerPart[0].length > 9) {
      errors.totalAmount = {
        invalid: true,
        message: "Total amount 9 digits before the decimal.",
      };
    }
    if (formData.serviceTax && isNaN(formData.serviceTax)) {
      errors.serviceTax = {
        invalid: true,
        message: "Service tax should be a number",
      };
    }
    if (!formData.dueDate) {
      errors.dueDate = { invalid: true, message: "Due date is required" };
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
    setBill((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
  };

  const setLRForBill = () => {
    const selectedLR = lorryReceipts?.filter?.((lr) => lr.checked);
    setBill((currState) => {
      return {
        ...currState,
        lrList: selectedLR,
      };
    });
  };

  const handleFreightDetails = (
    filterData
  ) => {
    setFreightDetails({
      filterData: filterData
    });
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({
      ...checkboxes,
      [name]: checked,
    });
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="inner-wrap">
        <h1 className="pageHead">Edit a bill</h1>
        {httpError !== "" && (
          <Stack
            sx={{
              width: "100%",
              margin: "0 0 30px 0",
              border: "1px solid red",
              borderRadius: "4px",
            }}
            spacing={1}
          >
            <Alert id="alertError" severity="error">
              {httpError}
            </Alert>
          </Stack>
        )}
        <form action="" onSubmit={saveAndPrint} id="billForm">
          <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
            <div className="grid grid-4-col">
              {
                user &&
                  user.type &&
                  user.type?.toLowerCase?.() === "superadmin" ? <div className="grid-item">
                  <div className="custom-grid">
                    <label sx={{ width: "20%" }}>Branch:</label>
                    <FormControl
                      fullWidth
                      size="small"
                      error={formErrors.branch.invalid}
                    >
                      <Autocomplete
                        disablePortal
                        size="small"
                        name="branch"
                        options={branches || []}
                        value={bill.branch}
                        onChange={(e, value) =>
                          autocompleteChangeListener(value, "branch")
                        }
                        getOptionLabel={(branch) => branch.branch_name}
                        openOnFocus
                        disabled={
                          user &&
                          user.type &&
                          user.type?.toLowerCase?.() !== "superadmin"
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label=""
                            name="branch"
                            error={formErrors.branch.invalid}
                            fullWidth
                          />
                        )}
                      />
                      {formErrors.branch.invalid && (
                        <FormHelperText>{formErrors.branch.message}</FormHelperText>
                      )}
                    </FormControl>
                  </div>
                </div> : null
              }

              {/* <div className="grid-item">
                <div className="custom-grid">
                  <InputLabel>Bill No:</InputLabel>
                  <FormControl fullWidth error={formErrors.billNo.invalid}>
                    <TextField
                      size="small"
                      variant="outlined"
                      label=""
                     disabled={true}
                      error={formErrors.billNo.invalid}
                      onChange={inputChangeHandler}
                      onInput={validateNumber}
                      name="billNo"
                      id="billNo"                    
                    />
                    {formErrors.billNo.invalid && (
                      <FormHelperText>
                        {formErrors.billNo.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              </div> */}
              <div className="grid-item">
                <div className="custom-grid">
                  <InputLabel>Bill Date:</InputLabel>
                  <FormControl fullWidth error={formErrors.date.invalid}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        error={formErrors.date.invalid}
                        label=""
                        inputFormat="DD/MM/YYYY"
                        value={bill.date}
                        disableFuture={true}
                        onChange={dateInputChangeHandler.bind(null, "date")}
                        inputProps={{
                          readOnly: true,
                        }}
                        renderInput={(params) => (
                          <TextField
                            name="date"
                            size="small"
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
              </div>
              <div className="grid-item">
                <div className="custom-grid">
                  <InputLabel>Customer Name:</InputLabel>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.customer.invalid}
                  >
                    <Autocomplete
                      // disablePortal
                      id="customer"
                      // freeSolo={!!bill.customer}
                      // open={customers.length}
                      onClose={() => dispatch(getCustomers())}
                      autoSelect
                      size="small"
                      name="customer"
                      options={customers || []}
                      value={bill.customer || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(value, "customer")
                      }
                      // onBlur={() => dispatch(getCustomers())}
                      getOptionLabel={(customer) => customer.customer_name}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="customer"
                          label=""
                          onChange={(e) => customerFilterOptions(e)}
                          error={formErrors.customer.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.customer.invalid && (
                      <FormHelperText>
                        {formErrors.customer.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              </div>
              {/* <div className="grid-item">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From"
                      inputFormat="DD/MM/YYYY"
                      value={bill.from || null}
                      disableFuture={true}
                      maxDate={bill.to}
                      onChange={dateInputChangeHandler.bind(null, "from")}
                      inputProps={{
                        readOnly: true,
                      }}
                      renderInput={(params) => (
                        <TextField name="from" size="small" {...params} />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To"
                      inputFormat="DD/MM/YYYY"
                      value={bill.to || null}
                      disableFuture={true}
                      minDate={bill.from}
                      onChange={dateInputChangeHandler.bind(null, "to")}
                      inputProps={{
                        readOnly: true,
                      }}
                      renderInput={(params) => (
                        <TextField name="to" size="small" {...params} />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div> */}
            </div>
          </Paper>
        </form>
        {formErrors.lrList.invalid && (
          <p className="error">{formErrors.lrList.message}</p>
        )}
        <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
          <LorryReceipts
            lorryReceipts={lorryReceipts}
            setLRForBill={setLRForBill}
            bill={bill}
            setBill={setBill}
            handleFreightDetails={handleFreightDetails}
            defaultcheck={defaultcheck}
            rowsData={rowsData}
          />

          <Divider sx={{ margin: "20px 0" }} />
          <form action="" onSubmit={submitHandler} id="billForm">
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.totalAmount.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Total amount"
                    value={bill.totalAmount}
                    error={formErrors.totalAmount.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="totalAmount"
                    id="totalAmount"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          &#8377;
                        </InputAdornment>
                      ),
                      inputProps: { maxLength: 12 },
                    }}
                  />
                  {formErrors.totalAmount.invalid && (
                    <FormHelperText>
                      {formErrors.totalAmount.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.serviceTax.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Service tax"
                    value={bill.serviceTax}
                    error={formErrors.serviceTax.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="serviceTax"
                    id="serviceTax"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    inputProps={{ maxLength: 3 }}
                  />
                  {formErrors.serviceTax.invalid && (
                    <FormHelperText>
                      {formErrors.serviceTax.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.total.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Total"
                    value={bill.total}
                    error={formErrors.total.invalid}
                    onChange={inputChangeHandler}
                    name="total"
                    id="total"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          &#8377;
                        </InputAdornment>
                      ),
                    }}
                  />
                  {formErrors.total.invalid && (
                    <FormHelperText>{formErrors.total.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.dueDate.invalid}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      error={formErrors.dueDate.invalid}
                      label="Due date"
                      inputFormat="DD/MM/YYYY"
                      value={bill.dueDate}
                      disableFuture={true}
                      onChange={dateInputChangeHandler.bind(null, "dueDate")}
                      inputProps={{
                        readOnly: true,
                      }}
                      renderInput={(params) => (
                        <TextField
                          name="dueDate"
                          size="small"
                          {...params}
                          error={formErrors.dueDate.invalid}
                        />
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
                    label="Remark"
                    value={bill.remark}
                    onChange={inputChangeHandler}
                    name="remark"
                    id="remark"
                  />
                </FormControl>
              </div>
            </div>
          </form>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="whatsapp"
                    checked={checkboxes.whatsapp}
                    onChange={handleCheckboxChange}
                    disabled size="small"
                  />
                }
                label="WhatsApp"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="emailCustomer"
                    checked={checkboxes.emailCustomer}
                    onChange={handleCheckboxChange}
                    size="small"
                  />
                }
                label="Customer Mail"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="print"
                    checked={checkboxes.print}
                    onChange={handleCheckboxChange}
                    size="small"
                  />
                }
                label="Print"

              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
            <Button
                variant="contained"
                size="medium"
                type="button"
                color="primary"
                form="billForm"
                className="ml6"
                onClick={submitHandler}
              >
                Save &amp; Print
              </Button>
              <Button
                variant="contained"
                size="medium"
                type="submit"
                color="primary"
                form="billForm"
                className="ml6"
              >
                Save
              </Button>
             
              <Button
                className="ml6"
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

              {/* <Button
              variant="contained"
              size="medium"
              type="button"
              color="primary"
              form="billForm"
              className="ml6"
              onClick={saveAndExport}
            >
              export to excel sheet
            </Button> */}
            </div>
          </div>
        </Paper>
      </div>
      <CustomSnackbar
        open={isConfirmationopen}
        message={confirmmessage}
        onClose={() => setConfirmationopen(false)}
        color={snackColour}
      />
    </>
  );
};

export default BillEdit;
