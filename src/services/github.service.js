import axios from 'axios';

const headers = {
    'Accept': 'application/vnd.github.v3+json'
};

if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
}

const githubClient = axios.create({
    baseURL: 'https://api.github.com',
    headers: headers
});


export const fetchAllPages = async (url, accumulatedData = []) => {
    try {

        const response = await githubClient.get(url);
        const newData = accumulatedData.concat(response.data);
        const linkHeader = response.headers.link;
        const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
        const nextUrl = nextMatch ? nextMatch[1] : null;

        if (nextUrl) {
            return await fetchAllPages(nextUrl, newData);
        }

        return newData;

    } catch (error) {
        console.error(`Error consultando GitHub (${url}):`, error.message);
        throw error;
    }
};