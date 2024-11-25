import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { TextField, FormControl, FormHelperText, Button } from "@mui/material";
import {
  emailRegEx,
  mobileNoRegEx,
  validatePhoneNumber,
} from "../../../../services/utils";

const initialErrorState = {
  name: {
    invalid: false,
    message: "",
  },
  phone: {
    invalid: false,
    message: "",
  },
  email: {
    invalid: false,
    message: "",
  },
};

const initialState = {
  person_name: "",
  address: "",
  designation: "",
  emailid: "",
  phone: "",
};

const ContactPersonForm = ({ onContactPersonAdd, editContact }) => {
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [contactPerson, setContactPerson] = useState(initialState);

  useEffect(() => {
    if (editContact) {
      setContactPerson(editContact);
    }
  }, [editContact]);

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setContactPerson((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.person_name?.trim?.()) {
      errors.name = { invalid: true, message: "Name is required" };
    }
    if (!formData.phone?.trim?.()) {
      errors.phone = { invalid: true, message: "Phone is required" };
    }
    if (
      formData.phone?.trim?.() !== "" &&
      !mobileNoRegEx.test(formData.phone)
    ) {
      errors.phone = {
        invalid: true,
        message: "Mobile number should be 10 digits number",
      };
    }
    if (formData.emailid !== "" && !emailRegEx.test(formData.emailid)) {
      errors.email = { invalid: true, message: "Email is invalid" };
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

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(contactPerson)) {
      onContactPersonAdd(contactPerson);
      setFormErrors(initialErrorState);
      setContactPerson(initialState);
    }
  };

  return (
    <form action="" id="contactPersonForm" onSubmit={submitHandler}>
      <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Contact person
        </Typography>
        <div className="grid grid-3-col">
          <div className="grid-item">
            <FormControl fullWidth error={formErrors.name.invalid}>
              <TextField
                size="small"
                variant="outlined"
                label="Contact person name"
                value={contactPerson.person_name}
                error={formErrors.name.invalid}
                onChange={inputChangeHandler}
                name="person_name"
                id="name"
              />
              {formErrors.name.invalid && (
                <FormHelperText>{formErrors.name.message}</FormHelperText>
              )}
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl fullWidth>
              <TextField
                size="small"
                variant="outlined"
                label="Address"
                value={contactPerson.address}
                onChange={inputChangeHandler}
                name="address"
                id="address"
              />
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl fullWidth>
              <TextField
                size="small"
                variant="outlined"
                label="Designation"
                value={contactPerson.designation}
                onChange={inputChangeHandler}
                name="designation"
                id="designation"
              />
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl fullWidth error={formErrors.email.invalid}>
              <TextField
                size="small"
                variant="outlined"
                label="Email"
                value={contactPerson.emailid}
                error={formErrors.email.invalid}
                onChange={inputChangeHandler}
                name="emailid"
                id="email"
              />
              {formErrors.email.invalid && (
                <FormHelperText>{formErrors.email.message}</FormHelperText>
              )}
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl fullWidth error={formErrors.phone.invalid}>
              <TextField
                size="small"
                variant="outlined"
                label="Mobile"
                value={contactPerson.phone}
                error={formErrors.phone.invalid}
                onChange={inputChangeHandler}
                onInput={validatePhoneNumber}
                name="phone"
                id="phone"
              />
              {formErrors.phone.invalid && (
                <FormHelperText>{formErrors.phone.message}</FormHelperText>
              )}
            </FormControl>
          </div>
        </div>
        <div className="right">
          <Button
            variant="contained"
            size="medium"
            type="submit"
            color="primary"
            form="contactPersonForm"
          >
            {editContact ? "Update" : "Add"}
          </Button>
        </div>
      </Paper>
    </form>
  );
};

export default ContactPersonForm;
