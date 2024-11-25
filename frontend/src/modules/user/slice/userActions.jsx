import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function verifyUser(requestObject) {
  const url = `api/user/login`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function addUser(requestObject) {
  const url = `api/user/signupAdmin`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchUserDetail(userId) {
  const url = `api/user/getUser/${userId}`;
  return fetchFromApiServer("GET", url, "");
}

export function modifyUserDetail(requestObject) {
  console.log(requestObject)
  const url = `api/user/updateUser/${requestObject.id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url, "");
}

export function fetchEmployees() {
  const url = `api/master/getEmployees`;
  return fetchFromApiServer("GET", url, "");
}

export function fetchEmployeesforuserReg() {
  const url = `api/master/getEmployeesForUserReg`;
  return fetchFromApiServer("GET", url, "");
}

export function fetchUsersByBranch(branchId) {
  const url = `api/user/getUsersByBranch/${branchId}`;
  return fetchFromApiServer("GET", url, "");
}

export function modifyUserPermissions(requestObject) {
  const url = `api/user/updateUserPermissions`;
  requestObject.updatedBy = getEmpId();
  return fetchFromApiServer("POST", url, requestObject);
}

export function addUserRegister(requestObject) {
  const url = `api/user/signup`;
  requestObject.createdBy = getEmpId();
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchUsers() {
  const url = `api/user/getUsers`;
  return fetchFromApiServer("GET", url, "");
}

export function removeUserById(id) {
  const url = `api/user/removeUser/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}

export function findUser(search) {
  const url = `api/user/getSearchedUsers`;
  return fetchFromApiServer("POST", url, { search });
}
