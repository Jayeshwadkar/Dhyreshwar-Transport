import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function addBranch(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addBranch`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchBranch(id) {
  const url = `api/master/getBranch/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyBranch(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updateBranch/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchBranches() {
  const url = `api/master/getBranchList`;
  return fetchFromApiServer("GET", url);
}

export function fetchBranchesBySearch(filterData) {
  const url = `api/master/getBranchesBySearch`;
  return fetchFromApiServer("POST", url, filterData);
}

export function fetchBranchesByPage(filterData) {
  const url = `api/master/getBranchesByPage`;
  return fetchFromApiServer("POST", url, filterData);
}

export function removeBranch(id) {
  const url = `api/master/removeBranch/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}

export function fetchPlaces() {
  const url = `api/master/getPlaces`;
  return fetchFromApiServer("GET", url);
}
