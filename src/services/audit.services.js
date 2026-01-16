import auditRepository from '../repositories/audit.repository.js';
import IssueRepository from '../repositories/issue.repository.js';
import weatherService from '../services/weather.service.js';
import dateUtils from '../utils/date.js';

export const getAllAudits = async () => {
    return await auditRepository.findAll();
};

export const getAuditById = async (id) => {
    return await auditRepository.findByAuditId(id);
};

export const auditIssues = async () => {
    const issues = await IssueRepository.findAll();
    const issuesWithBugInTitle = issues.filter(issue => /bug/i.test(issue.title));
    const totalIssues = issues.length;
    const ratioWithBugInTitle = totalIssues === 0 ? 0 : issuesWithBugInTitle.length / totalIssues;

    const auditRecord = {
        auditId: `audit-${Date.now()}`,
        createdAt: new Date(),
        compliant: ratioWithBugInTitle <= 0.50,
        metadata: {
            totalIssues: totalIssues,
            issuesWithBugInTitle: issuesWithBugInTitle.length,
            ratioWithBugInTitle: ratioWithBugInTitle,
            operation: 'ratioWithBugInTitle <= 0.50'
        },
        evidences: issuesWithBugInTitle
    };

    const auditCreated = await auditRepository.create(auditRecord);
    return auditCreated;
};




export const auditWeatherLast4Weeks = async ({ city, threshold = 18 }) => {
    if (!city || typeof city !== "string") {
        throw new Error("city is required");
    }
    const thr = Number(threshold);
    if (!Number.isFinite(thr)) {
        throw new Error("threshold must be a number");
    }
    const todayUTC = new Date();

    const oneWeekAgo = new Date(Date.UTC(
        todayUTC.getUTCFullYear(),
        todayUTC.getUTCMonth(),
        todayUTC.getUTCDate() - 7
    ));

    const end = dateUtils.endOfWeekSundayUTC(oneWeekAgo); 
    const start = new Date(end.getTime());
    start.setUTCDate(start.getUTCDate() - 27); 

    const meteo = await weatherService.fetchOpenMeteoDaily({
        city,
        start,
        end,
        dailyVars: ["temperature_2m_mean"],
    });

    const { startDate, endDate } = meteo.period;
    const times = meteo.daily?.time || [];
    const temps = meteo.daily?.temperature_2m_mean || [];
    if (times.length !== temps.length) {
        throw new Error("Open-Meteo daily data is inconsistent");
    }

    if (times.length !== 28) {
        throw new Error(`Expected 28 days (4 full weeks), got ${times.length}`);
    }
    const evidences = [];
    for (let w = 0; w < 4; w++) {
        const startIdx = w * 7;
        const endIdx = startIdx + 6;

        const weekTemps = temps.slice(startIdx, endIdx + 1);
        const avg = weekTemps.reduce((a, b) => a + b, 0) / 7;

        evidences.push({
            weekIndex: w + 1,
            start: times[startIdx],
            end: times[endIdx],      
            daysUsed: 7,
            avgTemperature: avg,
            aboveThreshold: avg > thr,
        });
    }

    const compliant = evidences.every(e => e.aboveThreshold);

    const auditRecord = {
        auditId: `audit-weather-4weeks-${city.trim().toLowerCase()}-${Date.now()}`,
        createdAt: new Date(),
        compliant,
        metadata: {
            type: "WEATHER_LAST_4_WEEKS_NATURAL_WEEKS_THRESHOLD",
            city,
            threshold: thr,
            period: { startDate, endDate },
            source: "open-meteo",
            dailyVars: ["temperature_2m_mean"],
            rule: "each natural week (Mon–Sun) avgTemperature > threshold",
            generatedAt: dateUtils.toISODateUTC(new Date()),
        },
        evidences,
    };

    return auditRepository.create(auditRecord);
}



export default {
    auditWeatherLast4Weeks,
    getAllAudits,
    getAuditById,
    auditIssues
};