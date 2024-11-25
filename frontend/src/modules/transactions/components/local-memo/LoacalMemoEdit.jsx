import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
	TextField,
	FormControl,
	FormHelperText,
	Button,
	Paper,
	Divider,
	Autocomplete,
	InputLabel,
	Checkbox,
	FormControlLabel,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { LoadingSpinner } from "../../../../ui-controls";
import {
	base64ToObjectURL,
	mobileNoRegEx,
	validateNumber,
	validatePhoneNumber,
} from "../../../../services/utils";
import FreightDetails from "./FreightDetails";
import { useDispatch, useSelector } from "react-redux";
import {
	downloadLoadingSlip,
	getLoadingSlip,
	getLorryReceipts,
	selectIsLoading,
	updateLoadingSlip,
	getLorryReceiptsForLS,
	getLorryReceiptsForLSedit
} from "./../loading-slips/slice/loadingSlipSlice";
import {
	getLocalMemo,
	getLorryReceiptsForLMedit,
	updateLocalMemo,
	downloadLocalMemo
} from "./slice/localMemoSlice";
import CustomSnackbar from "../../../../components/ui/SnackbarComponent";

const initialState = {
	branch: "",
	date: new Date(),
	vehicle: null,
	vehicleNo: "",
	supplier: "",
	vehicleOwner: "",
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

const LocalMemoEdit = () => {
	const isLoading = useSelector(selectIsLoading);

	const user = useSelector((state) => state.user);
	const isSuperAdminOrAdmin = () => user.type.toLowerCase() === 'superadmin';
	const { branches, vehicles, suppliers, places, drivers, customers } =
		useSelector(({ loadingslip }) => loadingslip) || {};

	const [lorryReceipts, setLorryReceipts] = useState([]);

	const [loadingSlip, setLoadingSlip] = useState({
		...initialState,
	});
	const [fetchedLoadingSlip, setFetchedLoadingSlip] = useState({
		...initialState,
	});
	const [checkboxes, setCheckboxes] = useState({
		whatsapp: false,
		emailConsigner: false,
		emailConsignee: false,
		print: true,
	});
	const [isConfirmationopen, setConfirmationopen] = useState(false);
	const [confirmmessage, setConfirmmessage] = useState("")
	const [snackColour, setColor] = useState("")
	const [formErrors, setFormErrors] = useState(initialErrorState);
	const [httpError, setHttpError] = useState("");
	const [lsLrList, setLsLrList] = useState([]);
	const [updatedLrList, setUpdatedLRList] = useState([]);
	const [isLocalMemo, setIsLocalMemo] = useState(false);
	const [isModule, setIsModule] = useState("");
	const [freightDetails, setFreightDetails] = useState([])
	const [loading, setLoading] = useState(false)
	const [rowsData, setRowsData] = useState([])

	const dispatch = useDispatch();

	const navigate = useNavigate();
	const location = useLocation();
	const { lsId } = location.state;

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

	const goToLoadingSlips = useCallback(() => {
		navigate("/transactions/loadingSlips");
	}, [navigate]);

	const goToLocalMemo = useCallback(() => {
		navigate("/transactions/localMemoList");
	}, [navigate]);

	useEffect(() => {
		if (location.pathname) {
			if (location.pathname?.endsWith("addLocalMemoLS")) {
				setIsLocalMemo(true);
				setIsModule("localMemoLS");
			} else {
				setIsLocalMemo(false);
				setIsModule("loadingSlip");
			}
		}
	}, [location.pathname]);


	useEffect(() => {
		const fetchLorryReceipts = async () => {
			if (isModule) {
				if (loadingSlip.branch?.branch_id) {
					setLoading(true);
					try {
						const { payload = {} } = await dispatch(getLorryReceiptsForLMedit({
							// page,
							isLocalMemo,
							branch: loadingSlip.branch?.branch_id,
							freightDetails: freightDetails,
							id: lsId
						}));

						const { message, lorryReceipts } = payload?.data || {};
						if (message) {
							setHttpError(message);
						} else {
							const { lorryReceipts, isLastPage, checkbox } = payload?.data || {};
							// setDefaultcheck(checkbox)
							setLorryReceipts(lorryReceipts);
							console.log("hhiihihi,done", payload?.data)
							setLoading(false);
						}
					} catch (error) {
						setHttpError(
							"Something went wrong! Please try later or contact Administrator."
						);
					}
				}
			}
		};

		fetchLorryReceipts();
	}, [isModule, loadingSlip.branch, isLocalMemo, freightDetails]);

	const handleCheckboxChange = (event) => {
		const { name, checked } = event.target;
		setCheckboxes({
			...checkboxes,
			[name]: checked,
		});
	};
	const handleFreightDetails = (
		filterData
	) => {
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
		if (lsId && vehicles?.length && drivers?.length) {
			dispatch(getLocalMemo(lsId))
				.then(({ payload = {} }) => {
					console.log("ls data : ", payload)
					const { message, vehicleNo, driver_id, from, to, paybleAt, rowDetails } =
						payload?.data || {};
					if (message) {
						setHttpError(message);
					} else {
						setHttpError("");
						setFormErrors(initialErrorState);
						let response = { ...(payload?.data || {}) };
						const vehicleIndex = vehicles
							?.map?.((vehicle) => vehicle.vehicle_id)
							?.indexOf?.(vehicleNo);
						console.log("index vec : ", vehicleIndex)
						response.vehicle = vehicles[vehicleIndex];
						const driverIndex = drivers
							?.map?.((driver) => driver.driver_id)
							?.indexOf?.(driver_id);
						response.driver = drivers[driverIndex];
						const fromIndex = places
							?.map?.((place) => place.place_id)
							?.indexOf?.(from);
						response.from = places[fromIndex];
						const toIndex = places?.map?.((place) => place.place_id)?.indexOf?.(to);
						response.to = places[toIndex];
						const paybleIndex = branches
							?.map?.((branch) => branch.branch_id)
							?.indexOf?.(paybleAt);
						response.paybleAt = branches[paybleIndex];
						response.branch = branches?.find?.(
							({ branch_id }) => branch_id === response.branch
						);
						response.ackBranch = branches?.find?.(
							({ branch_id }) => branch_id === response.ackBranch
						);
						const filterSupplier = suppliers.filter(supplier => supplier.supplier_id === response.supplier);

						setLoadingSlip({ ...response, vehicleOwner: filterSupplier[0] || null, vehicleOwnerEmail: filterSupplier[0]?.email || "" });
						setFetchedLoadingSlip({ ...response, vehicleOwner: filterSupplier[0] || null });
						setRowsData(rowDetails)
					}
				})
				.catch((error) => {
					setHttpError(error.message);
				});
		}
	}, [lsId, vehicles, drivers, places, branches]);

	useEffect(() => {

		const selectedLRList = lorryReceipts?.map?.((lorryReceipt) => {
			return {
				...lorryReceipt,
				checked: loadingSlip.lrList?.some?.((lr) => {
					return lr._id === lorryReceipt._id;
				}),
			};
		});
		setLsLrList(selectedLRList);

	}, [lorryReceipts, loadingSlip.lrList]);

	const resetButtonHandler = () => {
		setLoadingSlip(fetchedLoadingSlip);
		setHttpError("");
		setFormErrors(initialErrorState);
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
		if (!validateForm({ ...loadingSlip })) {
			const updatedLoadingSlip = { ...loadingSlip };
			// console.log("UP LS : ", updatedLoadingSlip)
			// updatedLoadingSlip.lrList = lsLrList?.filter?.((lr) => lr.checked);
			setLoading(true)
			dispatch(updateLocalMemo({
				...updatedLoadingSlip,
				vehicleOwner: updatedLoadingSlip.vehicleOwner.supplier_id,
				branch: updatedLoadingSlip.branch.branch_id,
				from: updatedLoadingSlip.from.place_id,
				to: updatedLoadingSlip.to.place_id,
				vehicle: updatedLoadingSlip.vehicle.vehicle_id,
				driver: updatedLoadingSlip.driver.driver_id,
			}))
				.then(({ payload = {} }) => {
					const { message, data, inserted_id } = payload?.data || {};
					console.log(data, inserted_id)
					if (message) {
						setHttpError(message);
					} else {
						if (checkboxes.emailConsigner) {

							if (inserted_id) {

								dispatch(
									downloadLocalMemo({
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
								dispatch(
									downloadLocalMemo({ id: inserted_id, email: "" })
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
													winPrint.focus();
													winPrint.print();
													r2 = 1
													setHttpError("");
													setFormErrors(initialErrorState);
													setLoadingSlip(initialState);
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
							if (isLocalMemo) {
								goToLocalMemo();
							} else {
								// goToLoadingSlips();
							}
						}

					}
					if (data) {
						setConfirmmessage(data);
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
		if (!validateForm({ ...loadingSlip })) {
			const updatedLoadingSlip = { ...loadingSlip };
			// console.log("UP LS : ", updatedLoadingSlip)
			// updatedLoadingSlip.lrList = lsLrList?.filter?.((lr) => lr.checked);
			setLoading(true)
			dispatch(updateLocalMemo({
				...updatedLoadingSlip,
				vehicleOwner: updatedLoadingSlip.vehicleOwner.supplier_id,
				branch: updatedLoadingSlip.branch.branch_id,
				from: updatedLoadingSlip.from.place_id,
				to: updatedLoadingSlip.to.place_id,
				vehicle: updatedLoadingSlip.vehicle.vehicle_id,
				driver: updatedLoadingSlip.driver.driver_id,
			}))
				.then(({ payload = {} }) => {
					const { message, data, inserted_id } = payload?.data || {};
					console.log(data, inserted_id)
					if (message) {
						setHttpError(message);
					} else {
					
							if (isLocalMemo) {
								goToLocalMemo();
							} else {
								// goToLoadingSlips();
							}
						

					}
					if (data) {
						setConfirmmessage(data);
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

	const handleSelectedLr = (lr) => {
		setUpdatedLRList(lr);
	};

	const autocompleteChangeListener = (e, option, name) => {
		if (!option) {
			console.error("Invalid value passed to autocompleteChangeListener");
			return;
		}

		setLoadingSlip((currState) => {
			return {
				...currState,
				[name]: option,
			};
		});
		if (name === "vehicle") {
			if (option && option.vehicle_id) {
				const selectedVehicle = vehicles?.find?.(
					(vehicle) => vehicle.vehicle_id === option.vehicle_id
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
					(supplier) => supplier.supplier_id === option.supplier_id
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
						vehicleOwnerEmail: ""
					};
				});
			}
		}

		if (name === "driver") {
			if (option && option.driver_id) {
				const driver = drivers?.find?.((driver) => driver.driver_id === option.driver_id);
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
				const from = places?.find?.((place) => place.place_id === option.place_id);
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
				const to = places?.find?.((place) => place.place_id === option.place_id);
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
		const total =
			// +loadingSlip.toPay +
			+loadingSlip.hire -
			+loadingSlip.advance -
			+loadingSlip.commission +
			+loadingSlip.hamali
		// +loadingSlip.stacking -
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

	return (
		<>
			{(isLoading || loading) && <LoadingSpinner />}
			<div className="inner-wrap">
				<h1 className="pageHead">
					{isLocalMemo
						? "Update a local memo loading slip"
						: "Update a loading slip"}
				</h1>
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
				<form action="" onSubmit={saveAndPrint} id="loadingSlipForm">
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
											disabled
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
											value={loadingSlip.from}
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
											value={loadingSlip.to}
											onChange={(e, value) =>
												autocompleteChangeListener(e, value, "to")
											}
											openOnFocus
											getOptionLabel={(from) => from.place_name}
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

							</div>

							<div className="grid-item">
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
											value={loadingSlip.vehicle}
											onChange={(e, value) =>
												autocompleteChangeListener(e, value, "vehicle")
											}
											openOnFocus
											getOptionLabel={(option) => option.vehicleno}
											onKeyDown={(e) => focusTo(e, "driver")}
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
											value={loadingSlip.driver}
											getOptionLabel={option => option.driver_name}
											onChange={(e, value) =>
												autocompleteChangeListener(e, value, "driver")
											}
											openOnFocus
											id="driver"
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
											inputProps={{ readOnly: true }}
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
						setLorryReceipts={setLsLrList}
						handleSelectedLr={handleSelectedLr}
						branches={branches}
						places={places}
						handleFreightDetails={handleFreightDetails}
						rowsData={rowsData}
					/>
					<Divider sx={{ margin: "20px 0" }} />
					<form action="" onSubmit={submitHandler} id="loadingSlipForm">
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

export default LocalMemoEdit;
