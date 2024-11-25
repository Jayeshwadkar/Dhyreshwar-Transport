import fetchFromApiServer from "@services/api";
import { getEmpId } from "@services/utils";

export function fetchBranches() {
  const url = `api/master/getBranches`;
  return fetchFromApiServer("GET", url);
}

export function addArticle(requestObject) {
  requestObject.createdBy = getEmpId();
  const url = `api/master/addArticle`;
  return fetchFromApiServer("POST", url, requestObject);
}

export function fetchArticle(id) {
  const url = `api/master/getArticle/${id}`;
  return fetchFromApiServer("GET", url);
}

export function modifyArticle(requestObject) {
  requestObject.updatedBy = getEmpId();
  const url = `api/master/updateArticle/${requestObject._id}`;
  return fetchFromApiServer("PUT", url, requestObject);
}

export function fetchArticles() {
  const url = `api/master/getArticles`;
  return fetchFromApiServer("GET", url);
}

export function fetchArticlesBySearch(filterData) {
  const url = `api/master/getArticlesBySearch`;
  return fetchFromApiServer("POST", url, filterData);
}

export function fetchAllArticlesByPage(filterData) {
  const url = `api/master/getAllArticlesByPage`;
  return fetchFromApiServer("POST", url, filterData);
}

export function removeArticle(id) {
  const url = `api/master/removeArticle/${id}`;
  return fetchFromApiServer("DELETE", url, { id: id, updatedBy: getEmpId() });
}
