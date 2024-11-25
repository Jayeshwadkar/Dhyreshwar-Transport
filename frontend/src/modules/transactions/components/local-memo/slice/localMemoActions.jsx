import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url);
}

export function fetchPlaces() {
  const url = `api/master/getPlaces`;
  return fetchFromApiServer("GET", url);
}

export function addLoadingSlip(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/addLoadingSlip`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLoadingSlips(requestObject) {
  const url = `api/transactions/getLocalMemos`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLocalMemoSearch(requestObject) {
  const url = `api/transactions/getLocalMemoSearch`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchLocalMemo(id) {
  const url = `api/transactions/getLocalMemo/${id}`;
  return fetchFromApiServer("GET", url);
}

export function removeLoadingSlip(id) {
  const url = `api/transactions/removeLocalMemo/${id}`;
  return fetchFromApiServer("DELETE", url, {
    id: id,
    updatedBy: getEmpId(),
  });
}

export function printLoadingSlip({ id, email }) {
  const url = `api/transactions/printLoadingSlip/${id}`;
  return fetchFromApiServer("POST", url, { email: email });
}


export function fetchLorryReceiptsForLocalMemo({ page, isLocalMemo, branch, search, freightDetails }) {
  const url = `api/transactions/getLorryReceiptsForLocalMemo`;
  return fetchFromApiServer("POST", url, { page, isLocalMemo, branch, search, freightDetails });
}

export function fetchLorryReceiptsForLMedit({ page, isLocalMemo, branch, search, freightDetails, id }) {
  const url = `api/transactions/getLorryReceiptsForLMedit`;
  return fetchFromApiServer("POST", url, { page, isLocalMemo, branch, search, freightDetails, id });
}

export function addLocalMemo(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/transactions/addLocalMemo`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function modifyLocalMemo(requestObject) {
  requestObject.updatedBy = getEmpId();

  const url = `api/transactions/updateLocalMemo/${requestObject.id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function printLocalMemo({ id, email }) {
  const url = `api/transactions/printLocalMemo/${id}`;
  return fetchFromApiServer("POST", url, { email: email });
}