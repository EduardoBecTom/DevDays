import Issue from '../models/issue.model.js';

const findAll = async () => {
    return await Issue.find();
};

const findByIssueId = async (issueId) => {
    return 
    await Issue.findOne({ issueId });
};

const create = async (issueData) => {  
    const issue = new Issue(issueData);
    return await issue.save();
};

const deleteAll = async () => {
    return await Issue.deleteMany({});
};

export default {
    findAll,
    create,
    findByIssueId,
    deleteAll,
};