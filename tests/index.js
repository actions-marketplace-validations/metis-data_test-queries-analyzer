const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const { context } = require('@actions/github');
const octokit = github.getOctokit(core.getInput('github_token'));

const { pull_request } = context.payload;
const testName = pull_request?.title?.replace('#', '');

const commentPr = async () => {
  try {
    const urlPrefix = core.getInput('target_url') || `https://app.metisdata.io`;
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request.number,
      body: `Metis just analyzed the SQL commands generated by the test. View the results in the link: ${encodeURI(
        `${urlPrefix}/projects/${core.getInput('metis_api_key')}/test/${testName}`
      )}`,
    });
  } catch (error) {
    console.error(error);
    core.setFailed(error);
  }
};

const createNewTest = async () => {
  try {
    const urlPrefix = core.getInput('target_url') || `https://app.metisdata.io`;
    const res = await axios.post(`${urlPrefix}/api/tests/create`, {
      name: testName,
      apiKey: core.getInput('metis_api_key'),
    });
    console.log(res);
  } catch (error) {
    console.error(error);
    core.setFailed(error);
  }
};

try {
  const context = github.context;

  core.getInput('metis_api_key');
  const pullRequest = context.payload.pull_request;
  console.log(pullRequest.title);
  core.setOutput('pr_tag', pullRequest.title?.replace('#', '') || 'Action not trigger from pr');
  createNewTest();
  commentPr();
} catch (error) {
  console.error(error);
  core.setFailed(error);
}
