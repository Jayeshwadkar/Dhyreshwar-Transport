import fetchFromApiServer from "@services/api";

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

export function fetchLoadingSlipForReport(requestObject) {
  const url = `api/transactions/getLoadingSlipForReport`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLRChallanReport(requestObject) {
  const url = `api/transactions/downloadLSReport`;
  return fetchFromApiServer("BLOB", url, requestObject);
}
