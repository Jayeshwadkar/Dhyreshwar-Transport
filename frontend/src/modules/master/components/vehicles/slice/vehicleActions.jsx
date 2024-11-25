import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function addVehicle(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addVehicle`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchVehicle(id) {
  const url = `api/master/getVehicle/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyVehicle(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updateVehicle/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchVehicles() {
  const url = `api/master/getVehicleList`;
  return fetchFromApiServer("GET", url);
}

export function fetchVehiclesBySearch(data) {
  const url = `api/master/getVehicleListBySearch`;
  return fetchFromApiServer("POST", url, data);
}

export function fetchVehiclesByPage(data) {
  const url = `api/master/getVehicleListByPage`;
  return fetchFromApiServer("POST", url, data);
}

export function fetchVehicleTaxDetails(id) { //new create
  const url = `api/master/getVehicleTaxDetails/${id}`;
  return fetchFromApiServer("GET", url);
}

export function removeVehicle(id) {
  const url = `api/master/removeVehicle/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}

export function fetchVehicleTypes() {
  const url = `api/master/getVehicleTypes`;
  return fetchFromApiServer("GET", url);
}

export function fetchSuppliers() {
  const url = `api/master/getSuppliers`;
  return fetchFromApiServer("GET", url);
}
