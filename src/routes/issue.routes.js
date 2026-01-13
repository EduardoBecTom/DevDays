import { Router } from "express";
import { getAllIssues, getIssueByIssueId, fetchGithubIssues, clearAllIssues } from "../controllers/issue.controller.js";

const issueRouter = Router();

issueRouter.get('/issues', getAllIssues);
issueRouter.get('/issues/:issueId', getIssueByIssueId);
issueRouter.post('/issues/fetch', fetchGithubIssues);
issueRouter.post('/issues/clear', clearAllIssues);

export { issueRouter };