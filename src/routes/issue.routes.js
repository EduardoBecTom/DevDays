import { Router } from "express";
import { getAllIssues, getIssueByIssueId, fetchGithubIssues, clearAllIssues } from "../controllers/issue.controller.js";
import { httpMetricsMiddleware } from "../middlewares/prometheus.middleware.js";

const issueRouter = Router();

issueRouter.get('/issues', httpMetricsMiddleware, getAllIssues);
issueRouter.get('/issues/:issueId', httpMetricsMiddleware, getIssueByIssueId);
issueRouter.post('/issues/fetch', httpMetricsMiddleware, fetchGithubIssues);
issueRouter.post('/issues/clear', httpMetricsMiddleware, clearAllIssues);

export { issueRouter };