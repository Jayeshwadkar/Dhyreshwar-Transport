import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Divider,
  Autocomplete,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  base64ToObjectURL,
  // mobileNoRegEx,
  validateNumber,
  validatePhoneNumber,
} from "../../../../services/utils";
import FreightDetails from "./FreightDetails";
import {
  createLoadingSlip,
  downloadLoadingSlip,
  getLorryReceiptsForLS,
  selectIsLoading,
  getDrivers,
  getCustomers,
  getSuppliers
} from "./slice/loadingSlipSlice";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

const initialState = {
  lsNo: "",
  branch: "",
  date: new Date(),
  vehicle: null,
  vehicleNo: "",
  vehicleOwner: "",
  supplier: "",
  vehicleOwnerAddress: "",
  vehicleOwnerPhone: "",
  vehicleOwnerEmail: "",
  driver: null,
  driverName: "",
  licenseNo: "",
  phone: "",
  from: null,
  fromName: null,
  to: null,
  toName: null,
  lrList: [],
  toPay: "",
  rent: "",
  advance: "",
  totalPayable: "",
  totalWeight: "",
  currentTime: new Date(),
  reachTime: null,
  ackBranch: null,
  remark: "",
  hire: "",
  hamali: "",
  commission: "",
  stacking: "",
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
  vehicle: {
    invalid: false,
    message: "",
  },
  vehicleOwner: {
    invalid: false,
    message: "",
  },
  vehicleOwnerAddress: {
    invalid: false,
    message: "",
  },
  vehicleOwnerPhone: {
    invalid: false,
    message: "",
  },
  driver: {
    invalid: false,
    message: "",
  },
  licenseNo: {
    invalid: false,
    message: "",
  },
  phone: {
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
  lrList: {
    invalid: false,
    message: "",
  },
  toPay: {
    invalid: false,
    message: "",
  },
  rent: {
    invalid: false,
    message: "",
  },
  advance: {
    invalid: false,
    message: "",
  },
  ackBranch: {
    invalid: false,
    message: "",
  },
  hire: {
    invalid: false,
    message: "",
  },
  hamali: {
    invalid: false,
    message: "",
  },
  stacking: {
    invalid: false,
    message: "",
  },
  commission: {
    invalid: false,
    message: "",
  },
  total: {
    invalid: false,
    message: "",
  },
};

const LoadingSlipAdd = () => {
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector((state) => state.user);
  const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
  // const { search } = useSelector(({ supplier }) => supplier);
  const [search, setSearchData] = useState(null);
  const { branches, vehicles, suppliers, places, drivers, customers } =
    useSelector(({ loadingslip }) => loadingslip) || {};
  const { state } = useLocation();
  const [checkboxes, setCheckboxes] = useState({
    whatsapp: false,
    emailConsigner: false,
    emailConsignee: false,
    print: true,
  });
  const [lorryReceipts, setLorryReceipts] = useState([]);
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setColor] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingSlip, setLoadingSlip] = useState({
    ...initialState,
    branch: window.localStorage.getItem('branch') && isSuperAdminOrAdmin() ? JSON.parse(window.localStorage.getItem('branch')) : user.branchData,
  });

  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [isLocalMemo, setIsLocalMemo] = useState(false);
  const [isModule, setIsModule] = useState("");
  const [page, setPage] = useState(1);
  const [defaultcheck, setDefaultcheck] = useState('')
  const [isLastPage, setLastPage] = useState(0);
  const [freightDetails, setFreightDetails] = useState([])
  const [reload1, setReload1] = useState(false)
  const [reload2, setReload2] = useState(false)
  const [rowsData, setRowsData] = useState([])
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const goToLoadingSlips = useCallback(() => {
    navigate("/transactions/loadingSlips");
  }, [navigate]);

  const goToLocalMemo = useCallback(() => {
    navigate("/transactions/localMemoList");
  }, [navigate]);

  useEffect(() => {
    dispatch(getDrivers())
    dispatch(getCustomers())
    dispatch(getSuppliers())
    if (location.pathname) {
      if (location.pathname?.endsWith("addLocalMemoLS")) {
        setIsLocalMemo(true);
        setIsModule("localMemoLS");
      } else {
        setIsLocalMemo(false);
        setIsModule("loadingSlip");
      }
    }
  }, []);

  useEffect(() => {

    const fetchLorryReceipts = async () => {
      if (isModule) {
        setLoading(true);
        try {
          const { payload = {} } = await dispatch(getLorryReceiptsForLS({
            page,
            isLocalMemo,
            branch: loadingSlip.branch?.branch_id,
            freightDetails: freightDetails
          }));

          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            const { lorryReceipts, isLastPage, checkbox } = payload?.data || {};
            setDefaultcheck(checkbox)
            setLorryReceipts(lorryReceipts);
            console.log("hhiihihi,done")
            setLoading(false);
            setLastPage(isLastPage);
          }
        } catch (error) {
          setHttpError(
            "Something went wrong! Please try later or contact Administrator."
          );
        }
      }
    };

    fetchLorryReceipts();
  }, [page, isModule, loadingSlip.branch, isLocalMemo, freightDetails]);

  const handleFreightDetails = (
    filterData
  ) => {
    console.log(filterData)
    setFreightDetails({
      filterData: filterData
    });
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

  useEffect(() => {
    let totalToPay = 0;
    loadingSlip.lrList.forEach((lr) => {
      totalToPay += +lr.total;
    });

    setLoadingSlip((currState) => {
      return {
        ...currState,
        toPay: totalToPay,
      };
    });
  }, [loadingSlip.lrList]);

  const resetButtonHandler = () => {
    // setLoadingSlip(initialState);
    setLoadingSlip(
      {
        ...initialState,
        branch: isSuperAdminOrAdmin() ? "" : user.branchData
      }
    );
    setHttpError("");
    setFormErrors(initialErrorState);
    setRowsData([])
  };

  const backButtonHandler = () => {
    if (isLocalMemo) {
      goToLocalMemo();
    } else {
      goToLoadingSlips();
    }
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "branch") {
      setLorryReceipts(() => []);
      setPage(1);
    }
    setLoadingSlip((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };
  let r1 = 0
  let r2 = 0
  const submitHandler = (e, isSaveAndPrint) => {
    e.preventDefault();
    // console.log("ls data before update: ", loadingSlip)
    if (!validateForm(loadingSlip)) {
      const updatedLoadingSlip = {
        ...loadingSlip,
        branch: loadingSlip.branch?.branch_id,
        vehicleOwner: loadingSlip.vehicleOwner.name,
        supplier: loadingSlip.vehicleOwner.supplier_id,
        driver: loadingSlip.driver.driver_id,
        to: loadingSlip.to.place_id,
        from: loadingSlip.from.place_id,
        vehicle: loadingSlip.vehicle.vehicle_id,
      };
      if (isLocalMemo) {
        updatedLoadingSlip.isLocalMemo = true;
      } else {
        updatedLoadingSlip.isLocalMemo = false;
      }
      console.log("ls data update: ", updatedLoadingSlip)
      dispatch(createLoadingSlip(updatedLoadingSlip))
        .then(({ payload = {} }) => {
          const message = payload?.data?.[0]?.[0]?.message || '';
          const inserted_id = payload?.data?.[1]?.[0]?.inserted_id || null;
          if (message == "Something Went Wrong!") {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('error')
            //setIsLoading(false)
            return

          }

          if (checkboxes.emailConsigner) {

            if (inserted_id) {

              console.log("vehicleOwnerEmail", loadingSlip.vehicleOwnerEmail)
              dispatch(
                downloadLoadingSlip({
                  id: inserted_id,
                  email: loadingSlip.vehicleOwnerEmail,
                  user: user?.employee?.employee_name || "",
                })
              )
                .then(({ payload = {} }) => {

                  const fileURL = base64ToObjectURL(payload?.data?.file);
                  console.log(fileURL)

                  r1 = 1

                  if (!checkboxes.print && checkboxes.emailConsigner) {
                    checkAndReload();
                  }

                })
                .catch((e) => {
                  setConfirmmessage(e.message);
                  setConfirmationopen(true);
                  setColor('error')
                  //setHttpError(e.message);
                });
            }
          } else {
            setHttpError("");
            // setFormErrors(initialErrorState);
            // setLorryReceipt(initialState);
          }
          if (checkboxes.print) {

            if (inserted_id) {
              console.log("message11", r1, r2)
              dispatch(
                downloadLoadingSlip({ id: inserted_id, email: "" })
              )
                .then(({ payload = {} }) => {

                  const { message } = payload?.data || {};
                  if (message) {
                    setHttpError(message);
                  } else {
                    if (payload?.data.file) {
                      const fileURL = base64ToObjectURL(payload?.data.file);

                      if (fileURL) {

                        const winPrint = window.open(fileURL, "_blank");
                        winPrint && winPrint.focus();
                        winPrint && winPrint.print();
                        r2 = 1

                        setHttpError("");
                        // setFormErrors(initialErrorState);
                        // setLoadingSlip(initialState);

                        // if (isLocalMemo) {
                        //   goToLocalMemo();
                        // } else {
                        //   goToLoadingSlips();
                        // }
                      }
                    }
                  }
                  checkAndReload();
                })
                .catch((error) => {
                  setHttpError(error.message);
                });
            }
          } else {
            setHttpError("");
            // setFormErrors(initialErrorState);
            // setLoadingSlip(initialState);
          }

          if (message) {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('green')
          }

          if (!checkboxes.emailConsigner && !checkboxes.print) {
            setTimeout(() => {
              window.location.reload();
            }, 1500)
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }


  };
  const checkAndReload = () => {
    console.log("message", r1, r2);
    if (r1 || r2) {
      window.location.reload();
    }
  };
  const saveAndPrint = (e) => {
    e.preventDefault();
    if (!validateForm(loadingSlip)) {
      const updatedLoadingSlip = {
        ...loadingSlip,
        branch: loadingSlip.branch?.branch_id,
        vehicleOwner: loadingSlip.vehicleOwner.name,
        supplier: loadingSlip.vehicleOwner.supplier_id,
        driver: loadingSlip.driver.driver_id,
        to: loadingSlip.to.place_id,
        from: loadingSlip.from.place_id,
        vehicle: loadingSlip.vehicle.vehicle_id,
      };
      if (isLocalMemo) {
        updatedLoadingSlip.isLocalMemo = true;
      } else {
        updatedLoadingSlip.isLocalMemo = false;
      }
      console.log("ls data update: ", updatedLoadingSlip)
      dispatch(createLoadingSlip(updatedLoadingSlip))
        .then(({ payload = {} }) => {
          const message = payload?.data?.[0]?.[0]?.message || '';
          const inserted_id = payload?.data?.[1]?.[0]?.inserted_id || null;
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
              window.location.reload();
            }, 1500)
          }

          
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }

  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.branch) {
      errors.branch = { invalid: true, message: "Branch is required" };
    }
    if (!formData.date) {
      errors.date = { invalid: true, message: "Date is required" };
    }
    if (!formData.vehicle) {
      errors.vehicle = { invalid: true, message: "Vehicle is required" };
    }
    if (!formData.vehicleOwner) {
      errors.vehicleOwner = {
        invalid: true,
        message: "Vehicle owner is required",
      };
    }
    if (!formData.vehicleOwnerAddress?.trim?.()) {
      errors.vehicleOwnerAddress = {
        invalid: true,
        message: "Vehicle owner address is required",
      };
    }
    if (!formData.driver) {
      errors.driver = { invalid: true, message: "Driver name is required" };
    }
    // if (!formData.licenseNo?.trim?.()) {
    //   errors.licenseNo = { invalid: true, message: "License no is required" };
    // }
    // if (!formData.phone) {
    //   errors.phone = { invalid: true, message: "Mobile no is required" };
    // }
    // if (
    //   formData.phone &&
    //   formData.phone.trim() !== "" &&
    //   !mobileNoRegEx.test(formData.phone)
    // ) {
    //   errors.phone = {
    //     invalid: true,
    //     message: "Mobile no should be 10 digits number",
    //   };
    // }
    if (!formData.from) {
      errors.from = { invalid: true, message: "From is required" };
    }
    if (!formData.to) {
      errors.to = { invalid: true, message: "To is required" };
    }
    if (!formData.lrList.length) {
      errors.lrList = {
        invalid: true,
        message: "At least one lorry receipt is required",
      };
    }
    if (formData.toPay && isNaN(formData.toPay)) {
      errors.toPay = {
        invalid: true,
        message: "Total to pay should be a number",
      };
    }
    if (formData.hire && isNaN(formData.hire)) {
      errors.hire = { invalid: true, message: "Hire should be a number" };
    }
    if (formData.advance && isNaN(formData.advance)) {
      errors.advance = { invalid: true, message: "Advance should be a number" };
    }
    if (formData.commission && isNaN(formData.commission)) {
      errors.commission = {
        invalid: true,
        message: "Commission should be a number",
      };
    }
    if (formData.hamali && isNaN(formData.hamali)) {
      errors.hamali = { invalid: true, message: "Hamali should be a number" };
    }
    if (formData.stacking && isNaN(formData.stacking)) {
      errors.stacking = {
        invalid: true,
        message: "Stacking should be a number",
      };
    }
    if (formData.total && isNaN(formData.total)) {
      errors.total = { invalid: true, message: "Total should be a number" };
    }
    // if (!formData.ackBranch) {
    //   errors.ackBranch = { invalid: true, message: "Ack branch is required" };
    // }

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
    setLoadingSlip((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
  };

  const autocompleteChangeListener = (e, option, name) => {
    setLoadingSlip((currState) => {
      return {
        ...currState,
        [name]: option,
      };
    });
    if (name === "vehicle") {
      if (option && option.vehicle_id) {

        const selectedVehicle = vehicles?.find?.(
          (vehicle) => vehicle.vehicle_id == option.vehicle_id
        );

        setLoadingSlip((currState) => {
          return {
            ...currState,
            vehicleNo: selectedVehicle?.vehicleno,
            // vehicleOwner: selectedVehicle?.name[0],
            // vehicleOwnerAddress: `${selectedVehicle?.address[0]}`,
            // vehicleOwnerPhone: selectedVehicle?.phone[0],
          };
        });
      } else {
        setLoadingSlip((currState) => {
          return {
            ...currState,
            vehicleNo: "",
            // vehicleOwner: "",
            // vehicleOwnerAddress: "",
            // vehicleOwnerPhone: "",
          };
        });
      }
    }

    if (name === "vehicleOwner") {
      if (option && option.supplier_id) {

        const selectedOwner = suppliers?.find?.(
          (supplier) => supplier.supplier_id == option.supplier_id
        );

        setLoadingSlip((currState) => {
          return {
            ...currState,
            vehicleOwner: selectedOwner,
            vehicleOwnerAddress: `${selectedOwner?.address}`,
            vehicleOwnerPhone: selectedOwner?.phone,
            vehicleOwnerEmail: selectedOwner?.email
          };
        });
      } else {
        setLoadingSlip((currState) => {
          return {
            ...currState,
            vehicleOwner: "",
            vehicleOwnerAddress: "",
            vehicleOwnerPhone: "",
          };
        });
      }
    }

    if (name === "driver") {
      if (option && option.driver_id) {
        const driver = drivers?.find?.((driver) => driver.driver_id == option.driver_id);
        setLoadingSlip((currState) => {
          return {
            ...currState,
            driverName: driver.driver_name,
            licenseNo: driver.licenseno,
            phone: driver.mobileno,
          };
        });
      } else {
        setLoadingSlip((currState) => {
          return {
            ...currState,
            driverName: "",
            licenseNo: "",
            phone: "",
          };
        });
      }
    }
    if (name === "from") {
      if (option && option.place_id) {
        const from = places?.find?.((place) => place.place_id == option.place_id);
        setLoadingSlip((currState) => {
          return {
            ...currState,
            fromName: from.place_name,
          };
        });
      } else {
        setLoadingSlip((currState) => {
          return {
            ...currState,
            fromName: "",
          };
        });
      }
    }

    if (name === "to") {
      if (option && option.place_id) {
        const to = places?.find?.((place) => place.place_id == option.place_id);
        setLoadingSlip((currState) => {
          return {
            ...currState,
            toName: to.place_name,
          };
        });
      } else {
        setLoadingSlip((currState) => {
          return {
            ...currState,
            toName: "",
          };
        });
      }
    }

    if (name === "branch") {
      window.localStorage.setItem("branch", JSON.stringify(option));
      navigate("#", {
        state: option,
      });
    }
  };

  useEffect(() => {
    const hireCost =
      // +loadingSlip.toPay +
      +loadingSlip.hire -
      +loadingSlip.advance -
      +loadingSlip.commission +
      +loadingSlip.hamali
    // +loadingSlip.stacking -
    // const total = +loadingSlip.toPay - hireCost;
    const total = hireCost;
    setLoadingSlip((currState) => {
      return {
        ...currState,
        total: total,
      };
    });
  }, [
    loadingSlip.toPay,
    loadingSlip.hire,
    loadingSlip.advance,
    loadingSlip.commission,
    loadingSlip.hamali,
    loadingSlip.stacking,
  ]);

  const handleCustomSearchFrom = (options, { inputValue }) => {
    return options.filter(option =>
      option.place_name.toLowerCase().startsWith(inputValue.toLowerCase())
    );
  };

  const defaultFocus = useRef();

  useEffect(() => {
    if (defaultFocus.current) {
      defaultFocus.current.querySelector('input').focus();
    }
  }, [])

  const focusTo = (e, id) => {
    if (e.code === 'Tab') {
      setTimeout(() => {
        document.getElementById(id).focus();
      }, 0)
    }
  }

  const handleSearch = () => {
    console.log(isLastPage)
    if (!isLastPage) {
      setPage((page) => page + 1);
    }
  }
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
      {loading && <LoadingSpinner />}
      <h1 className="pageHead">
        {isLocalMemo ? "Add a local memo" : "Add a loading slip"}
      </h1>
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
            <Alert id="alertError" severity="error">
              {httpError}
            </Alert>
          </Stack>
        )}
        <form action="" id="loadingSlipForm">
          <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
            <div className="grid grid-3-col">
              <div className="grid-item">
                <div className="custom-grid">
                  <InputLabel>LS No</InputLabel>
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label=""
                      value={loadingSlip.lsNo}
                      onChange={inputChangeHandler}
                      name="lsNo"
                      id="lsNo"
                    />
                  </FormControl>
                </div>
                {
                  isSuperAdminOrAdmin() ? <div className="custom-grid">
                    <InputLabel>Branch:</InputLabel>
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
                        value={loadingSlip.branch || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(e, value, "branch")
                        }
                        getOptionLabel={(branch) => branch.branch_name}
                        openOnFocus
                        disabled={
                          user &&
                          user.type &&
                          user.type?.toLowerCase?.() !== "superadmin" &&
                          user.type?.toLowerCase?.() !== "admin"
                        }
                        ref={defaultFocus}
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
                  </div> : null
                }

                <div className="custom-grid">
                  <InputLabel>Date:</InputLabel>
                  <FormControl fullWidth error={formErrors.date.invalid}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        error={formErrors.date.invalid}
                        label=""
                        inputFormat="DD/MM/YYYY"
                        value={loadingSlip.date}
                        onChange={dateInputChangeHandler.bind(null, "date")}
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
                <div className="custom-grid">
                  <InputLabel>From</InputLabel>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.from.invalid}
                  >
                    <Autocomplete
                      disablePortal
                      autoSelect
                      size="small"
                      name="from"
                      options={places || []}
                      filterOptions={handleCustomSearchFrom}
                      value={loadingSlip.from || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(e, value, "from")
                      }
                      getOptionLabel={(from) => from.place_name}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={formErrors.from.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.from.invalid && (
                      <FormHelperText>{formErrors.from.message}</FormHelperText>
                    )}
                  </FormControl>
                </div>

              </div>

              <div className="grid-item">
                <div className="custom-grid">
                  <InputLabel>To</InputLabel>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.to.invalid}
                  >
                    <Autocomplete
                      disablePortal
                      autoSelect
                      size="small"
                      name="to"
                      options={places || []}
                      value={loadingSlip.to || null}
                      filterOptions={handleCustomSearchFrom}
                      onChange={(e, value) =>
                        autocompleteChangeListener(e, value, "to")
                      }
                      getOptionLabel={(option) => option.place_name}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={formErrors.to.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.to.invalid && (
                      <FormHelperText>{formErrors.to.message}</FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <InputLabel>Vehicle</InputLabel>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.vehicle.invalid}
                  >
                    <Autocomplete
                      disablePortal
                      autoSelect
                      size="small"
                      name="vehicle"
                      options={vehicles || []}
                      value={loadingSlip.vehicle || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(e, value, "vehicle")
                      }
                      onKeyDown={(e) => focusTo(e, "driver")}
                      getOptionLabel={(option) => option.vehicleno}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={formErrors.vehicle.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.vehicle.invalid && (
                      <FormHelperText>
                        {formErrors.vehicle.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <InputLabel>Supplier</InputLabel>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.vehicle.invalid}
                  >
                    <Autocomplete
                      disablePortal
                      autoSelect
                      size="small"
                      name="vehicleOwner"
                      options={suppliers || []}
                      value={loadingSlip.vehicleOwner || null}
                      getOptionLabel={option => option.name}
                      onChange={(e, value) =>
                        autocompleteChangeListener(e, value, "vehicleOwner")
                      }

                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={formErrors.vehicleOwner.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.vehicleOwner.invalid && (
                      <FormHelperText>
                        {formErrors.vehicleOwner.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>

                <div className="custom-grid">
                  <InputLabel>Supplier address</InputLabel>
                  <FormControl
                    fullWidth
                    error={formErrors.vehicleOwnerAddress.invalid}
                  >
                    <TextField
                      size="small"
                      variant="outlined"
                      label=""
                      error={formErrors.vehicleOwnerAddress.invalid}
                      value={loadingSlip.vehicleOwnerAddress}
                      onChange={inputChangeHandler}
                      name="vehicleOwnerAddress"
                      id="vehicleOwnerAddress"
                      inputProps={{ readOnly: true }}
                    />
                    {formErrors.vehicleOwnerAddress.invalid && (
                      <FormHelperText>
                        {formErrors.vehicleOwnerAddress.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>

              </div>


              <div className="grid-item">
                <div className="custom-grid">
                  <InputLabel>Driver</InputLabel>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.driver.invalid}
                  >
                    <Autocomplete
                      disablePortal
                      autoSelect
                      size="small"
                      name="driver"
                      options={drivers || []}
                      value={loadingSlip.driver || null}
                      getOptionLabel={option => option.driver_name}
                      onChange={(e, value) =>
                        autocompleteChangeListener(e, value, "driver")
                      }
                      id="driver"
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={formErrors.driver.invalid}
                          fullWidth
                        />
                      )}
                    />
                    {formErrors.driver.invalid && (
                      <FormHelperText>{formErrors.driver.message}</FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <InputLabel>License no</InputLabel>
                  <FormControl fullWidth error={formErrors.licenseNo.invalid}>
                    <TextField
                      size="small"
                      variant="outlined"
                      label=""
                      value={loadingSlip.licenseNo}
                      error={formErrors.licenseNo.invalid}
                      onChange={inputChangeHandler}
                      name="licenseNo"
                      id="licenseNo"
                    // inputProps={{ readOnly: true }}
                    />
                    {formErrors.licenseNo.invalid && (
                      <FormHelperText>
                        {formErrors.licenseNo.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <InputLabel>Mobile</InputLabel>
                  <FormControl fullWidth error={formErrors.phone.invalid}>
                    <TextField
                      size="small"
                      variant="outlined"
                      label=""
                      value={loadingSlip.phone}
                      error={formErrors.phone.invalid}
                      onChange={inputChangeHandler}
                      onInput={validatePhoneNumber}
                      name="phone"
                      id="phone"
                      inputProps={{ readOnly: true }}
                    />
                    {formErrors.phone.invalid && (
                      <FormHelperText>{formErrors.phone.message}</FormHelperText>
                    )}
                  </FormControl>
                </div>

              </div>
            </div>
          </Paper>
        </form>
        <h2 className="mb20">Freight details</h2>
        {formErrors.lrList.invalid && (
          <p className="error">{formErrors.lrList.message}</p>
        )}
        <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
          <FreightDetails
            loadingSlip={loadingSlip}
            setLoadingSlip={setLoadingSlip}
            customers={customers}
            lorryReceipts={lorryReceipts}
            branches={branches}
            places={places}
            handleSearch={handleSearch}
            handleFreightDetails={handleFreightDetails}
            defaultcheck={defaultcheck}
            rowsData={rowsData}
          />
          <Divider sx={{ margin: "20px 0" }} />
          <form action="" onSubmit={saveAndPrint} id="loadingSlipForm">
            <h3 className="mb20">Charges</h3>
            <div className="grid grid-8-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.toPay.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="LR billing total"
                    value={loadingSlip.toPay || ""}
                    error={formErrors.toPay.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="toPay"
                    id="toPay"
                    inputProps={{
                      readOnly: true,
                    }}
                  />
                  {formErrors.toPay.invalid && (
                    <FormHelperText>{formErrors.toPay.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.hire.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Hire"
                    value={loadingSlip.hire}
                    error={formErrors.hire.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="hire"
                    id="hire"
                  />
                  {formErrors.hire.invalid && (
                    <FormHelperText>{formErrors.hire.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.advance.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Advance (deduct)"
                    value={loadingSlip.advance}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="advance"
                    id="advance"
                  />
                  {formErrors.advance.invalid && (
                    <FormHelperText>
                      {formErrors.advance.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.commission.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Commission"
                    value={loadingSlip.commission}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="commission"
                    id="commission"
                  />
                  {formErrors.commission.invalid && (
                    <FormHelperText>
                      {formErrors.commission.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.hamali.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Hamali"
                    value={loadingSlip.hamali}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="hamali"
                    id="hamali"
                  />
                  {formErrors.hamali.invalid && (
                    <FormHelperText>{formErrors.hamali.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              {/* <div className="grid-item">
                <FormControl fullWidth error={formErrors.stacking.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Stacking"
                    value={loadingSlip.stacking}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="stacking"
                    id="stacking"
                  />
                  {formErrors.stacking.invalid && (
                    <FormHelperText>
                      {formErrors.stacking.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div> */}
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.total.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Total"
                    value={loadingSlip.total}
                    onChange={inputChangeHandler}
                    name="total"
                    id="total"
                    inputProps={{ readOnly: true }}
                  />
                  {formErrors.total.invalid && (
                    <FormHelperText>{formErrors.total.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
            </div>
          </form>
        </Paper>
        <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
          <form action="" onSubmit={submitHandler} id="loadingSlipForm">
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Remark"
                    value={loadingSlip.remark}
                    onChange={inputChangeHandler}
                    name="remark"
                    id="remark"
                    inputProps={{ maxLength: 200 }}
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
                    name="emailConsigner"
                    checked={checkboxes.emailConsigner}
                    onChange={handleCheckboxChange}
                    size="small"
                  />
                }
                label="Supplier Mail"
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
        form="loadingSlipForm"
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
                form="loadingSlipForm"
                className="ml6"
                onClick={saveAndPrint}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={backButtonHandler}
                className="ml6"
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
            </div>
          </div>
        </Paper>
        <CustomSnackbar
          open={isConfirmationopen}
          message={confirmmessage}
          onClose={() => setConfirmationopen(false)}
          color={snackColour}
        />
      </div>
    </>
  );
};

export default LoadingSlipAdd;
