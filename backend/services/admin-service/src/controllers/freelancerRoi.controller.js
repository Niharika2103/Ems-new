import { fetchFreelancerRoiReport } from "../services/freelancerRoi.service.js";

export const getFreelancerRoiReport = async (req, res) => {
  try {
    const data = await fetchFreelancerRoiReport();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error in getFreelancerRoiReport:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
