import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  InputAdornment,
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
import TransactionDetails from "./TransactionDetails";

import {
  DELIVERY_TYPES,
  PAY_TYPES,
  TO_BILLED,
  SERVICE_TAX_BY,
  PAY_MODE,
} from "../../../../services/constants";
import {
  base64ToObjectURL,
  validateNumber,
} from "../../../../services/utils";
import {
  downloadLorryReceipt,
  getLorryReceipt,
  selectIsLoading,
  updateLorryReceipt,
  getCustomers
} from "./slice/lorryReceiptSlice";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

const initialState = {
  branch: "",
  vehicleNo: null,
  deliveryAt: null,
  deliveryAddress: "",
  deliveryCity: "",
  lrNo: "",
  paidPay: "",
  date: new Date(),
  invoiceNo: "",
  eWayBillNo: "",
  foNum: "",
  consignor: null,
  consignorAddress: "",
  consignorPhone: "",
  consignorEmail: "",
  consignorGst: "",
  consignee: null,
  consigneeAddress: "",
  consigneePhone: "",
  consigneeEmail: "",
  consigneeGst: "",
  from: "",
  to: "",
  totalFreight: "",
  hamali: "",
  deliveryCharges: "",
  otherCharges: "",
  lrCharges: "",
  osc: "",
  statistical: "",
  total: "",
  materialCost: "",
  deliveryInDays: "",
  deliveryType: null,
  collectAt: null,
  payMode: null,
  bankName: "",
  chequeNo: "",
  chequeDate: null,
  remark: "",
  transactions: [],
  payType: null,
  toBilled: null,
  serviceTaxBy: null,
};

