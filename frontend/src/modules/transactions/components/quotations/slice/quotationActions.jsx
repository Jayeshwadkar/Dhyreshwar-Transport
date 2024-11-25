import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function fetchPlaces() {
  const url = `api/master/getPlaces`;
  return fetchFromApiServer("GET", url);
}

export function addQuotation(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/addQuotation`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchQuotation(id) {
  const url = `api/transactions/getQuotation/${id}`;
  return fetchFromApiServer("GET", url, {});
}

export function modifyQuotation(requestObject) {
  const url = `api/transactions/updateQuotation`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchQuotations() {
  const url = `api/transactions/getQuotations`;
  return fetchFromApiServer("GET", url, {});
}

export function removeQuotation(id) {
  const url = `api/transactions/removeQuotation/${id}`;
  return fetchFromApiServer("POST", url, {
    id: id,
    updatedBy: getEmpId(),
  });
}

export function viewQuotationFile({ id, email }) {
  const url = `api/transactions/viewQuotation/${id}`;
  return fetchFromApiServer("POST", url, { email: email });
}
