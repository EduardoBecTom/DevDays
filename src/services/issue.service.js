import axios from 'axios';
import IssueRepository from '../repositories/issue.repository.js';
import { githubRequestDuration } from '../otel.js';
import { fetchAllPages } from './github.service.js';

const githubClient = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28' // Especificado en la documentación
    },
    timeout: 5000
});

export const getAllIssues = async () => {
    return await IssueRepository.findAll();
};

export const getIssueByIssueId = async (issueId) => {
    return await IssueRepository.findByIssueId(issueId);
};

export const fetchGithubIssues = async (repoOwner, repoName) => {
    const initialUrl = `/repos/${repoOwner}/${repoName}/issues?state=all&per_page=100`;
    
    const issues = await fetchAllPages(initialUrl);
    return issues;
};

export const saveIssues = async (issues) => {
    const savedIssues = [];
    for (const issueData of issues) {
        const existingIssue = await IssueRepository.findByIssueId(issueData.id);
        if (!existingIssue) {
            const newIssue = {
                issueId: issueData.id,
                number: issueData.number,
                title: issueData.title,
                body: issueData.body,
                url: issueData.html_url,
                state: issueData.state,
                createdAt: issueData.created_at,
                updatedAt: issueData.updated_at,
            };
            savedIssues.push(await IssueRepository.create(newIssue));
        } else {
            savedIssues.push(existingIssue);
        }
    };
    return savedIssues;
};

export const clearAllIssues = async () => {
    return await IssueRepository.deleteAll();
};

export default {
    getAllIssues,
    getIssueByIssueId,
    fetchGithubIssues,
    saveIssues,
    clearAllIssues,
};