const initialErrorState = {
  branch: {
    invalid: false,
    message: "",
  },
  vehicleNo: {
    invalid: false,
    message: "",
  },
  date: {
    invalid: false,
    message: "",
  },
  consignor: {
    invalid: false,
    message: "",
  },
  consignorAddress: {
    invalid: false,
    message: "",
  },
  consignorPhone: {
    invalid: false,
    message: "",
  },
  consignorEmail: {
    invalid: false,
    message: "",
  },
  from: {
    invalid: false,
    message: "",
  },
  consignee: {
    invalid: false,
    message: "",
  },
  consigneeAddress: {
    invalid: false,
    message: "",
  },
  consigneePhone: {
    invalid: false,
    message: "",
  },
  consigneeEmail: {
    invalid: false,
    message: "",
  },
  to: {
    invalid: false,
    message: "",
  },
  totalFreight: {
    invalid: false,
    message: "",
  },
  lrCharges: {
    invalid: false,
    message: "",
  },
  payType: {
    invalid: false,
    message: "",
  },
  payMode: {
    invalid: false,
    message: "",
  },
  bankName: {
    invalid: false,
    message: "",
  },
  chequeNo: {
    invalid: false,
    message: "",
  },
  chequeDate: {
    invalid: false,
    message: "",
  },
  transactionDetails: {
    invalid: false,
    message: "",
  },
};
let isShift = false;
const LorryReceiptEdit = () => {
  const isLoading = useSelector(selectIsLoading);
  const { articles, customers, branches, places, vehicles } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );

  const [lorryReceipt, setLorryReceipt] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [checkboxes, setCheckboxes] = useState({
    whatsapp: false,
    emailConsigner: false,
    emailConsignee: false,
    print: true,
  });
  const [isConfirmationopen, setConfirmationopen] = useState(false);
  const [confirmmessage, setConfirmmessage] = useState("")
  const [snackColour, setColor] = useState("")
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { lrId } = location.state;
  const [screenSize, setScreenSize] = useState(1500);
  const [IsLoading, setIsLoading] = useState(false)
  const [checkMsg, setCheckMsg] = useState(false)
  const [checkTotalFr, setCheckTotalFr] = useState(true)
  const [isTrUpdated, setIsTrUpdated] = useState(false)

  useEffect(() => {
    setScreenSize(window.outerWidth);
    dispatch(getCustomers());
    // dispatch(getVehicles());
  }, []);

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
    if (lrId && lrId !== "") {
      setIsLoading(true)
      dispatch(getLorryReceipt(lrId))
        .then(({ payload = {} }) => {
          console.log("LR Data test : ", payload)
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            const updatedResponse = { ...payload?.data };
            if (updatedResponse.vehicleNo) {
              const vehicle = vehicles?.find?.(
                ({ vehicle_id }) => vehicle_id == updatedResponse.vehicleNo
              );
              updatedResponse.vehicleNo = vehicle;
            }
            if (payload?.data.deliveryType) {
              // const deliveryTypeIndex = DELIVERY_TYPES?.map?.(
              //   (type) => type.value
              // )?.indexOf?.(payload?.data.deliveryType);
              // console.log("di", deliveryTypeIndex)
              // const deliveryType = DELIVERY_TYPES[deliveryTypeIndex];
              // updatedResponse.deliveryType = deliveryType;
              const deliveryType = DELIVERY_TYPES[payload?.data.deliveryType];
              updatedResponse.deliveryType = deliveryType;
            }

            if (payload?.data.payType) {
              // const payTypeIndex = PAY_TYPES?.map?.(
              //   (type) => type.label
              // )?.indexOf?.(payload?.data.payType);
              // const payType = PAY_TYPES[payTypeIndex];
              // updatedResponse.payType = payType;
              const payType = PAY_TYPES[payload?.data.payType];
              updatedResponse.payType = payType;
            }

            if (payload?.data.toBilled) {
              // const toBilledType = TO_BILLED?.map?.(
              //   (type) => type.label
              // )?.indexOf?.(payload?.data.toBilled);
              // const toBilled = TO_BILLED[toBilledType];
              // updatedResponse.toBilled = toBilled;
              const toBilled = TO_BILLED[payload?.data.toBilled];
              updatedResponse.toBilled = toBilled;
            }

            updatedResponse.collectAt = branches?.find?.(
              ({ branch_id }) => branch_id == updatedResponse.collectAt
            );

            if (payload?.data.serviceTaxBy) {
              // const serviceTaxByIndex = SERVICE_TAX_BY?.map?.(
              //   (client) => client.label
              // )?.indexOf?.(payload?.data.serviceTaxBy);
              // const serviceTaxBy = SERVICE_TAX_BY[serviceTaxByIndex];
              // updatedResponse.serviceTaxBy = serviceTaxBy;
              const serviceTaxBy = SERVICE_TAX_BY[payload?.data.serviceTaxBy];
              updatedResponse.serviceTaxBy = serviceTaxBy;
            }

            updatedResponse.consignorEmail = updatedResponse.consignor?.emailid;
            updatedResponse.consigneeEmail = updatedResponse.consignee?.emailid;
            updatedResponse.consignorGst = updatedResponse.consignor?.gstNo;
            updatedResponse.consigneeGst = updatedResponse.consignee?.gstNo;

            if (updatedResponse.payMode) {
              const payModeIndex = PAY_MODE?.map?.(
                (mode) => mode.value
              )?.indexOf?.(payload?.data.payMode);
              updatedResponse.payMode = PAY_MODE[payModeIndex];
            }
            updatedResponse.branch = branches?.find?.(
              ({ branch_id }) => branch_id == updatedResponse.branch
            );

            updatedResponse.from = places?.find?.(
              ({ place_id }) => place_id == updatedResponse.from
            );

            updatedResponse.to = places?.find?.(
              ({ place_id }) => place_id == updatedResponse.to
            );

            updatedResponse.deliveryCity = places?.find?.(
              ({ place_id }) => place_id == updatedResponse.deliveryCity
            );

            console.log("set Data : ", updatedResponse)

            setLorryReceipt(updatedResponse);
          }
          setIsLoading(false)
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [lrId, places]);

  const goToLorryReceipts = useCallback(() => {
    navigate("/transactions/lorryReceipts");
  }, [navigate]);
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({
      ...checkboxes,
      [name]: checked,
    });
  };
  useEffect(() => {
    // let totalFreight = 0;
    // if (lorryReceipt.transactions?.length) {
    //   lorryReceipt.transactions?.forEach?.((transaction) => {
    //     totalFreight += +transaction.freight;
    //   });
    // }
    setLorryReceipt(prev => {
      return {
        ...prev,
        // statistical: prev.totalFreight ? 25 : ""
      }
    })
  }, [lorryReceipt.transactions]);

  useEffect(() => {
    const total =
      +lorryReceipt.totalFreight +
      +lorryReceipt.deliveryCharges +
      +lorryReceipt.statistical +
      +lorryReceipt.osc +
      +lorryReceipt.otherCharges +
      +lorryReceipt.hamali;
    setLorryReceipt((currentState) => {
      return {
        ...currentState,
        total: total,
      };
    });
  }, [
    lorryReceipt.totalFreight,
    lorryReceipt.deliveryCharges,
    lorryReceipt.statistical,
    lorryReceipt.hamali,
    lorryReceipt.osc,
    lorryReceipt.otherCharges,
  ]);

  const backButtonHandler = () => {
    goToLorryReceipts();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: name === "consignorGst" || name === "consigneeGst" ? value.toUpperCase() : value,
      };
    });
  };

  const deliveryChangeHandler = (e, value) => {
    if (value) {
      if (typeof value === "object") {
        setLorryReceipt((currState) => {
          return {
            ...currState,
            deliveryAt: value,
            deliveryAddress: value.address,
            deliveryCity: places?.find?.(({ place_name }) => place_name === value.city)
          };
        });
      }
    } else {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          deliveryAt: null,
          deliveryAddress: "",
          deliveryCity: ""
        };
      });
    }
  };

  const submitHandler = (e, isSaveAndPrint, isWithoutAmount = false) => {
    e.preventDefault();
    // console.log("before update : ", lorryReceipt)
    if (!validateForm(lorryReceipt)) {
      const updatedLR = {
        ...lorryReceipt,
        branch: lorryReceipt?.branch?.branch_id,
        user: user?.employee?.emp_id || "",
      };
      console.log(updatedLR.consignor)
      if (updatedLR.consignor) {
        updatedLR.consignor = updatedLR.consignor?.customer_id || null;
        updatedLR.consignee = updatedLR.consignee?.customer_id || null;
      }
      if (updatedLR.deliveryType) {
        updatedLR.deliveryType = updatedLR.deliveryType.value;
      }
      if (updatedLR.payType) {
        updatedLR.payType = updatedLR.payType.value;
      }
      if (updatedLR.toBilled) {
        updatedLR.toBilled = updatedLR.toBilled.value;
      }
      if (updatedLR.collectAt) {
        updatedLR.collectAt = updatedLR.collectAt?.branch_id || null;
      }
      if (updatedLR.serviceTaxBy) {
        updatedLR.serviceTaxBy = updatedLR.serviceTaxBy.value;
      }
      updatedLR.transactions?.forEach?.((transaction) => {
        transaction.article = transaction.article.label
          ? transaction.article.label
          : transaction.article;
        transaction.rateType = transaction.rateType.label
          ? transaction.rateType.label
          : transaction.rateType;
      });
      if (updatedLR.deliveryAt) {
        updatedLR.deliveryAt = updatedLR.deliveryAt?.customer_id;
      }
      if (updatedLR.vehicleNo) {
        updatedLR.vehicleNo = updatedLR.vehicleNo.vehicle_id;
      }
      if (updatedLR.payMode) {
        updatedLR.payMode = updatedLR.payMode.value;
      }

      updatedLR.from = updatedLR?.from?.place_id || null;
      updatedLR.to = updatedLR?.to?.place_id || null;
      updatedLR.deliveryCity = updatedLR?.deliveryCity?.place_id || null;


      dispatch(updateLorryReceipt(updatedLR))
        .then(({ payload = {} }) => {
          const { inserted_id, message } = payload?.data?.[0] || {};
          // const message = payload?.data?.[0]?.[0]?.message

          console.log("payload data : ", payload)
          if (message == "Something Went Wrong!") {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('error')
            //setIsLoading(false)
            return
          }
          if (checkboxes.emailConsigner) {

            if (inserted_id) {
              dispatch(
                downloadLorryReceipt({
                  id: inserted_id,
                  email: lorryReceipt.consignorEmail,
                  isWithoutAmount,
                  user: user?.employee?.employee_name || "",
                })
              )
                .then(({ payload = {} }) => {

                  const fileURL = base64ToObjectURL(payload?.data?.file);

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
          if (checkboxes.emailConsignee) {

            if (inserted_id) {
              dispatch(
                downloadLorryReceipt({
                  id: inserted_id,
                  email: lorryReceipt.consigneeEmail,
                  isWithoutAmount,
                  user: user?.employee?.employee_name || "",
                })
              )
                .then(({ payload = {} }) => {

                  const fileURL = base64ToObjectURL(payload?.data?.file);

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

              dispatch(
                downloadLorryReceipt({
                  id: inserted_id,
                  email: "",
                  isWithoutAmount,
                  user: user?.employee?.employee_name || "",
                })
              )
                .then(({ payload = {} }) => {

                  const fileURL = base64ToObjectURL(payload?.data?.file);
                  if (fileURL) {
                    const winPrint = window.open(fileURL, "_blank");
                    winPrint.focus();
                    winPrint.print();

                    setHttpError("");
                    setFormErrors(initialErrorState);
                    setLorryReceipt(initialState);
                    // window.location.reload();
                  }
                })
                .catch((e) => {
                  setConfirmmessage(e.message);
                  setConfirmationopen(true);
                  setColor('error')
                  // setHttpError(e.message);
                });
            }
          } else {
            setHttpError("");
            // setFormErrors(initialErrorState);
            // setLorryReceipt(initialState);
          }

          if (message) {
            setConfirmmessage(message);
            setConfirmationopen(true);
            setColor('green')
            // setCheckMsg(true)
            setTimeout(() => {
              goToLorryReceipts();
            }, 1500)
            // goToLorryReceipts();
            //  setLrNo(lrNum);
            //   handleClickOpen();
          }
          else {
            setHttpError("");
            setFormErrors(initialErrorState);
            setLorryReceipt(initialState);
            // goToLorryReceipts();
          }
          // goToLorryReceipts();
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }

  };
  if (checkMsg) {
    goToLorryReceipts();
  }
  const saveAndPrint = (e) => {
    e.preventDefault();
    if (!validateForm(lorryReceipt)) {
      const updatedLR = {
        ...lorryReceipt,
        branch: lorryReceipt?.branch?.branch_id,
        user: user?.employee?.emp_id || "",
      };
      console.log(updatedLR.consignor)
      if (updatedLR.consignor) {
        updatedLR.consignor = updatedLR.consignor?.customer_id || null;
        updatedLR.consignee = updatedLR.consignee?.customer_id || null;
      }
      if (updatedLR.deliveryType) {
        updatedLR.deliveryType = updatedLR.deliveryType.value;
      }
      if (updatedLR.payType) {
        updatedLR.payType = updatedLR.payType.value;
      }
      if (updatedLR.toBilled) {
        updatedLR.toBilled = updatedLR.toBilled.value;
      }
      if (updatedLR.collectAt) {
        updatedLR.collectAt = updatedLR.collectAt?.branch_id || null;
      }
      if (updatedLR.serviceTaxBy) {
        updatedLR.serviceTaxBy = updatedLR.serviceTaxBy.value;
      }
      updatedLR.transactions?.forEach?.((transaction) => {
        transaction.article = transaction.article.label
          ? transaction.article.label
          : transaction.article;
        transaction.rateType = transaction.rateType.label
          ? transaction.rateType.label
          : transaction.rateType;
      });
      if (updatedLR.deliveryAt) {
        updatedLR.deliveryAt = updatedLR.deliveryAt?.customer_id;
      }
      if (updatedLR.vehicleNo) {
        updatedLR.vehicleNo = updatedLR.vehicleNo.vehicle_id;
      }
      if (updatedLR.payMode) {
        updatedLR.payMode = updatedLR.payMode.value;
      }

      updatedLR.from = updatedLR?.from?.place_id || null;
      updatedLR.to = updatedLR?.to?.place_id || null;
      updatedLR.deliveryCity = updatedLR?.deliveryCity?.place_id || null;


      dispatch(updateLorryReceipt(updatedLR))
        .then(({ payload = {} }) => {
          const { inserted_id, message } = payload?.data?.[0] || {};
          // const message = payload?.data?.[0]?.[0]?.message

          console.log("payload data : ", payload)
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
            // setCheckMsg(true)
            setTimeout(() => {
              goToLorryReceipts();
            }, 1500)
            // goToLorryReceipts();
            //  setLrNo(lrNum);
            //   handleClickOpen();
          }
          else {
            setHttpError("");
            setFormErrors(initialErrorState);
            setLorryReceipt(initialState);
            // goToLorryReceipts();
          }
          // goToLorryReceipts();
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
    if (!formData.vehicleNo) {
      errors.vehicleNo = {
        invalid: true,
        message: "Vehicle number is required",
      };
    }
    if (!formData.consignor) {
      errors.consignor = { invalid: true, message: "Consignor is required" };
    }
    if (!formData.from) {
      errors.from = { invalid: true, message: "From is required" };
    }
    if (!formData.consignee) {
      errors.consignee = { invalid: true, message: "Consignee is required" };
    }
    if (!formData.to) {
      errors.to = { invalid: true, message: "To is required" };
    }
    if (!formData.deliveryType) {
      errors.deliveryType = {
        invalid: true,
        message: "Delivery type is required",
      };
    }
    if (formData.materialCost && isNaN(formData.materialCost)) {
      errors.materialCost = {
        invalid: true,
        message: "Material cost should be a number",
      };
    }
    if (formData.deliveryInDays && isNaN(formData.deliveryInDays)) {
      errors.deliveryInDays = {
        invalid: true,
        message: "Delivery (in days) should be a number",
      };
    }
    if (!formData.transactions.length) {
      errors.transactionDetails = {
        invalid: true,
        message: "At lease 1 transaction is required",
      };
    }
    if (formData.osc && isNaN(formData.osc)) {
      errors.osc = { invalid: true, message: "OSC should be a number" };
    }
    if (formData.deliveryCharges && isNaN(formData.deliveryCharges)) {
      errors.deliveryCharges = {
        invalid: true,
        message: "Delivery charges should be a number",
      };
    }
    if (formData.otherCharges && isNaN(formData.otherCharges)) {
      errors.otherCharges = {
        invalid: true,
        message: "Other charges should be a number",
      };
    }
    if (formData.hamali && isNaN(formData.hamali)) {
      errors.hamali = {
        invalid: true,
        message: "Varai/Hamali should be a number",
      };
    }
    if (formData.statistical && isNaN(formData.statistical)) {
      errors.statistical = {
        invalid: true,
        message: "Statistical should be a number",
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
    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: new Date(date),
      };
    });
  };

  const consignorChangeHandler = (e, value) => {
    if (value) {
      if (typeof value === "object") {
        setLorryReceipt((currState) => {
          return {
            ...currState,
            consignor: value,
            consignorName: value.label,
            consignorAddress: value.address,
            consignorPhone: value.telephoneno,
            consignorEmail: value.emailid,
            consignorGst: value.gstno,
            from: places?.find?.(({ place_name }) => place_name === value.city)
          };
        });
      }
    } else {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          consignor: null,
          consignorName: "",
          consignorAddress: "",
          consignorPhone: "",
          consignorEmail: "",
          consignorGst: "",
          from: ""
        };
      });
    }
  };

  const fromChangeHandler = (e, value) => {
    if (value) {
      if (typeof value === "object") {
        setLorryReceipt((currState) => {
          return {
            ...currState,
            from: value,
          };
        });
      }
    } else {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          from: "",
        };
      });
    }

  };

  const toChangeHandler = (e, value) => {
    if (value) {
      if (typeof value === "object") {
        setLorryReceipt((currState) => {
          return {
            ...currState,
            to: value,
          };
        });
      }
    } else {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          to: "",
        };
      });
    }

  };

  const cityChangeHandler = (e, value) => {
    if (value) {
      if (typeof value === "object") {
        setLorryReceipt((currState) => {
          return {
            ...currState,
            deliveryCity: value,
          };
        });
      }
    } else {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          deliveryCity: "",
        };
      });
    }

  };

  const consigneeChangeHandler = (e, value) => {
    if (value) {

      if (typeof value === "object") {
        setLorryReceipt((currState) => {
          return {
            ...currState,
            consignee: value,
            consigneeName: value.label,
            consigneeAddress: value.address,
            consigneePhone: value.telephoneno,
            consigneeEmail: value.emailid,
            consigneeGst: value.gstno,
            to: places?.find?.(({ place_name }) => place_name === value.city)
          };
        });
      }
    } else {
      setLorryReceipt((currState) => {
        return {
          ...currState,
          consignee: null,
          consigneeName: "",
          consigneeAddress: "",
          consigneePhone: "",
          consigneeEmail: "",
          consigneeGst: "",
          to: ""
        };
      });
    }
  };

  const autocompleteChangeListener = (e, option, name) => {

    if (!option) {
      console.error("Invalid value passed to autocompleteChangeListener");
      return;
    }

    if (name === "branch") {
      window.localStorage.setItem("branch", JSON.stringify(option));
      navigate("#", {
        state: option,
      });
    }

    setLorryReceipt((currState) => {
      return {
        ...currState,
        [name]: option,
        ...(name === "branch"
          ? {
            collectAt: option,
          }
          : {}),
      };
    });
  };

  // useEffect(() => {
  //   setLorryReceipt(prev => {
  //     return {
  //       ...prev,
  //       totalFreight: lorryReceipt.transactions.reduce((total, num) => total + Math.round(Number(num.freight)), 0)
  //     }
  //   })
  // }, [lorryReceipt.transactions])


  useEffect(() => {
    if (isTrUpdated) {
      setLorryReceipt(prev => {
        return {
          ...prev,
          totalFreight: lorryReceipt.transactions.reduce((total, num) => total + Math.round(Number(num.freight)), 0)
        }
      })
    }
    setIsTrUpdated(false)
  }, [isTrUpdated, lorryReceipt.transactions])



  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({ searchName: target.value }));
  };

  const gotoFreight = () => {
    document.getElementById('totalFreight').focus();
  }

  const handleFocusChange = (e) => {
    if (e.code === "Tab") {
      document.getElementById('invoiceNo').focus();
    }
  }

  const dateRef = useRef();

  useEffect(() => {
    const input = dateRef.current.querySelector('input');
    input.focus();
  }, []);

  const handleFocusUpdate = (e, id) => {
    if (e.code === "Tab") {
      console.log(document.getElementById(id))
      setTimeout(() => {
        document.getElementById(id).focus();
      }, 100);
    }
  }

  const handleFocusUpdateShift = (e, id) => {
    if (e.code === "ShiftLeft") {
      isShift = true;
    }

    if (e.code === "Tab" && isShift) {
      setTimeout(() => {
        document.getElementById(id).focus();
        isShift = false;
      }, 100);
    }
  }

  return (
    <>
      {(isLoading || IsLoading) && <LoadingSpinner />}

      <div className="page_head">
        <h1 className="pageHead">Edit a lorry receipt</h1>
        <div className="page_actions">
          {user.type.toLowerCase() === "superadmin" ? (
            <FormControl
              style={{ width: 200 }}
              size="small"
              error={formErrors.branch.invalid}
            >
              <Autocomplete
                disablePortal
                size="small"
                name="branch"
                className="multi-select"
                options={branches || []}
                value={lorryReceipt.branch || null}
                onChange={(e, value) =>
                  autocompleteChangeListener(e, value, "branch")
                }
                getOptionLabel={(branch) => branch.branch_name || ""}
                openOnFocus
                disabled={
                  user &&
                  user.type &&
                  user.type?.toLowerCase?.() !== "superadmin"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Branch"
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

          ) : null}
        </div>
      </div>
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
        <form action="" onSubmit={saveAndPrint} id="lorryReceiptForm">
          <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
            <div className={`grid grid-${screenSize >= 1312 ? 3 : screenSize >= 892 ? 2 : 1}-col`}>
              <div className="grid-item">

                <div style={{ justifyContent: 'flex-end' }} className="custom-grid">
                  <div className="lr-wrapper">
                    <div className="item">
                      <label style={{ width: 50 }}>LR no. : </label>
                      <FormControl style={{ width: 150 }}>
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="LR no."
                          value={lorryReceipt.lrNo}
                          onChange={inputChangeHandler}
                          name="lrNo"
                          id="lrNo"
                          inputProps={{
                            readOnly: true,
                          }}
                          disabled
                        />
                      </FormControl>
                    </div>
                    <div className="item">
                      <label htmlFor="">Date: </label>
                      <FormControl style={{ width: 190 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            placeholder="Date"
                            inputFormat="DD/MM/YYYY"
                            value={lorryReceipt.date}
                            ref={dateRef}
                            onChange={dateInputChangeHandler.bind(null, "date")}
                            renderInput={(params) => (
                              <TextField name="date" size="small" {...params} onKeyUp={handleFocusChange} />)}
                          />
                        </LocalizationProvider>
                      </FormControl>
                    </div>
                  </div>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">Consignor:</label>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.consignor.invalid}
                  >
                    <Autocomplete
                      id="consignor"
                      disablePortal
                      size="small"
                      name="consignor"
                      options={customers || []}
                      value={lorryReceipt.consignor || null}
                      onChange={(e, value) => consignorChangeHandler(e, value)}
                      onBlur={() => dispatch(getCustomers())}
                      openOnFocus
                      getOptionLabel={option => option.customer_name || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 3 }}
                          placeholder="Consignor"
                          name="consignor"
                          onChange={(e) => customerFilterOptions(e)}
                          error={formErrors.consignor.invalid}
                          fullWidth
                        />
                      )}
                    />
                  </FormControl>
                </div>
                {formErrors.consignor.invalid && (
                  <FormHelperText>
                    {formErrors.consignor.message}
                  </FormHelperText>
                )}
                <div className="custom-grid">
                  <label htmlFor="">Consignor GST no:</label>
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Consignor GST no"
                      disabled
                      value={lorryReceipt.consignorGst}
                      onChange={inputChangeHandler}
                      name="consignorGst"
                      id="consignorGst"
                      inputProps={{ tabIndex: 4 }}
                    />
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">Address:</label>
                  <FormControl
                    fullWidth
                    error={formErrors.consignorAddress.invalid}
                  >
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Consignor address"
                      value={lorryReceipt.consignorAddress}
                      error={formErrors.consignorAddress.invalid}
                      onChange={inputChangeHandler}
                      name="consignorAddress"
                      id="consignorAddress"
                      inputProps={{ tabIndex: 5 }}
                    />

                  </FormControl>
                </div>
                {formErrors.consignorAddress.invalid && (
                  <FormHelperText>
                    {formErrors.consignorAddress.message}
                  </FormHelperText>
                )}
                <div className="custom-grid">
                  <label htmlFor="">From:</label>
                  <FormControl fullWidth error={formErrors.from.invalid}>
                    <Autocomplete
                      id="from"
                      freeSolo
                      autoSelect
                      size="small"
                      name="from"
                      options={places || []}
                      value={lorryReceipt.from}
                      onChange={(e, value) => fromChangeHandler(e, value)}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 6 }}
                          placeholder="From"
                          name="from"
                          error={formErrors.from.invalid}
                          fullWidth
                        />
                      )}
                    />

                  </FormControl>
                </div>
                {formErrors.from.invalid && (
                  <FormHelperText>{formErrors.from.message}</FormHelperText>
                )}
              </div>

              <div className="grid-item">
                <div className="custom-grid">
                  <label htmlFor="">Invoice No:</label>
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Invoice no"
                      value={lorryReceipt.invoiceNo}
                      onChange={inputChangeHandler}
                      name="invoiceNo"
                      id="invoiceNo"
                      inputProps={{ maxLength: 400, tabIndex: 1 }}
                    />
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">Consignee:</label>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.consignee.invalid}
                  >
                    <Autocomplete
                      id="consignee"
                      disablePortal
                      size="small"
                      name="consignee"
                      options={customers || []}
                      value={lorryReceipt.consignee || null}
                      onBlur={() => dispatch(getCustomers())}
                      onChange={(e, value) => consigneeChangeHandler(e, value)}
                      getOptionLabel={option => option.customer_name || ""}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 7 }}
                          placeholder="Consignee"
                          name="consignee"
                          onChange={(e) => customerFilterOptions(e)}
                          error={formErrors.consignee.invalid}
                          fullWidth
                        />
                      )}
                    />

                  </FormControl>
                </div>
                {formErrors.consignee.invalid && (
                  <FormHelperText>
                    {formErrors.consignee.message}
                  </FormHelperText>
                )}
                <div className="custom-grid">
                  <label htmlFor="">Consignee GST no:</label>
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Consignee GST no"
                      disabled
                      value={lorryReceipt.consigneeGst}
                      onChange={inputChangeHandler}
                      name="consigneeGst"
                      id="consigneeGst"
                      inputProps={{ tabIndex: 8 }}
                    />
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">Address:</label>
                  <FormControl
                    fullWidth
                    error={formErrors.consigneeAddress.invalid}
                  >
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Consignee address"
                      value={lorryReceipt.consigneeAddress}
                      error={formErrors.consigneeAddress.invalid}
                      onChange={inputChangeHandler}
                      name="consigneeAddress"
                      id="consigneeAddress"
                      inputProps={{ tabIndex: 9 }}
                    />

                  </FormControl>
                </div>
                {formErrors.consigneeAddress.invalid && (
                  <FormHelperText>
                    {formErrors.consigneeAddress.message}
                  </FormHelperText>
                )}
                <div className="custom-grid">
                  <label htmlFor="">To:</label>
                  <FormControl fullWidth error={formErrors.to.invalid}>
                    <Autocomplete
                      id="to"
                      freeSolo
                      autoSelect
                      size="small"
                      name="to"
                      options={places || []}
                      value={lorryReceipt.to}
                      onChange={(e, value) => toChangeHandler(e, value)}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 10 }}
                          placeholder="To"
                          name="to"
                          error={formErrors.to.invalid}
                          fullWidth
                        />
                      )}
                    />
                  </FormControl>
                </div>
                {formErrors.to.invalid && (
                  <FormHelperText>{formErrors.to.message}</FormHelperText>
                )}
              </div>
              {
                screenSize >= 1312 ? null : <div className="grid-item"></div>
              }

              <div className="grid-item">
                <div className="custom-grid">
                  <label htmlFor="">Way bill no:</label>
                  <FormControl fullWidth>

                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Way bill no"
                      value={lorryReceipt.eWayBillNo}
                      onChange={inputChangeHandler}
                      name="eWayBillNo"
                      id="eWayBillNo"
                      inputProps={{ maxLength: 400, tabIndex: 2 }}
                      ta
                    />
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">Truck/Tempo No: </label>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formErrors.vehicleNo.invalid}
                  >
                    <Autocomplete
                      disablePortal
                      size="small"
                      name="vehicleNo"
                      options={vehicles || []}
                      value={lorryReceipt.vehicleNo || null}
                      onChange={(e, value) =>
                        autocompleteChangeListener(e, value, "vehicleNo")
                      }
                      getOptionLabel={(vehicle) => vehicle.vehicleno || ""}
                      openOnFocus
                      autoSelect
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 11 }}
                          placeholder="Truck/Tempo No"
                          name="vehicleNo"
                          error={formErrors.vehicleNo.invalid}
                          fullWidth
                        />
                      )}
                    />

                  </FormControl>
                </div>
                {formErrors.vehicleNo.invalid && (
                  <FormHelperText>
                    {formErrors.vehicleNo.message}
                  </FormHelperText>
                )}
                <div className="custom-grid">
                  <label htmlFor="">Delivery at:</label>
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      id="deliveryAt"
                      disablePortal
                      autoSelect
                      size="small"
                      name="deliveryAt"
                      options={customers || []}
                      value={lorryReceipt.deliveryAt || null}
                      onChange={(e, value) =>
                        deliveryChangeHandler(e, value)
                      }
                      onBlur={() => dispatch(getCustomers())}
                      getOptionLabel={(customer) => customer.customer_name || ""}

                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 12 }}
                          placeholder="Delivery at"
                          onChange={(e) => customerFilterOptions(e)}
                          name="deliveryAt"
                          fullWidth
                        />
                      )}
                    />
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">Address:</label>
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Address"
                      value={lorryReceipt.deliveryAddress}
                      onChange={inputChangeHandler}
                      name="deliveryAddress"
                      id="deliveryAddress"
                      inputProps={{ tabIndex: 13 }}
                    />
                  </FormControl>
                </div>
                <div className="custom-grid">
                  <label htmlFor="">City:</label>
                  <FormControl fullWidth>
                    <Autocomplete
                      id="deliveryCity"
                      freeSolo
                      autoSelect
                      size="small"
                      name="deliveryCity"
                      options={places || []}
                      value={lorryReceipt.deliveryCity}
                      onChange={(e, value) => cityChangeHandler(e, value)}
                      // getOptionLabel={(option)=>option.place_name}
                      openOnFocus
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 14 }}
                          placeholder="City"
                          name="deliveryCity"
                          fullWidth
                        />
                      )}
                    />
                  </FormControl>
                </div>

              </div>


            </div>
          </Paper>
        </form>

        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ width: '80%' }}>
            <h2 className="mb20">Transactions details</h2>
            {formErrors.transactionDetails.invalid && (
              <p className="error">{formErrors.transactionDetails.message}</p>
            )}
            <Paper sx={{ padding: "20px", marginBottom: "20px", minHeight: '350px' }}>
              <TransactionDetails
                articles={articles}
                lorryReceipt={lorryReceipt}
                setLorryReceipt={setLorryReceipt}
                gotoFreight={gotoFreight}
                setIsTrUpdated={setIsTrUpdated}
              />
            </Paper>
          </div>

          <div style={{ width: '20%' }}>
            <h2 className="mb20">&nbsp;</h2>
            <Paper sx={{ padding: "8px 20px 2px 0px" }}>
              <form action="" onSubmit={submitHandler} id="lorryReceiptForm">
                <div style={{ gap: '2px' }} className="grid grid-1-col side-grid">
                  <div className="grid-item">
                    <div className="custom-grid">
                      <InputLabel>Freight:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.totalFreight || ""}
                          name="totalFreight"
                          id="totalFreight"
                          onChange={inputChangeHandler}
                          onInput={validateNumber}
                          InputProps={{
                            // readOnly: true,
                            inputProps: { maxLength: 8 },
                            tabIndex: 25,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>
                    <div className="custom-grid">
                      <InputLabel>Hamali:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.hamali || ""}
                          name="hamali"
                          id="hamali"
                          onChange={inputChangeHandler}
                          onInput={validateNumber}
                          InputProps={{
                            tabIndex: 26,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>
                    <div className="custom-grid">
                      <InputLabel>O.S.C:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.osc}
                          name="osc"
                          id="osc"
                          onChange={inputChangeHandler}
                          onInput={validateNumber}
                          InputProps={{
                            tabIndex: 28,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>
                    <div className="custom-grid">
                      <InputLabel>Coll./Deli:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.deliveryCharges || ""}
                          name="deliveryCharges"
                          id="deliveryCharges"
                          onChange={inputChangeHandler}
                          onInput={validateNumber}
                          InputProps={{
                            tabIndex: 27,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>

                    <div className="custom-grid">
                      <InputLabel>Other:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.otherCharges}
                          name="otherCharges"
                          id="otherCharges"
                          onChange={inputChangeHandler}
                          onInput={validateNumber}
                          InputProps={{
                            tabIndex: 29,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>

                    <div className="custom-grid">
                      <InputLabel>Statistical:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.statistical}
                          name="statistical"
                          id="statistical"
                          onChange={inputChangeHandler}
                          onInput={validateNumber}
                          InputProps={{
                            tabIndex: 30,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>
                    <div className="custom-grid">
                      <InputLabel>Total:</InputLabel>
                      <FormControl>
                        <TextField
                          size="small"
                          type="number"
                          variant="outlined"
                          label=""
                          value={lorryReceipt.total || ""}
                          name="total"
                          id="total"
                          InputProps={{
                            readOnly: true,
                            tabIndex: 31,
                            startAdornment: (
                              <InputAdornment position="start">
                                &#8377;
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormControl>
                    </div>
                  </div>

                </div>
              </form>
            </Paper>
          </div>
        </div>

        <form action="" onSubmit={saveAndPrint} id="lorryReceiptForm">
          <h2 className="mb20">Billing details</h2>
          <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
            <div className="grid grid-6-col">
              <div className="grid-item">
                <label htmlFor="">Material cost</label>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={lorryReceipt.materialCost || ""}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="materialCost"
                    id="materialCost"
                    onKeyDown={(e) => handleFocusUpdate(e, "deliveryType2")}
                    InputProps={{ tabIndex: 32, inputProps: { maxLength: 13 } }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <label htmlFor="">Delivery type</label>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    id="deliveryType2"
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="deliveryType"
                    options={DELIVERY_TYPES || []}
                    value={lorryReceipt.deliveryType}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "deliveryType")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 33 }}
                        name="deliveryType"
                        label=""
                        onKeyDown={(e) => handleFocusUpdateShift(e, "materialCost")}
                        fullWidth
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <label htmlFor="">Delivery (In days)</label>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={lorryReceipt.deliveryInDays || ""}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="deliveryInDays"
                    id="deliveryInDays"
                    inputProps={{ tabIndex: 34 }}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <label htmlFor="">Pay type</label>
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.payType.invalid}
                >
                  <Autocomplete
                    id="payType"
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="payType"
                    options={PAY_TYPES || []}
                    value={lorryReceipt.payType}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "payType")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 35 }}
                        label=""
                        name="payType"
                        error={formErrors.payType.invalid}
                        fullWidth
                      />
                    )}
                  />
                  {formErrors.payType.invalid && (
                    <FormHelperText>
                      {formErrors.payType.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <label htmlFor="">To billed</label>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    id="toBilled"
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="toBilled"
                    options={TO_BILLED || []}
                    value={lorryReceipt.toBilled}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "toBilled")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 36 }}
                        name="toBilled"
                        label=""
                        fullWidth
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <label htmlFor="">Collect at</label>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    id="collectAt"
                    disablePortal
                    disabled={true}
                    autoSelect
                    autoHighlight={true}
                    className="multi-select"
                    size="small"
                    name="collectAt"
                    options={branches || []}
                    value={lorryReceipt.collectAt}
                    getOptionLabel={(option) => option.branch_name || ""}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "collectAt")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 37 }}
                        name="collectAt"
                        label=""
                        fullWidth
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="grid-item">
                <label htmlFor="">Service tax by</label>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    id="serviceTaxBy"
                    disablePortal
                    autoSelect
                    autoHighlight={true}
                    size="small"
                    name="serviceTaxBy"
                    options={SERVICE_TAX_BY || []}
                    value={lorryReceipt.serviceTaxBy}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "serviceTaxBy")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 38 }}
                        name="serviceTaxBy"
                        label=""
                        fullWidth
                      />
                    )}
                  />
                </FormControl>
              </div>

              <div className="grid-item">
                <label htmlFor="">Remark</label>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={lorryReceipt.remark}
                    onChange={inputChangeHandler}
                    name="remark"
                    id="remark"
                    inputProps={{ tabIndex: 39 }}
                  />
                </FormControl>
              </div>
              {

                (lorryReceipt.payType?.value === "2" || lorryReceipt.payType?.value == 2) ? <div style={{ width: "500px" }} className="grid-item">
                  <label htmlFor="">PAID PAYMENT DETAILS</label>
                  <FormControl fullWidth>
                    <TextField
                      size="small"
                      variant="outlined"
                      label=""
                      value={lorryReceipt.paidPay}
                      onChange={inputChangeHandler}
                      name="paidPay"
                      id="paidPay"
                      inputProps={{ tabIndex: 40 }}
                    />
                  </FormControl>
                  <p>Note- Check Details (Check Number, Date, Bank) or UPI ID and Transaction details if through UPI or Cash</p>
                </div> : null
              }

            </div>
          </Paper>
        </form>
        <Paper sx={{ padding: "20px", marginBottom: "20px", display: 'flex', justifyContent: 'space-between' }}>
          <div className="left">
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
              label="Consignor Mail"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="emailConsignee"
                  checked={checkboxes.emailConsignee}
                  onChange={handleCheckboxChange}
                  size="small"
                />
              }
              label="Consignee Mail"
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
          <div className="right">
            <Button
              variant="contained"
              size="medium"
              type="button"
              color="primary"
              form="lorryReceiptForm"
              className="ml6"
              onClick={submitHandler}
              tabIndex={41}
            >
              Save &amp; Print
            </Button>
            <Button
              variant="contained"
              size="medium"
              type="submit"
              color="primary"
              form="lorryReceiptForm"
              className="ml6"
              tabIndex={42}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={backButtonHandler}
              className="ml6"
              tabIndex={43}
            >
              Back
            </Button>

          </div>
          <CustomSnackbar
            open={isConfirmationopen}
            message={confirmmessage}
            onClose={() => setConfirmationopen(false)}
            color={snackColour}
          />
        </Paper>

      </div>
    </>
  );
};

export default LorryReceiptEdit;
