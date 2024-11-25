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
export function fetchVehicles() {
  const url = `api/master/getVehicles`;
  return fetchFromApiServer("GET", url);
}
export function fetchSuppliers() {
  const url = `api/master/getSuppliers`;
  return fetchFromApiServer("GET", url);
}
export function fetchPlaces() {
  const url = `api/master/getPlaces`;
  return fetchFromApiServer("GET", url);
}
export function fetchDrivers() {
  const url = `api/master/getDrivers`;
  return fetchFromApiServer("GET", url);
}

export function addLoadingSlip(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/addLoadingSlip`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLorryReceiptsForLS({ page, isLocalMemo, branch, search, freightDetails }) {
  const url = `api/transactions/getLorryReceiptsForLS`;
  return fetchFromApiServer("POST", url, { page, isLocalMemo, branch, search, freightDetails });
}

export function fetchLorryReceiptsForLSedit({ page, isLocalMemo, branch, search, freightDetails,id }) {
  const url = `api/transactions/getLorryReceiptsForLSedit`;
  return fetchFromApiServer("POST", url, { page, isLocalMemo, branch, search, freightDetails,id });
}

export function fetchLorryReceiptsForLSdetails(selectedIds) {
  const url = `api/transactions/fetchLorryReceiptsForLSdetails`;
  return fetchFromApiServer("POST", url, selectedIds);
}
export function printLoadingSlip({ id, email }) {
  const url = `api/transactions/printLoadingSlip/${id}`;
  return fetchFromApiServer("POST", url, { email: email });
}

export function fetchLorryReceipts({ branch, isModule }) {
  const url = `api/transactions/getLorryReceipts`;
  return fetchFromApiServer("POST", url, { branch, type: isModule });
}

export function removeLoadingSlip(id) {
  const url = `api/transactions/removeLoadingSlip/${id}`;
  return fetchFromApiServer("DELETE", url, {
    id: id,
    updatedBy: getEmpId(),
  });
}

export function fetchLoadingSlip(id) {
  const url = `api/transactions/getLoadingSlip/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyLoadingSlip(requestObject) {
  requestObject.updatedBy = getEmpId();

  const url = `api/transactions/updateLoadingSlip/${requestObject.id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}
export function fetchLoadingSlips(requestObject) {
  const url = `api/transactions/getLoadingSlips`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLoadingSlipsSearch(requestObject) {
  const url = `api/transactions/getLoadingSlipsSearch`;
  return fetchFromApiServer("POST", url, requestObject);
}
