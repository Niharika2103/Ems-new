// src/services/Freelancer.services.js
import {
  updateFreelancerDocuments,
  getFreelancerDocuments,
} from "../models/Freelancer.models.js";

export const saveFreelancerDocumentsService = async (id, documentJson,gstNumber) => {
  const jsonString = JSON.stringify(documentJson);
  return await updateFreelancerDocuments(id, jsonString,gstNumber);
};

export const getFreelancerDocumentsService = async (id) => {
  return await getFreelancerDocuments(id);
};
