const glob = require('glob');
const { Storage } = require('@google-cloud/storage');
const Client = require('../source/javascripts/core/api/client').default;

function getPath() {
  const prID = process.env.BITRISE_PULL_REQUEST;
  if (prID) {
    return `wfe/pr-${prID}`;
  }
  if (process.env.BITRISE_GIT_BRANCH === 'master') {
    return 'wfe/production';
  }
  return null;
}

const headers = {
  Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
};

async function createComment(path) {
  const commentsURL = `https://api.github.com/repos/${process.env.BITRISEIO_GIT_REPOSITORY_OWNER}/${process.env.BITRISEIO_GIT_REPOSITORY_SLUG}/issues/${process.env.BITRISE_PULL_REQUEST}/comments`;

  const { data: comments } = await Client.get(commentsURL, { headers });
  const existing = comments.find((comment) => comment.body.includes('Storybook uploaded to'));
  console.log(existing)
  //if (!existing) {
    await Client.post(commentsURL, {
      body: `Storybook uploaded to: https://storybook.services.bitrise.dev/projects/${path}/`,
      headers,
    });
  //}
}

async function uploadFiles() {
  if (!process.env.STORYBOOK_GCP_DEPLOY_BUCKET || !process.env.STORYBOOK_GCP_DEPLOY_KEY) {
    throw new Error('Storybook deploy config not found!');
  }

  const auth = JSON.parse(process.env.STORYBOOK_GCP_DEPLOY_KEY);
  const storage = new Storage({ projectId: auth.project_id, credentials: auth }).bucket(
    process.env.STORYBOOK_GCP_DEPLOY_BUCKET,
  );

  const path = getPath();
  if (!path) {
    throw new Error('Deploy target not found!\nStorybook can only be deployed to a PR, or to the `master` branch.');
  }
  const files = glob.sync('**', { nodir: true, cwd: 'storybook-static' });
  let count = 1;

  await Promise.all(files.map(async (file) => {
    await storage.upload(`storybook-static/${file}`, { destination: `${path}/${file}` });
    console.log(`[${count++}/${files.length}] ${file}`);
  }));

  storage.file(`${path}/robots.txt`).createWriteStream({ resumable: false }).end('User-agent: *\nDisallow: /\n');
  console.log(
    `Storybook uploaded to: https://storybook.services.bitrise.dev/projects/${path}/`,
  );

  if (process.env.BITRISE_PULL_REQUEST) {
    try {
      await createComment(path);
    } catch (err) {
      console.log(err.toString());
    }
  }
}

uploadFiles().catch((err) => {
  console.log(err.toString());
  process.exit(1);
});
