import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url);
}

export function addCustomer(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addCustomer`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchCustomer(id) {
  const url = `api/master/getCustomer/${id}`;
  return fetchFromApiServer("GET", url);
}

export function fetchCustomerContactPer(id) { //new create
  const url = `api/master/getCustomerContactPer/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyCustomer(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updateCustomer/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchCustomers() {
  const url = `api/master/getCustomers`;
  return fetchFromApiServer("GET", url);
}

export function downloadCustomers(data) {
  const url = `api/master/downloadCustomers`;
  return fetchFromApiServer("BLOB", url, data);
}

export function fetchCustomersBySearch(filterData) {
  const url = `api/master/getCustomersBySearch`;
  return fetchFromApiServer("POST", url, filterData);
}

export function fetchCustomersByPage(filterData) {
  const url = `api/master/getCustomersByPage`;
  return fetchFromApiServer("POST", url, filterData);
}

export function removeCustomer(id) {
  const url = `api/master/removeCustomer/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}
