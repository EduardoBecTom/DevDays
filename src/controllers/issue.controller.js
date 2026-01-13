import issueService from '../services/issue.service.js';

export const getAllIssues = async (req, res) => {
    try {
        const issues = await issueService.getAllIssues();
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getIssueByIssueId = async (req, res) => {
    const issueId = req.params.issueId;
    try {
        const issue = await issueService.getIssueByIssueId(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const fetchGithubIssues = async (req, res) => {
    const repoOwner = req.body.repository.owner;
    const repoName = req.body.repository.name;

    try {
        const githubIssues = await issueService.fetchGithubIssues(repoOwner, repoName);
        const savedIssues = await issueService.saveIssues(githubIssues);

        // Si el servicio nos devolvió datos pero hubo un límite de tasa en el camino,
        // podríamos querer avisar al usuario. 
        res.status(200).json({
            message: "Proceso completado",
            count: savedIssues.length,
            data: savedIssues
        });

    } catch (error) {
        console.error('Error en el controlador:', error.message);
        console.log(error);

        // CAPTURA DEL RATE LIMIT (403)
        if (error.response && error.response.status === 403) {
            const resetTime = error.response.headers['x-ratelimit-reset'];
            const waitMinutes = Math.ceil((new Date(resetTime * 1000) - new Date()) / 1000 / 60);

            return res.status(403).json({
                error: 'GitHub API Rate Limit Exceeded',
                message: `Límite de la API alcanzado. Inténtalo de nuevo en ${waitMinutes} minutos.`,
                resetAt: new Date(resetTime * 1000).toLocaleString()
            });
        }

        // Cualquier otro error sigue siendo un 500
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const clearAllIssues = async (req, res) => {
    try {
        await issueService.clearAllIssues();
        res.status(200).json({ message: 'All issues cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};