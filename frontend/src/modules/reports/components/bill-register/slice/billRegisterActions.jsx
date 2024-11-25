import fetchFromApiServer from "@services/api";

export function verifyUser(requestObject) {
  const url = `api/user/login`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchBillsForReport(requestObject) {
  const url = `api/transactions/getBillsForReport`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function viewBillsReport(requestObject) {
  const url = `api/transactions/downloadBillsReport`;
  return fetchFromApiServer("BLOB", url, requestObject);
}
export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url);
}

export function fetchCustomers() {
  const url = `api/master/getCustomers`;
  return fetchFromApiServer("GET", url);
}
