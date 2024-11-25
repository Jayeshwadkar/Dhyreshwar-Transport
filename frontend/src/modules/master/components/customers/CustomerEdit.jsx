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
import { makeStyles } from "@material-ui/core/styles";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  // emailRegEx,
  // mobileNoRegEx,
  states,
  validateNumber,
  validatePhoneNumber,
} from "../../../../services/utils";
import ContactPersonList from "../contact-person/ContactPersonList";
import ContactPersonForm from "../contact-person/ContactPersonForm";
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomer,
  selectIsLoading,
  updateCustomer, getCustomerContactPer
} from "./slice/customerSlice";

const useStyles = makeStyles(() => ({
  menuPaper: {
    maxHeight: 300,
    maxWidth: 100,
  },
}));

const initialState = {
  customer_name: "",
  address: "",
  telephoneno: "",
  faxno: "",
  cst: "",
  gstno: "",
  state: "",
  city: "",
  emailid: "",
  vendor_code: "",
  vatno: "",
  eccno: "",
  contactPerson: [],
  closingbal: "",
  closingbaltype: null,
  openingbal: "",
  openingbaltype: null,
};

const initialErrorState = {
  name: {
    invalid: false,
    message: "",
  },
  address: {
    invalid: false,
    message: "",
  },
  city: {
    invalid: false,
    message: "",
  },
  telephone: {
    invalid: false,
    message: "",
  },
  email: {
    invalid: false,
    message: "",
  },
  contactPerson: {
    invalid: false,
    message: "",
  }
};

