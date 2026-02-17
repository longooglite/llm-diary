import fs from 'fs';
import path from 'path';

const ARTIFACT_ROOT = path.join(process.cwd(), 'docs/artifacts');

export const writeArtifact = (type: 'daily' | 'weekly' | 'monthly', id: string, content: string) => {
    const dirMap = {
        daily: 'daily',
        weekly: 'weekly',
        monthly: 'monthly'
    };

    const targetDir = path.join(ARTIFACT_ROOT, dirMap[type]);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${id}.md`;
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[ArtifactWriter] Saved artifact to ${filePath}`);

    return filePath;
};
