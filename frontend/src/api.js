// src/api.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const instance = axios.create({
  baseURL: API_BASE + "/api",
});

export function setAuthToken(token) {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("access_token", token);
  } else {
    delete instance.defaults.headers.common["Authorization"];
    localStorage.removeItem("access_token");
  }
}

export default instance;
