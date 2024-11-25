import React, { useState, useEffect, memo, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Box, Button, Divider, Grid, TextField } from "@mui/material";
import dayjs from 'dayjs';
import { FormControl, Autocomplete, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { AutoComplete, LoadingSpinner } from "../../../../ui-controls";
import {
  getCustomers,
} from "../lorry-receipts/slice/lorryReceiptSlice";
import { useDispatch } from "react-redux";
import { getLorryReceiptsForLSdetials } from "./slice/loadingSlipSlice";
import { FixedSizeList as List } from 'react-window';

const scrollableBoxStyle = {
  height: '400px',
  width: '100%',
  overflowY: 'auto',
};



const FreightDetails = ({
  loadingSlip,
  setLoadingSlip,
  customers,
  lorryReceipts,
  branches,
  places,
  defaultcheck,
  handleSearch,
  handleFreightDetails,
  rowsData
}) => {
  const columns = [
    { field: "id", headerName: "Id" },
    { field: "Srno", headerName: "SR.No" },
    {
      field: "lrno",
      headerName: "LR no.",
      flex: 1,
    },
    {
      field: "consigner",
      headerName: "Consignor",
      flex: 1,
    },
    { field: "from_loc", headerName: "From", flex: 1 },
    {
      field: "consignee",
      headerName: "Consignee",
      flex: 1,
    },
    { field: "to_loc", headerName: "To", flex: 1 },
    { field: "noofarticles", headerName: "Article No", flex: 1 },
    { field: "weight", headerName: "Weight", flex: 1 },
    {
      field: "total",
      headerName: "To pay",
      flex: 1,
      type: "number",
      renderCell: (params) => {
        return <strong>₹ {Number(params.row.total)?.toFixed?.(2)}</strong>;
      },
    },
  ];
  const [loading, setLoading] = useState(false)
  const [filteredLR, setFilteredLR] = useState([]);
  const [selectedLR, setSelectedLR] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const handleScroll = useRef();
  const [row, setRow] = useState([])
  const [date, setDate] = useState({
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-28')
  });
  const [filterData, setFilterData] = useState({
    filterLR: "",
    startDate: null,
    endDate: null,
    consignee: "",
    click: false
  })

  const dispatch = useDispatch();

  useEffect(() => {
    if (loadingSlip.lrList.length > 0) {
      setSelectedIds(loadingSlip.lrList)
    }
  }, [loadingSlip.lrList])

  useEffect(() => {
    if (rowsData?.length > 0) {
      setRow(rowsData.map((item, index) => ({
        ...item,
        Srno: index + 1,
      })))
    } else {
      setRow([])
      setSelectedIds([]);
    }
  }, [rowsData])

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  useEffect(() => {
    if (defaultcheck === 1 && lorryReceipts.length > 0) {
      const selectedId = lorryReceipts[0].id;
      setSelectedIds((prevIds) => [...prevIds, selectedId]);
    }
  }, [defaultcheck, lorryReceipts])

  useEffect(() => {
    handleFreightDetails(filterData);
  }, [filterData]);

  const handleCheckboxChange = useCallback((id) => {
    setSelectedIds((prevSelectedIds) => {
      const updatedSelectedIds = prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id];
      return updatedSelectedIds;
    });
  }, []);

  const Addhandler = async () => {
    console.log("add handle hit", selectedIds)
    if (selectedIds.length > 0) {
      try {
        setRow([])
        const { payload = {} } = await dispatch(getLorryReceiptsForLSdetials(selectedIds))
        const { message } = payload?.data || {};
        if (message) {
          setHttpError(message);
        } else {
          const data = payload?.data || {};
          setRow(prevRows => {
            const existingLrnos = prevRows.map(row => row.lrno); // Collect existing lrnos
            const filteredData = data.filter(item => !existingLrnos.includes(item.lrno)); // Filter out duplicates

            const dataWithSrno = filteredData.map((item, index) => ({
              ...item,
              Srno: prevRows.length + index + 1,
            }));

            return [...prevRows, ...dataWithSrno];
          });

          const totalPrice = data.reduce((accumulator, currentItem) => {
            return accumulator + parseFloat(currentItem.total);  // Convert price to number
          }, 0);
          setLoadingSlip((prev) => ({ ...prev, toPay: totalPrice }))
        }
      } catch (error) {
        setHttpError(
          "Something went wrong! Please try later or contact Administrator."
        );
      }
    }
  }


  useEffect(() => {
    setLoadingSlip((currState) => {
      return {
        ...currState,
        lrList: selectedIds,
      };
    });
  }, [row]);
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setFilterData(prev => ({ ...prev, click: true }));
    }
  };
  const submitHandler = (e) => {
    e.preventDefault();
    let _total = 0;
    setSelectedLR(
      filteredLR?.filter?.((lr) => {
        if (lr.checked) {
          _total += parseFloat(lr.total);
        }
        return lr.checked;
      })
    );
    setTotal(_total);
    document.getElementById("search").focus();
  };

  const searchChangeHandler = (e) => {
    let search = e.target.value;
    setFilterData((prev) => ({ ...prev, filterLR: search, click: false }))
  };

  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({ searchName: target.value }));
  };

  const filterByDateRange = (array, startDate, endDate) => {
    // console.log(array, startDate, endDate)
    return array.filter(item => {
      const itemDate = new Date(dayjs(item.date).format("YYYY-MM-DD"));
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  useEffect(() => {
    const filterData = filterByDateRange(lorryReceipts, date.startDate, date.endDate);
    setFilteredLR(filterData);
    const itemDate = new Date(dayjs("2024-09-12").format("YYYY-MM-DD"));
  }, [date]);



  const autocompleteChangeListener = (value, name) => {

    if (typeof value === 'object') {

      // const filterData = lorryReceipts.filter(lr => lr.consignee != value._id);
      // setFilteredLR(filterData);
      setFilterData((prev) => ({ ...prev, consignee: value }))
      return
    } else {
      setFilterData((prev) => ({ ...prev, consignee: '' }))
    }

  };

  const dateChangeHandler = (name, dateNew) => {
    console.log("name : ", name);
    setFilterData((prev) => ({
      ...prev,
      [name]: dateNew ? new Date(dayjs(dateNew).format("YYYY-MM-DD")) : null // Handle null dates
    }));
  };
  const Row = ({ index, style }) => {
    // Calculate the start index for the current row (group of 6 items)
    const startIndex = index * 6;

    // Get the 6 items for this row, or fewer if at the end of the list
    const items = lorryReceipts.slice(startIndex, startIndex + 6);

    return (
      <div
        style={{
          ...style,
          display: "flex", // Display items in a horizontal line
          justifyContent: "space-between", // Add space between the items
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              width: "calc(100% / 6 - 10px)", // Ensure each item takes up 1/6 of the row
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
              style={{ marginRight: "20px", width: "20px", height: "20px" }}
            />
            <label style={{ fontSize: "17px", fontWeight: "normal" }}>
              {item.lrno}
            </label>
          </div>
        ))}
        {/* Add empty placeholders for remaining spaces if fewer than 6 items */}
        {Array.from({ length: 6 - items.length }).map((_, i) => (
          <div
            key={`empty-${index}-${i}`} // Unique key for each empty placeholder
            style={{
              width: "calc(100% / 6 - 10px)", // Same width as the items
              marginBottom: "6px",
            }}
          />
        ))}
      </div>
    );
  };
  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="grid grid-7-col">
        <div className="grid-item">
          <h2 className="mb20 text-inline">Lorry receipts</h2>
        </div>

        <>
          <div className="grid-item">
            <TextField
              size="small"
              variant="outlined"
              label="Filter LR"
              value={filterData.filterLR}
              onChange={searchChangeHandler}
              onKeyPress={handleKeyPress}
              name="search"
              id="search"
            />
          </div>
          <div className="grid-item">
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  inputFormat="YYYY-MM-DD"
                  value={filterData.startDate || null}
                  onChange={dateChangeHandler.bind(null, "startDate")}
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
                  inputFormat="YYYY-MM-DD"
                  value={filterData.endDate || null}
                  onChange={dateChangeHandler.bind(null, "endDate")}
                  inputProps={{
                    readOnly: true,
                  }}
                  renderInput={(params) => (
                    <TextField name="to" size="small" {...params} />
                  )}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="grid-item">
            <FormControl
              fullWidth
              size="small"
            >
              {/* <AutoComplete
                  // disablePortal
                  id="consignee"
                  // freeSolo={!!bill.customer}
                  label="consignee"
                  // open={customers.length}
                  onClose={() => dispatch(getCustomers())}
                  autoSelect
                  size="small"
                  name="consignee"
                  options={customers || []}
                  // value={bill.customer || null}
                  onChange={(e, value) =>
                    autocompleteChangeListener(value, "consignee")
                  }
                  // onBlur={() => dispatch(getCustomers())}
                  getOptionLabel={(customer) => customer.customer_name}
                  openOnFocus
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="consignee"
                      label="Consignee"
                      onChange={(e) => customerFilterOptions(e)}
                      
                      fullWidth
                    />
                  )}
                />                     */}
              <Autocomplete
                disablePortal
                autoSelect
                size="small"
                name="from"
                options={customers || []}
                // filterOptions={handleCustomSearchFrom}
                value={filterData.consignee || null}
                onChange={(e, value) =>
                  autocompleteChangeListener(value, "consignee")
                }
                getOptionLabel={(option) => option.customer_name}
                openOnFocus
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="consignee"
                    label="Consignee"
                    onChange={(e) => customerFilterOptions(e)}
                    fullWidth
                  />
                )}
              />
            </FormControl>
          </div>
        </>

      </div>
      <List
        height={170} // Height of the container
        itemCount={Math.ceil(lorryReceipts.length / 6)} // Calculate total rows based on groups of 6
        itemSize={50} // Row height
        width={"100%"} // Width of the container
      >
        {Row}
      </List>
      {/* <div ref={handleScroll} className="bl_lrCheckboxes"> */}
      {/* <form action="" onSubmit={submitHandler} id="lrSelectionForm">
          <FormGroup className="checkboxGroup">
            <Box style={scrollableBoxStyle}>
              {
                filteredLR.length > 0 ? (
                  <List
                    height={200}
                    itemCount={Math.ceil(filteredLR.length / 5)}
                    itemSize={60}
                    width={'100%'}
                    itemData={{ branches, filteredLR, inputChangeHandler }}
                  >
                    {Row}
                  </List>
                ) : (<Typography>{filteredLR?.length === 0 && <p>No lorry receipts for challan</p>}</Typography>)
              }

            </Box>
            
          </FormGroup>
        </form> */}
      {/* </div> */}
      <div className="right">
        <Button
          variant="contained"
          size="medium"
          type="submit"
          color="primary"
          form="lrSelectionForm"
          className="ml6"
          onClick={Addhandler}
        >
          Update
        </Button>
      </div>
      <Divider sx={{ margin: "20px 0" }} />
      <div style={{ width: "100%" }}>
        <DataGrid
          sx={{ backgroundColor: "primary.contrastText" }}
          autoHeight
          density="compact"
          getRowId={(row) => row.id}
          rows={row}
          columns={columns}
          initialState={{
            ...columns,
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
        />
        <div
          style={{ display: 'flex', justifyContent: 'space-between', paddingTop: "10px", paddingRight: "10px" }}
        >
          <p>
            Total No of Article : <strong>{row.reduce((total, num) => total + Math.round(Number(num.noofarticles)), 0)}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Total Charge Weight : <strong>{row.reduce((total, num) => total + Math.round(Number(num.weight)), 0)}</strong>
          </p>
          <p>
            Total To Pay: <strong> ₹ {row.reduce((total, num) => total + Math.round(Number(num.total)), 0)}</strong>
          </p>
        </div>
      </div>
    </>
  );
};

export default memo(FreightDetails);