import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    console.log('Running test');
    // const token = 'a';
    const secretToken = process.env.BODYMOVIN_PERSONAL_TOKEN || 'none secret';
    console.log('secretToken', secretToken.length);
    const octokit = github.getOctokit(secretToken);
    const result = await octokit.rest.repos.createDispatchEvent({
      owner: 'lottie-animation-community',
      repo: 'tests',
      event_type: 'trigger-tests',
      client_payload: {},
    });
    console.log('result', result);
  } catch (error) {
    console.log('RUN ERROR: ', error);
  }
}

try {
  run();
} catch (error) {
  console.log('FAILED', error);
}
