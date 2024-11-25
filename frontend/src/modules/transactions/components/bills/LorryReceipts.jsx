import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Autocomplete, Button, Divider, TextField } from "@mui/material";
import { FixedSizeList as List } from 'react-window';
import { getFormattedDate } from "../../../../services/utils";
import { FormControl } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from 'dayjs';
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomers,
} from "../lorry-receipts/slice/lorryReceiptSlice";
import { getLorryReceiptsForBilldetials } from "./slice/billSlice";

const LorryReceipts = ({ lorryReceipts, setLRForBill, bill, setBill, handleFreightDetails, defaultcheck, rowsData }) => {

  const { branches, customers } = useSelector(({ bill }) => bill) || {};
  const { places } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );

  const getDescription = (lr) => {
    // return `${places.filter(place => place?.place_id == lr.from_loc)[0]?.place_name} to ${places.filter(place => place?.place_id == lr.to_loc)[0]?.place_name}`;
    return `${lr.from_loc} to ${lr.to_loc}`;
  };
  // console.log("lorryReceipts", lorryReceipts)
  const [filterLR, setFilteredLR] = useState(lorryReceipts);
  const [date, setDate] = useState({
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-28')
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  useEffect(() => {
    setFilteredLR(lorryReceipts)
  }, [lorryReceipts])

  const getArticleOrWeight = (lr) => {
    return lr.transactions?.reduce?.((total, current) => {
      return total + +current.articleNo;
    }, 0);
  };

  const fetchLrs = (value) => {
    if (value) {
      const filterData = lorryReceipts.filter(lr => lr.lrNo.toString().includes(value));
      setFilteredLR(filterData);
    } else {
      setFilteredLR(lorryReceipts);
    }
  }

  const columns = [
    // { field: "id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    {
      field: "lrNo",
      headerName: "LR no.",
      renderCell: (params) => {
        return `${params.row.lrNo}`;
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      renderCell: (params) => {
        return getDescription(params.row);
      },
    },
    {
      field: "noofarticles",
      headerName: "Articles",
      flex: 1,
      // renderCell: (params) => {
      //   return getArticleOrWeight(params.row);
      // },
    },
    {
      field: "eWayBillNo",
      headerName: "Way bill no & date",
      flex: 1,
      renderCell: (params) => {
        if (params.row.eWayBillNo) {
          // return (`${params.row.eWayBillNo} ${params.row.lr_date}`);
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div
                style={{ flex: 1, wordWrap: 'break-word', text: 'wrap' }}
                title={params.row.eWayBillNo}
              >
                {params.row.eWayBillNo.slice(0, 8)}{params.row.eWayBillNo.length > 8 ? '..' : ""}
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>{params.row.lr_date}</div>
            </div>
          );
        } else {
          return (params.row.lr_date);
        }
      },
    },
    { field: "invoiceNo", headerName: "Memo no.", flex: 1 },
    { field: "vehicleNo", headerName: "Vehicle no", flex: 1 },
    {
      field: "total",
      headerName: "Amount",
      flex: 1,
      renderCell: (params) => {
        return <strong>₹ {Number(params.row.total)?.toFixed?.(2)}</strong>;
      },
    },
  ];

  const [selectedLR, setSelectedLR] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterData, setFilterData] = useState({
    filterLR: "",
    startDate: null,
    endDate: null,
    consignee: "",
    click: false
  })
  const [row, setRow] = useState([])
  useEffect(() => {
    setSelectAll(!lorryReceipts?.some?.((lr) => !lr.checked));
    setSelectedLR(bill.lrList);
  }, [bill.lrList?.length]);

  const submitHandler = (e) => {
    e.preventDefault();
    setBill((currState) => {
      return {
        ...currState,
        lrList: [...selectedLR],
      };
    });
  };
  useEffect(() => {
    if (defaultcheck === 1 && lorryReceipts.length > 0) {
      const selectedId = lorryReceipts[0].id;
      setSelectedIds((prevIds) => [...prevIds, selectedId]);
    }
  }, [defaultcheck, lorryReceipts])

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.checked;
    const updatedLR = lorryReceipts?.map?.((lr) => {
      if (lr.id === name) {
        lr.checked = value;
      }
      return lr;
    });
    setSelectedLR(updatedLR?.filter?.((lr) => lr.checked));
    setSelectAll(updatedLR?.every?.((lr) => lr.checked));
  };
  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({ searchName: target.value }));
  };
  const selectAllChangeHandler = (e) => {
    setSelectAll(e.target.checked);
    const updatedLR = lorryReceipts?.map?.((lr) => {
      lr.checked = e.target.checked;
      return lr;
    });
    setSelectedLR(updatedLR?.filter?.((lr) => lr.checked));
  };

  useEffect(() => {
    if (bill.lrList.length > 0) {
      setSelectedIds(bill.lrList)
    }
  }, [bill.lrList])

  useEffect(() => {
    if (rowsData?.length > 0) {
      setRow(rowsData.map((item, index) => ({
        ...item,
        srNo: index + 1,
      })))
    } else {
      setRow([])
      setSelectedIds([])
    }
  }, [rowsData])

  const searchChangeHandler = (e) => {
    let search = e.target.value;
    setFilterData((prev) => ({ ...prev, filterLR: search, click: false }))
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setFilterData(prev => ({ ...prev, click: true }));
    }
  };
  useEffect(() => {
    handleFreightDetails(filterData);
  }, [filterData]);

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
  }, [date]);

  const autocompleteChangeListener = (value, name) => {
    if (typeof value === 'object') {
      setFilterData((prev) => ({ ...prev, consignee: value }))
      return
    } else {
      setFilterData((prev) => ({ ...prev, consignee: '' }))
    }

  };

  const dateChangeHandler = (name, dateNew) => {
    setFilterData((prev) => ({
      ...prev,
      [name]: dateNew ? new Date(dayjs(dateNew).format("YYYY-MM-DD")) : null
    }));
  };
  const handleCheckboxChange = useCallback((id) => {
    setSelectedIds((prevSelectedIds) => {
      const updatedSelectedIds = prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id];
      return updatedSelectedIds;
    });
  }, []);

  useEffect(() => {
    setBill((currState) => {
      return {
        ...currState,
        lrList: selectedIds,
      };
    });
  }, [row]);

  const Addhandler = async () => {
    if (selectedIds.length > 0) {
      try {
        setRow([])
        const { payload = {} } = await dispatch(getLorryReceiptsForBilldetials(selectedIds))
        console.log("bill data : ", payload.data)
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
          setBill((prev) => ({ ...prev, totalAmount: totalPrice }))
        }
      } catch (error) {
        // setHttpError(
        //   "Something went wrong! Please try later or contact Administrator."
        // );
      }
    }
  }

  const Row = ({ index, style }) => {
    const startIndex = index * 6;
    const items = lorryReceipts.slice(startIndex, startIndex + 6);
    return (
      <div
        style={{
          ...style,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              width: "calc(100% / 6 - 10px)",
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
              {item.lr_no}
            </label>
          </div>
        ))}

        {Array.from({ length: 6 - items.length }).map((_, i) => (
          <div
            key={`empty-${index}-${i}`}
            style={{
              width: "calc(100% / 6 - 10px)",
              marginBottom: "6px",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-7-col">
        <div className="grid-item">
          <h2 className="mb20 text-inline">Lorry receipts</h2>
        </div>
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
                inputFormat="DD-MM-YYYY"
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
                inputFormat="DD-MM-YYYY"
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
        {/* 
        {filterLR?.length > 0 && (
          <div className="grid-item">
            <FormControlLabel
              className="groupCheckbox"
              key="selectAll"
              control={
                <Checkbox
                  name="selectAll"
                  size="small"
                  checked={selectAll}
                  onChange={selectAllChangeHandler}
                />
              }
              label={
                <span
                  style={{
                    fontSize: "0.9em",
                    display: "inline-block",
                    lineHeight: "1em",
                  }}
                >
                  Select all
                </span>
              }
            />
          </div>
        )} */}
      </div>
      <List
        height={170} // Height of the container
        itemCount={Math.ceil(lorryReceipts.length / 6)} // Calculate total rows based on groups of 6
        itemSize={50} // Row height
        width={"100%"} // Width of the container
      >
        {Row}
      </List>
      {/* <form action="" onSubmit={submitHandler} id="lrSelectionForm">
        {lorryReceipts?.length === 0 && (
          <p>No lorry receipts found for billing!</p>
        )}
           */}
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
      {/* </form> */}
      <Divider sx={{ margin: "20px 0" }} />
      <DataGrid
        sx={{ backgroundColor: "primary.contrastText" }}
        autoHeight
        density="compact"
        getRowId={(row) => row._id || Math.random()}
        rows={row.map((lr, key) => {
          return {
            ...lr,
            srNo: key + 1
          }
        })}
        columns={columns}
        initialState={{
          ...columns,
          columns: {
            columnVisibilityModel: {
              _id: false,
            },
          },
        }}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
      />
    </>
  );
};

export default LorryReceipts;
