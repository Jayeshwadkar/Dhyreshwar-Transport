import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url);
}

export function fetchCustomers() {
  const url = `api/master/getCustomers`;
  return fetchFromApiServer("GET", url);
}

export function addBill(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/addBill`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLorryReceiptsByConsignor(requestObject) {
  const url = `api/transactions/getLorryReceiptsByConsignor`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLorryReceiptsByConsignorEdit(requestObject) {
  const url = `api/transactions/getLorryReceiptsByConsignorEdit`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLorryReceiptsForBilldetails(selectedIds) {
  const url = `api/transactions/fetchLorryReceiptsForBilldetails`;
  return fetchFromApiServer("POST", url, selectedIds);
}

export function printBill({ id, email }) {
  const url = `api/transactions/printBill/${id}`;
  return fetchFromApiServer("POST", url, { email: email });
}

export function fetchBills(requestObject) {
  const url = `api/transactions/getBills`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchBillsByBranch(requestObject) {
  const url = `api/transactions/getBillsByBranch`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchBillsBySearch(requestObject) {
  const url = `api/transactions/getBillsBySearch`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function removeBill(id) {
  const url = `api/transactions/removeBill/${id}`;
  return fetchFromApiServer("DELETE", url, {
    id: id,
    updatedBy: getEmpId(),
  });
}

export function fetchBill(id) {
  const url = `api/transactions/getBill/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyBill(requestObject) {
  requestObject.updatedBy = getEmpId();

  const url = `api/transactions/updateBill/${requestObject.id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function exportToExcelBill({ id }) {
  const url = `api/transactions/exportToExcelBill/${id}`;
  return fetchFromApiServer("BLOB", url);
}
