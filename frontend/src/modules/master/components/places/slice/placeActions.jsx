import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function addPlace(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addPlace`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchPlace(id) {
  const url = `api/master/getPlace/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyPlace(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updatePlace/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchPlaces() {
  const url = `api/master/getPlaces`;
  return fetchFromApiServer("GET", url);
}

export function fetchPlacesBySearch(filterData) {
  const url = `api/master/getPlacesBySearch`;
  return fetchFromApiServer("POST", url, filterData);
}

export function fetchPlacesByPage(filterData) {
  const url = `api/master/getPlacesByPage`;
  return fetchFromApiServer("POST", url, filterData);
}

export function removePlace(id) {
  const url = `api/master/removePlace/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}
