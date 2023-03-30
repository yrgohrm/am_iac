export default {
    async getHighscore(gameName) {
        let resp = await fetch(`/api/highscore/${gameName}`);
        
        if (!resp.ok) {
            throw new Error(`Failed to get highscore for ${gameName}`);
        }

        let data = await resp.json();
        return data?.entries;
    },

    async setHighscore(gameName, name, score) {
        let resp = await fetch(`/api/highscore/${gameName}`, {
            method: 'POST',
            body: JSON.stringify({name, score})
        });

        if (!resp.ok) {
            throw new Error(`Failed to set highscore for ${gameName}`);
        }
    }
}