const CustomerEdit = () => {
  const [customer, setCustomer] = useState(initialState);
  const [contactPerson, setContactPerson] = useState([])
  const [fetchedCustomer, setFetchedCustomer] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [editContact, setEditContact] = useState(null);
  const isLoading = useSelector(selectIsLoading);
  const { places } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );
  const location = useLocation();
  const { customerId } = location.state;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToCustomersList = useCallback(() => {
    navigate("/master/customers");
  }, [navigate]);

  useEffect(() => {
    if (customerId) {
      dispatch(getCustomer(customerId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          console.log("Customer data : ", payload?.data?.customer[0])
          console.log("Place : ", places)
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            const filterCity = places.filter(place => place.place_name === payload?.data?.customer[0]?.city)
            setCustomer({ ...payload?.data?.customer[0], city: filterCity[0] || null });
            setFetchedCustomer({ ...payload?.data?.customer[0], city: filterCity[0] || null });
            setContactPerson(payload?.data?.contact_person)
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [customerId]);

  const resetButtonHandler = () => {
    setCustomer({ ...fetchedCustomer });
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const backButtonHandler = () => {
    goToCustomersList();
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setCustomer((currState) => {
      return {
        ...currState,
        [name]: name === "customer_name" || name === "gstno" ? value.toUpperCase() : value
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(customer)) {
      if (customer.branch) {
        customer.branch = customer.branch?._id;
      }
      dispatch(updateCustomer({ ...customer, city: customer.city?.place_name, contactPerson: contactPerson }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setCustomer(initialState);
            goToCustomersList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.customer_name?.trim?.()) {
      errors.name = { invalid: true, message: "Customer name is required" };
    }

    if (!formData.city) {
      errors.city = { invalid: true, message: "Customer city is required" };
    }

    if (!formData.address?.trim?.()) {
      errors.address = { invalid: true, message: "Address is required" };
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

  const autocompleteChangeListener = (e, value, name) => {
    setCustomer((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  // const handleOnContactPersonAdd = (receivedPerson) => {
  //   if (!editContact) {
  //     setCustomer((currentState) => {
  //       let currentCustomer = {
  //         ...currentState,
  //         contactPerson: [
  //           ...(currentState?.contactPerson || []),
  //           receivedPerson,
  //         ],
  //       };
  //       return currentCustomer;
  //     });
  //   } else {
  //     const editedContact = { ...editContact };
  //     const updatedReceivedPerson = { ...receivedPerson };
  //     delete updatedReceivedPerson.index;
  //     setCustomer((currentState) => {
  //       const currentCustomer = { ...currentState };
  //       const currentCustomerContacts = [...currentState.contactPerson];
  //       currentCustomerContacts[editedContact.index] = {
  //         ...updatedReceivedPerson,
  //       };
  //       currentCustomer.contactPerson = [...currentCustomerContacts];
  //       return currentCustomer;
  //     });
  //     setEditContact(null);
  //   }
  // };

  const handleOnContactPersonAdd = (receivedPerson) => {
    if (!editContact) {
      setContactPerson((prev) => [...prev, receivedPerson])
    } else {
      const editedContact = { ...editContact };
      const updatedReceivedPerson = { ...receivedPerson };
      delete updatedReceivedPerson.index;
      setContactPerson((currentState) => {
        const currentSupplierContacts = [...currentState];
        currentSupplierContacts[editedContact.index] = {
          ...updatedReceivedPerson,
        };
        return currentSupplierContacts;
      });
      setEditContact(null);
    }
  }

  // const handleTriggerEdit = (index) => {
  //   setEditContact({ ...customer.contactPerson[index], index: index });
  // };

  const handleTriggerEdit = (index) => {
    setEditContact({ ...contactPerson[index], index: index });
  };

  // const handleTriggerDelete = (contactIndex) => {
  //   setCustomer((currentState) => {
  //     const currentCustomer = { ...currentState };
  //     currentCustomer.contactPerson = currentCustomer.contactPerson?.filter?.(
  //       (contact, index) => index !== contactIndex
  //     );
  //     return currentCustomer;
  //   });
  // };

  const handleTriggerDelete = (contactIndex) => {
    setContactPerson((currentState) => {
      const currentContact = currentState.filter((contact, index) => index != contactIndex);
      return currentContact;
    });
  };


  return (
    <>
      {isLoading && <LoadingSpinner />}

      <h1 className="pageHead">Edit a customer</h1>
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

        {!isLoading && (
          <div>
            <form action="" id="customerForm" onSubmit={submitHandler}>
              <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
                <div className="grid grid-6-col">

                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.name.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Name"
                        value={customer.customer_name}
                        error={formErrors.name.invalid}
                        onChange={inputChangeHandler}
                        name="customer_name"
                        id="name"
                      />
                      {formErrors.name.invalid && (
                        <FormHelperText>
                          {formErrors.name.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.address.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Correspondence address"
                        value={customer.address}
                        onChange={inputChangeHandler}
                        error={formErrors.address.invalid}
                        name="address"
                        id="address"
                      />
                      {formErrors.address.invalid && (
                        <FormHelperText>
                          {formErrors.address.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.telephone.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Telephone"
                        value={customer.telephoneno}
                        error={formErrors.telephone.invalid}
                        onChange={inputChangeHandler}
                        onInput={validatePhoneNumber}
                        name="telephoneno"
                        id="telephone"
                      />
                      {formErrors.telephone.invalid && (
                        <FormHelperText>
                          {formErrors.telephone.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Fax No"
                        value={customer.faxno}
                        onChange={inputChangeHandler}
                        name="faxno"
                        id="fax"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="CST No."
                        value={customer.cst}
                        onChange={inputChangeHandler}
                        name="cst"
                        id="cstNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="GST No."
                        value={customer.gstno}
                        onChange={inputChangeHandler}
                        name="gstno"
                        id="gstNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        disablePortal
                        size="small"
                        name="state"
                        options={states || []}
                        value={customer.state}
                        onChange={(e, value) =>
                          autocompleteChangeListener(e, value, "state")
                        }
                        getOptionLabel={(option) => option}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField {...params} label="State" fullWidth />
                        )}
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl error={formErrors.city.invalid} fullWidth size="small">
                      <Autocomplete
                        disablePortal
                        size="small"
                        name="city"
                        options={places || []}
                        value={customer.city || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(e, value, "city")
                        }
                        getOptionLabel={(option) => option.place_name}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField {...params} label="City" fullWidth />
                        )}
                      />
                      {formErrors.city.invalid && (
                        <FormHelperText>
                          {formErrors.city.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>

                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.email.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Email"
                        value={customer.emailid}
                        error={formErrors.email.invalid}
                        onChange={inputChangeHandler}
                        name="emailid"
                        id="email"
                      />
                      {formErrors.email.invalid && (
                        <FormHelperText>
                          {formErrors.email.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Vendor Code"
                        value={customer.vendor_code}
                        onChange={inputChangeHandler}
                        name="vendor_code"
                        id="vendorCode"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="VAT No"
                        value={customer.vatno}
                        onChange={inputChangeHandler}
                        name="vatno"
                        id="vatNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="ECC No"
                        value={customer.eccno}
                        onChange={inputChangeHandler}
                        name="eccno"
                        id="eccNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Opening balance"
                        value={customer.openingbal}
                        onChange={inputChangeHandler}
                        onInput={validateNumber}
                        name="openingbal"
                        id="openingBalance"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        autoSelect
                        size="small"
                        name="openingbaltype"
                        options={["Credit", "Debit"]}
                        value={customer.openingbaltype || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(
                            e,
                            value,
                            "openingbaltype"
                          )
                        }
                        openOnFocus
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Balance type"
                            fullWidth
                          />
                        )}
                      />
                    </FormControl>
                  </div>

                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Closing balance"
                        value={customer.closingbal}
                        onChange={inputChangeHandler}
                        onInput={validateNumber}
                        name="closingbal"
                        id="closingBalance"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        autoSelect
                        size="small"
                        name="closingbaltype"
                        options={["Credit", "Debit"]}
                        value={customer.closingbaltype || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(
                            e,
                            value,
                            "closingbaltype"
                          )
                        }
                        openOnFocus
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Balance type"
                            fullWidth
                          />
                        )}
                      />
                    </FormControl>
                  </div>
                </div>
              </Paper>
            </form>

            <div className="bl_contact_person">
              <div className="bl_form">
                <ContactPersonForm
                  onContactPersonAdd={handleOnContactPersonAdd}
                  editContact={editContact}
                />
              </div>
              <div className="bl_content">
                {formErrors.contactPerson.invalid && (
                  <Stack
                    sx={{
                      width: "100%",
                      margin: "0 0 30px 0",
                      border: "1px solid red",
                      borderRadius: "4px",
                    }}
                    spacing={2}
                  >
                    <Alert severity="error">
                      {formErrors.contactPerson.message}
                    </Alert>
                  </Stack>
                )}
                <ContactPersonList
                  contactPersons={contactPerson}
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
      </div>
    </>
  );
};

export default CustomerEdit;
