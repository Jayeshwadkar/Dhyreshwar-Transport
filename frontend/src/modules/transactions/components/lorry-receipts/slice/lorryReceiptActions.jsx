import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url);
}

export function fetchCustomersLimit(data) {
  const url = `api/master/getCustomersLimit`;
  return fetchFromApiServer("POST", url, data);
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

export function fetchArticles() {
  const url = `api/master/getArticles`;
  return fetchFromApiServer("GET", url);
}
export function fetchEmailFromApi() {

  const url = `api/master/fetchemail`;
  return fetchFromApiServer("GET", url);
}

export function fetchLastLR() {
  const url = `api/transactions/getLastLR`;
  return fetchFromApiServer("GET", url);
}

export function addFONum(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/transactions/addFONum`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function addLorryReceipt(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/addLorryReceipt`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function checkDuplicateLR(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/checkDuplicateLR`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function viewLorryReceipt({ id, email, isWithoutAmount, user, sendmail, message }) {
  const url = `api/transactions/viewLorryReceipt/${id}`;
  return fetchFromApiServer("POST", url, { email, isWithoutAmount, user, sendmail, message });
}




export function fetchLoadingSlips(requestObject) {
  const url = `api/transactions/getLoadingSlips`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function removeLorryReceipt(id) {
  const url = `api/transactions/removeLorryReceipt/${id}`;
  return fetchFromApiServer("DELETE", url, {
    id: id,
    updatedBy: getEmpId(),
  });
}

export function fetchRateMasterByCustomer(id) {
  const url = `api/master/getRateMasterByCustomer/${id}`;
  return fetchFromApiServer("GET", url, "");
}

export function fetchLorryReceipts(branch) {
  const url = `api/transactions/getLorryReceipts`;
  return fetchFromApiServer("POST", url, { branch });
}

export function modifyLorryReceipt(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/transactions/updateLorryReceipt/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchLorryReceipt(id) {
  const url = `api/transactions/getLorryReceipt/${id}`;
  return fetchFromApiServer("GET", url, {});
}

export function fetchLorryReceiptsWithCount(requestObject) {
  const url = `api/transactions/getLorryReceiptsWithCount`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLorryReceiptsBySearch(requestObject) {
  const url = `api/transactions/getLorryReceiptsBySearch`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLRNumber(code) {
  const url = `api/master/getTransactionPrefix/${code}`;
  return fetchFromApiServer("GET", url);
}

export function addLRNumber(requestObject) {
  const url = `api/master/addTransactionPrefix`;
  return fetchFromApiServer("POST", url, requestObject);
}
