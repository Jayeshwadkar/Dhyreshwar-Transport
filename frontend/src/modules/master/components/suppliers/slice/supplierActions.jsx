import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function addSupplier(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addSupplier`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchSupplier(id) {
  const url = `api/master/getSupplier/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifySupplier(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updateSupplier/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchSuppliersBySearch(filterData) {
  const url = `api/master/getSuppliersBysearch`;
  return fetchFromApiServer("POST", url, filterData);
}

export function fetchSuppliersByPage(filterData) {
  const url = `api/master/getSuppliersByPage`;
  return fetchFromApiServer("POST", url, filterData);
}

export function fetchSupplierContactPer(id) { //new create
  const url = `api/master/getSupplierContactPer/${id}`;
  return fetchFromApiServer("GET", url);
}

export function fetchSuppliers() {
  const url = `api/master/getSuppliers`;
  return fetchFromApiServer("GET", url);
}
export function removeSupplier(id) {
  const url = `api/master/removeSupplier/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}
