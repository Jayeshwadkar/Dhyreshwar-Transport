import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function addVehicleType(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addVehicleType`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchVehicleType(id) {
  const url = `api/master/getVehicleType/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyVehicleType(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updateVehicleType/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchVehicleTypesBySearch(data) {
  const url = `api/master/getVehicleTypesBySearch`;
  return fetchFromApiServer("POST", url, data);
}

export function fetchVehicleTypesByPage(data) {
  const url = `api/master/getVehicleTypesByPage`;
  return fetchFromApiServer("POST", url, data);
}

export function fetchVehicleTypes() {
  const url = `api/master/getVehicleTypes`;
  return fetchFromApiServer("GET", url);
}

export function removeVehicleType(id) {
  const url = `api/master/removeVehicleType/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}
