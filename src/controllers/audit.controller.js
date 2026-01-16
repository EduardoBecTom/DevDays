import auditService from '../services/audit.services.js';

export const getAllAudits = async (req, res) => {
 try {
  const audits = await auditService.getAllAudits();
  res.status(200).json(audits);
 } catch (error) {
  res.status(500).json({ message: 'Internal server error' });
 }
};

export const getAuditById = async (req, res) => {
 const auditId = req.params.auditId;
 try {
  const audit = await auditService.getAuditById(auditId);
  if (!audit) {
   return res.status(404).json({ message: 'Audit not found' });
  }
  res.status(200).json(audit);
 } catch (error) {
  res.status(500).json({ message: 'Internal server error' });
 }
};

export const auditIssues = async (req, res) => {
 try {
  const githubIssues = await auditService.auditIssues();
  res.status(200).json(githubIssues);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

export const auditWeatherLast4Weeks = async (req, res) => {
  try {
    const { city, threshold } = req.body || {};

    if (!city || typeof city !== "string" || city.trim() === "") {
      return res.status(400).json({ message: "Field 'city' is required (string)." });
    }

    const t = threshold === undefined ? 18 : Number(threshold);
    if (!Number.isFinite(t)) {
      return res.status(400).json({ message: "Field 'threshold' must be a number." });
    }

    // Si tu service espera (city, threshold):
    const auditRecord = await auditService.auditWeatherLast4Weeks({ city, threshold: t });

    return res.status(200).json(auditRecord);
  } catch (error) {
    console.error("auditWeatherLast4Weeks error:", error);

    // Si en el service lanzas "City not found: X"
    if ((error?.message || "").toLowerCase().includes("city not found")
        || (error?.message || "").toLowerCase().includes("ciudad no encontrada")) {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};