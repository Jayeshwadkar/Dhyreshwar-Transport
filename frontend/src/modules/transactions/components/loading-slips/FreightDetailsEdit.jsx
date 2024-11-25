import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, Divider, TextField } from "@mui/material";
import dayjs from 'dayjs';
import {  FormControl } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { AutoComplete } from "../../../../ui-controls";
import {
  getCustomers,
} from "../lorry-receipts/slice/lorryReceiptSlice";
import { useDispatch } from "react-redux";

const FreightDetailsEdit = ({
  loadingSlip,
  setLoadingSlip,
  customers,
  lorryReceipts,
  setLorryReceipts,
  handleSelectedLr,
  branches,
  places
}) => {
  const columns = [
    { field: "_id", headerName: "Id" },
    { field: "srNo", headerName: "SR.No" },
    {
      field: "lrNo",
      headerName: "LR no.",
      flex: 1,
    },
    {
      field: "consignorName",
      headerName: "Consignor",
      flex: 1,
    },
    { field: "from", headerName: "From", flex: 1 },
    {
      field: "consigneeName",
      headerName: "Consignee",
      flex: 1,
    },
    { field: "to", headerName: "To", flex: 1 },
    { field: "articleNo", headerName: "Article No", flex: 1 },
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

  const [initial, setInitial] = useState(true);
  const [updatedLR, setUpdatedLR] = useState([]);
  const [selectedLR, setSelectedLR] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [date, setDate] = useState({
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-28')
  });

  const dispatch = useDispatch();

  useEffect(() => {    
    dispatch(getCustomers());
  }, []);

  useEffect(() => {
    if (lorryReceipts?.length) {
      const updatedLorryReceipts = [...lorryReceipts];
      updatedLorryReceipts?.forEach?.((lr, key) => {
        let weight = 0;
        let articleNo = 0;
        lr.transactions?.forEach?.((transaction) => {
          weight += +transaction.weight;
          articleNo += +transaction.articleNo;          
        });
        lr.weight = weight;
        lr.articleNo = articleNo;
      //  lr.srNo = key + 1;
        // lr.checked = false;
        lr.show = true;
      });

      setUpdatedLR(updatedLorryReceipts);
    } else {
      setUpdatedLR([]);
    }
  }, [lorryReceipts, customers]);

  useEffect(() => {
    if (updatedLR?.length && initial) {
      let _total = 0;
      setSelectedLR(
        updatedLR?.filter?.((lr) => {
          if (lr.checked) {
            _total += lr.total;
          }
          return lr.checked;
        })
      );
      setTotal(_total);
      setInitial(false);
      
    }
  }, [updatedLR, initial]);

  useEffect(() => {
    handleSelectedLr(selectedLR);
  }, [selectedLR, handleSelectedLr]);

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.checked;
    setUpdatedLR((currState) => {
      const updatedState = [...currState];
      updatedState?.forEach?.((lr) => {
        if (lr._id === name) {
          lr.checked = value;
        }
      });
      return updatedState;
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    let _total = 0;
    setSelectedLR(
      updatedLR?.filter?.((lr) => {
        if (lr.checked) {
          _total += lr.total;          
        }
        return lr.checked;
      })
    );
    setTotal(_total);
    setLoadingSlip((prev) => ({ ...prev, toPay: _total }));
    document.getElementById("search").focus();
  };

  const searchChangeHandler = (e) => {
    let search = e.target.value;
    setSearch(search)
    if (search) {
      setUpdatedLR((currState) => {
        const updatedLR = currState;
        updatedLR?.map?.((lr) => {
          return lr.show = lr.lrNo.toString().includes?.(search);
        });
        return updatedLR;
      });
    } else {
      setUpdatedLR((currState) => {
        const updatedLR = currState;
        updatedLR?.forEach?.((lr) => {
          lr.show = true;
        });
        return updatedLR;
      });
    }
  };

  
  const customerFilterOptions = ({ target }) => {
    dispatch(getCustomers({searchName: target.value}));
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
    setUpdatedLR(filterData);
   }, [date]);


 
   const autocompleteChangeListener = (value, name) => {  
     
     if(typeof value === 'object') {
       const filterData = lorryReceipts.filter(lr =>  lr.consignee != value._id);     
       setUpdatedLR(filterData);
     }
   };
   
   const dateChangeHandler = (name, dateNew) => {    
     setDate((currState) => {      
       return {
         ...currState,
         [name]: new Date(dayjs(dateNew).format("YYYY-MM-DD"))
       };
     });
   };


  return (
    <>
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
              value={search}
              onChange={searchChangeHandler}
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
                  value={date.startDate || null}                 
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
                  value={date.endDate || null}                  
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
                <AutoComplete
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
                  getOptionLabel={(customer) => customer.name}
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
      <div className="bl_lrCheckboxes">
        <form action="" onSubmit={submitHandler} id="lrSelectionForm">
          <FormGroup className="checkboxGroup">
            <div className="grid grid-8-col">
            {updatedLR?.length > 0 &&
              updatedLR?.map?.((lr, key) =>
                lr.show ? (
                  <FormControlLabel
                    className="groupCheckbox"
                    key={key + 1}
                    control={
                      <Checkbox
                        name={lr._id}
                        size="small"
                        checked={lr.checked}
                        onChange={inputChangeHandler}
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
                      {`${branches.filter(({_id}) => _id === lr.branch)[0]?.branchCode}-${lr.lrNo}`}
                      </span>
                    }
                  />
                ) : null
              )}
            </div>
          </FormGroup>
        </form>
      </div>
      <div className="right">
        <Button
          variant="contained"
          size="medium"
          type="submit"
          color="primary"
          form="lrSelectionForm"
          className="ml6"
          id="handleUpdate"
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
          getRowId={(row) => row._id}
          rows={selectedLR.map((lr, key) => {
            return {
              ...lr,
              srNo: key + 1, 
            lrNo: branches.filter(branch => branch._id === lr.branch)[0]?.branchCode + "-" + lr.lrNo,
            from: places.filter(place => place._id === lr.from)[0]?.name,
            to: places.filter(place => place._id === lr.to)[0]?.name,
            };
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
        <div
          style={{ display: 'flex', justifyContent: 'space-between', paddingTop: "10px", paddingRight: "10px" }}
        >
          <p>
            Total No of Article : <strong>{selectedLR.reduce( (total, num) => total + Math.round(Number(num.articleNo)), 0)}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Total Charge Weight : <strong>{selectedLR.reduce( (total, num) => total + Math.round(Number(num.weight)), 0)}</strong>
          </p>
          <p>
            Total To Pay: <strong> ₹ {total?.toFixed?.(2)}</strong>
          </p>
        </div>
      </div>
    </>
  );
};

export default FreightDetailsEdit;