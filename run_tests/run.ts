import core from '@actions/core';
import github from '@actions/github';

async function run() {
  try {
    console.log('Running test');
    // const token = 'a';
    const secretToken = process.env.GITHUB_TOKEN || 'none secret';
    console.log('secretToken', secretToken.length);
    const octokit = github.getOctokit(secretToken);
    console.log(typeof octokit);
    await octokit.rest.repos.createDispatchEvent({
      owner: 'bodymovin',
      repo: 'test',
      event_type: 'trigger-test',
      client_payload: {},
    });
  } catch (error) {
    console.log('RUN ERROR: ', error);
  }
}

try {
  run();
} catch (error) {
  console.log('FAILED', error);
}
