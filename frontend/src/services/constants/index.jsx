//export const API_BASE_PATH = window.env.API_BASE_PATH;
//<------------For Testing------------------>
export const API_BASE_PATH = "https://api1.dhayreshwar.cloudbin.in/"
//<------------------------------>
//<------------For Production------------------>
//export const API_BASE_PATH = "https://api.dhayreshwartransport.com/"
//<------------------------------>

console.log(API_BASE_PATH)
export const DELIVERY_TYPES = [
  { label: "Door", value: 0 },
  { label: "Godown", value: 1 },
  { label: "Office", value: 2 },
];
export const PAY_TYPES = [
  { label: "TBB", value: 0 },
  { label: "ToPay", value: 1 },
  { label: "Paid", value: 2 },
  { label: "FOC", value: 3 },
];
export const TO_BILLED = [
  { label: "Consignor", value: 0 },
  { label: "Consignee", value: 1 },
  { label: "Third party", value: 2 },
];
export const SERVICE_TAX_BY = [
  { label: "Consignor", value: 0 },
  { label: "Consignee", value: 1 },
  { label: "NA", value: 2 },
];
export const PAY_MODE = [
  { label: "By Cash", value: 0 },
  { label: "By Cheque", value: 1 },
];

export const PAYMENT_MODES = [
  { label: "Cash", value: "Cash" },
  { label: "Cheque", value: "Cheque" },
  { label: "NEFT/RTGS", value: "NEFT/RTGS" },
  { label: "Online banking", value: "Online banking" },
];
